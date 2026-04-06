const fileService = require("../services/file.service");
const {
  uploadFile,
  deletePhysicalFile,
} = require("../services/upload.service");
const {
  ERROR_CODES,
} = require("../../shared/response-helpers/response-helper");
const {
  handleError,
  FileErrors,
} = require("../../shared/response-helpers/error-helper");
const {
  SUCCESS_CODES,
  handleSuccess,
} = require("../../shared/response-helpers/success-helper");

// Fájl feltöltése
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      throw FileErrors.invalidFile();
    }

    // Fájl mentése a szerveren
    const uploaded = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Fájl adatainak mentése SQL-be
    const newFile = await fileService.createFile({
      filename: uploaded.filename,
      webpFilename: uploaded.webpFilename,
      originalName: req.file.originalname,
      path: uploaded.path,
      webpPath: uploaded.webpPath,
      url: `${process.env.BACKEND_URL}${uploaded.path}`,
      webpUrl: uploaded.webpPath
        ? `${process.env.BACKEND_URL}${uploaded.webpPath}`
        : null,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    handleSuccess(res, SUCCESS_CODES.FILE.UPLOAD_SUCCESS, newFile);
  } catch (error) {
    handleError(res, error, ERROR_CODES.FILE.UPLOAD_FAILED);
  }
};

// Összes fájl lekérdezése
exports.getFiles = async (req, res) => {
  try {
    const files = await fileService.getFiles();
    handleSuccess(res, SUCCESS_CODES.FILE.QUERY_SUCCESS, files);
  } catch (error) {
    handleError(res, error, ERROR_CODES.FILE.QUERY_FAILED);
  }
};

// Fájl lekérdezése ID alapján
exports.getFileById = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id, true);
    if (!file) throw FileErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.FILE.QUERY_SUCCESS, file);
  } catch (error) {
    handleError(res, error, ERROR_CODES.FILE.QUERY_FAILED);
  }
};

// Fájlok státusz frissítése
exports.updateFileStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const updatedFiles = await fileService.updateFileStatus(ids, status);

    handleSuccess(res, SUCCESS_CODES.FILE.UPDATE_SUCCESS, updatedFiles);
  } catch (error) {
    handleError(res, error, ERROR_CODES.FILE.UPDATE_FAILED);
  }
};

// Fájl törlése
exports.deleteFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) throw FileErrors.notFound();

    // Delete az adatbázisban
    await fileService.removeFile(req.params.id);

    // Fizikai fájlok törlése
    await deletePhysicalFile(file.filename);
    if (file.webpFilename) await deletePhysicalFile(file.webpFilename);

    handleSuccess(res, SUCCESS_CODES.FILE.DELETE_SUCCESS);
  } catch (error) {
    handleError(res, error, ERROR_CODES.FILE.DELETE_FAILED);
  }
};

// Fájlok keresése és lapozása
exports.queryFiles = async (req, res) => {
  try {
    const { pagination, sort, search, filters } = req.body;

    const result = await fileService.queryFiles({
      pagination,
      sort,
      search,
      filters,
    });

    handleSuccess(res, SUCCESS_CODES.FILE.QUERY_SUCCESS, result);
  } catch (error) {
    handleError(res, error, ERROR_CODES.FILE.QUERY_FAILED);
  }
};
