const { File } = require("../../models");
const { Op } = require("sequelize");
const queryDatabase = require("../../shared/database-helpers/query.helper");
const getAdjacentElements = require("../../shared/database-helpers/adjacent-element.helper");

class FileService {
  // Új fájl létrehozása és mentése az adatbázisba
  async createFile({
    filename,
    webpFilename,
    originalName,
    path,
    webpPath,
    url,
    webpUrl,
    mimetype,
    size,
  }) {
    return await File.create({
      filename,
      webpFilename,
      originalName,
      path,
      webpPath,
      url,
      webpUrl,
      mimetype,
      size,
      status: "PUBLISHED",
    });
  }

  // Összes aktív fájl lekérdezése
  async getFiles() {
    return await File.findAll({
      where: { status: "PUBLISHED" },
      order: [["createdAt", "DESC"]],
    });
  }

  // Fájl lekérdezése ID alapján
  async getFileById(id, includeAdjacent = false) {
    const file = await File.findOne({ where: { id } });

    if (!file) {
      return null;
    }

    if (includeAdjacent) {
      try {
        const adjacentElements = await getAdjacentElements({
          id: id,
          model: File,
          orderBy: "createdAt"
        });

        return {
          ...file.toJSON(),
          previousElementId: adjacentElements.previousElementId,
          nextElementId: adjacentElements.nextElementId
        };
      } catch (error) {
        // Ha hiba van az adjacent element lekérdezésben, csak a file-t adjuk vissza
        return file;
      }
    }

    return file;
  }

  // Fájl lekérdezése fájlnév alapján
  async getFileByFilename(filename) {
    return await File.findOne({ where: { filename } });
  }

  // Fájlok státusz frissítése
  async updateFileStatus(ids, status) {
    await File.update({ status }, { where: { id: ids } });

    const updatedFiles = await File.findAll({
      where: {
        id: ids,
      },
    });

    return updatedFiles;
  }

  // Egy fájl törlése
  async removeFile(id) {
    const file = await this.getFileById(id);
    if (!file) {
      return null; // Nem található elem
    }

    // Fájl törlése
    await file.destroy();

    return true;
  }

  // Fájlok keresése és lapozása
  async queryFiles({ pagination, sort, search, filters }) {
    const additionalWhere = {};

    if (filters && filters.fileType) {
      if (filters.fileType[0] === "images") {
        additionalWhere.mimetype = { [Op.like]: "image/%" };
      } else if (filters.fileType[0] === "other") {
        additionalWhere.mimetype = { [Op.notLike]: "image/%" };
      }
      delete filters.fileType;
    }

    return await queryDatabase({
      model: File,
      pagination,
      sort,
      search,
      filters,
      additionalWhere,
    });
  }
}

module.exports = new FileService();
