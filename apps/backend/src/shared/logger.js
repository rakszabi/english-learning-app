const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

// Winston logger létrehozása
const logger = winston.createLogger({
  level: "info", // Minimum log szint (info, warn, error)
  format: winston.format.combine(
    winston.format.timestamp(), // Időbélyeg hozzáadása
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Naplózás fájlba
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log", // Forgatott fájlnevek (pl. app-2024-12-07.log)
      datePattern: "YYYY-MM-DD", // Dátum mintázata
      maxSize: "20m", // Maximális fájlméret 20MB
      maxFiles: "30d", // Legfeljebb 14 napig tartsa meg a fájlokat
      zippedArchive: true, // Régi fájlokat tömörítve mentse
    }),
    // Naplózás konzolra (opcionális)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => {
          return `${level}: ${message}`;
        })
      ),
    }),
  ],
});

module.exports = logger;
