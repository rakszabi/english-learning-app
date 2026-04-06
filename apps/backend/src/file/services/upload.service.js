const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const slugify = require("slugify");
const logger = require("../../shared/logger");

const uploadDir = path.join(__dirname, "../../../uploads");

// Ellenőrzi, hogy létezik-e a fájlnév, és ha igen, sorszámot ad hozzá
async function generateUniqueFilename(directory, originalName) {
  let ext = path.extname(originalName);
  let name = path.basename(originalName, ext);
  let filePath = path.join(directory, `${name}${ext}`);
  let counter = 1;

  while (await fs.pathExists(filePath)) {
    filePath = path.join(directory, `${name}-${counter}${ext}`);
    counter++;
  }

  return path.basename(filePath);
}

// Slugosított WebP név generálása
async function generateUniqueWebpFilename(directory, originalName) {
  let slugName = slugify(
    path.basename(originalName, path.extname(originalName)),
    {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    }
  );

  let webpFilename = `${slugName}.webp`;
  return await generateUniqueFilename(directory, webpFilename);
}

async function uploadFile(fileBuffer, originalName, mimetype) {
  await fs.ensureDir(uploadDir);

  // Fájlnév és kiterjesztés különválasztása
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);

  // Slugosított fájlnév
  const slugifiedName = slugify(baseName, { lower: true, strict: true }) + ext;
  const uniqueFilename = await generateUniqueFilename(uploadDir, slugifiedName);
  const filePath = path.join(uploadDir, uniqueFilename);

  // EXIF orientáció normalizálása, ha kép és nem SVG
  let normalizedBuffer = fileBuffer;
  const isImage =
    mimetype && mimetype.startsWith("image/") && ext.toLowerCase() !== ".svg";

  if (isImage) {
    try {
      normalizedBuffer = await sharp(fileBuffer)
        .rotate()
        .withMetadata({ orientation: 1 })
        .toBuffer();
    } catch (error) {
      logger.warn("Nem sikerült normalizálni az EXIF orientációt:", error);
      normalizedBuffer = fileBuffer;
    }
  }

  // Eredeti fájl mentése slugosított névvel
  await fs.outputFile(filePath, normalizedBuffer);

  // WebP konvertálás, ha kép és nem SVG
  let webpFilename = null;
  if (isImage) {
    try {
      webpFilename = slugify(baseName, { lower: true, strict: true }) + ".webp";
      const webpPath = path.join(uploadDir, webpFilename);
      await sharp(normalizedBuffer)
        .withMetadata({ orientation: 1 })
        .webp({ quality: 80 })
        .toFile(webpPath);
    } catch (error) {
      logger.error("Hiba a WebP konvertálás során:", error.message);
      webpFilename = null;
    }
  }

  return {
    filename: uniqueFilename,
    webpFilename: webpFilename,
    path: `/uploads/${uniqueFilename}`,
    webpPath: webpFilename ? `/uploads/${webpFilename}` : null,
  };
}

// Egy fájl tényleges törlése a szerverről
async function deletePhysicalFile(filename) {
  try {
    const filePath = path.join(uploadDir, filename);
    const fileExists = await fs.pathExists(filePath);

    if (fileExists) {
      await fs.remove(filePath);
    }
  } catch (error) {
    logger.error(`Hiba történt a fájl törlése közben: ${filename}`, error);
  }
}

// Egy fájl szerveroldali útvonalának visszaadása
function getFilePath(filename) {
  return path.join(uploadDir, filename);
}

module.exports = {
  uploadFile,
  deletePhysicalFile,
  getFilePath,
};
