const { ERROR_CODES, errorResponse } = require("./response-helper");
const messages = require("../locales/hu.json");

/**
 * Strukturált error objektum létrehozása
 * @param {string} code - Error kód (pl. "USER.NOT_FOUND")
 * @param {string} message - Felhasználóbarát hibaüzenet
 * @param {any} details - Opcionális részletes információk
 * @returns {Error} Strukturált error objektum
 */
function createError(code, message, details = null) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  error.isStructured = true;
  return error;
}

/**
 * Error üzenet lekérése a hu.json fájlból
 * @param {string} errorCode - Error kód (pl. "USER.NOT_FOUND")
 * @returns {string} Error üzenet
 */
function getErrorMessage(errorCode) {
  const [category, code] = errorCode.split(".");
  return messages.errors[category]?.[code] || "Ismeretlen hiba történt!";
}

/**
 * Dinamikus error generátor függvény
 * @param {string} errorCode - Error kód
 * @param {any} details - Opcionális részletes információk
 * @returns {Error} Strukturált error objektum
 */
function createStructuredError(errorCode, details = null) {
  const message = getErrorMessage(errorCode);
  return createError(errorCode, message, details);
}

/**
 * User hibák
 */
const UserErrors = {
  notFound: () => createStructuredError(ERROR_CODES.USER.NOT_FOUND),
  passwordMismatch: () =>
    createStructuredError(ERROR_CODES.USER.PASSWORD_MISMATCH),
  emailExists: () => createStructuredError(ERROR_CODES.USER.EMAIL_EXISTS),
  createFailed: (details) =>
    createStructuredError(ERROR_CODES.USER.CREATE_FAILED, details),
  updateFailed: (details) =>
    createStructuredError(ERROR_CODES.USER.UPDATE_FAILED, details),
  deleteFailed: (details) =>
    createStructuredError(ERROR_CODES.USER.DELETE_FAILED, details),
  passwordChangeFailed: (details) =>
    createStructuredError(ERROR_CODES.USER.PASSWORD_CHANGE_FAILED, details),
};

/**
 * Email verifikáció hibák
 */
const EmailVerificationErrors = {
  tokenExpired: () =>
    createStructuredError(ERROR_CODES.EMAIL_VERIFICATION.TOKEN_EXPIRED),
  tokenInvalid: () =>
    createStructuredError(ERROR_CODES.EMAIL_VERIFICATION.TOKEN_INVALID),
  alreadyVerified: () =>
    createStructuredError(ERROR_CODES.EMAIL_VERIFICATION.ALREADY_VERIFIED),
  sendFailed: (details) =>
    createStructuredError(ERROR_CODES.EMAIL_VERIFICATION.SEND_FAILED, details),
};

/**
 * Password reset hibák
 */
const PasswordResetErrors = {
  tokenExpired: () =>
    createStructuredError(ERROR_CODES.PASSWORD_RESET.TOKEN_EXPIRED),
  tokenInvalid: () =>
    createStructuredError(ERROR_CODES.PASSWORD_RESET.TOKEN_INVALID),
  userNotFound: () => createStructuredError(ERROR_CODES.USER.NOT_FOUND),
  submitFailed: (details) =>
    createStructuredError(ERROR_CODES.PASSWORD_RESET.SUBMIT_FAILED, details),
  requestFailed: (details) =>
    createStructuredError(ERROR_CODES.PASSWORD_RESET.REQUEST_FAILED, details),
};

/**
 * File hibák
 */
const FileErrors = {
  notFound: () => createStructuredError(ERROR_CODES.FILE.NOT_FOUND),
  invalidFile: () => createStructuredError(ERROR_CODES.FILE.INVALID_FILE),
  uploadFailed: (details) =>
    createStructuredError(ERROR_CODES.FILE.UPLOAD_FAILED, details),
  deleteFailed: (details) =>
    createStructuredError(ERROR_CODES.FILE.DELETE_FAILED, details),
  updateFailed: (details) =>
    createStructuredError(ERROR_CODES.FILE.UPDATE_FAILED, details),
  fileTooLarge: () => createStructuredError(ERROR_CODES.FILE.FILE_TOO_LARGE),
  invalidFileType: () =>
    createStructuredError(ERROR_CODES.FILE.INVALID_FILE_TYPE),
};

/**
 * Dialogue hibák
 */
const DialogueErrors = {
  notFound: () => createStructuredError(ERROR_CODES.DIALOGUE.NOT_FOUND),
  createFailed: (details) => createStructuredError(ERROR_CODES.DIALOGUE.CREATE_FAILED, details),
  updateFailed: (details) => createStructuredError(ERROR_CODES.DIALOGUE.UPDATE_FAILED, details),
  deleteFailed: (details) => createStructuredError(ERROR_CODES.DIALOGUE.DELETE_FAILED, details),
};

/**
 * DialoguePractice hibák
 */
const DialoguePracticeErrors = {
  notFound: () => createStructuredError(ERROR_CODES.DIALOGUE_PRACTICE.NOT_FOUND),
  createFailed: (details) => createStructuredError(ERROR_CODES.DIALOGUE_PRACTICE.CREATE_FAILED, details),
  updateFailed: (details) => createStructuredError(ERROR_CODES.DIALOGUE_PRACTICE.UPDATE_FAILED, details),
  deleteFailed: (details) => createStructuredError(ERROR_CODES.DIALOGUE_PRACTICE.DELETE_FAILED, details),
};

/**
 * Auth hibák
 */
const AuthErrors = {
  invalidCredentials: () =>
    createStructuredError(ERROR_CODES.AUTH.INVALID_CREDENTIALS),
  userNotFound: () => createStructuredError(ERROR_CODES.AUTH.USER_NOT_FOUND),
  userInactive: () => createStructuredError(ERROR_CODES.AUTH.USER_INACTIVE),
  emailNotVerified: () =>
    createStructuredError(ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED),
  insufficientPermissions: () =>
    createStructuredError(ERROR_CODES.AUTH.INSUFFICIENT_PERMISSIONS),
  jwtExpired: () => createStructuredError(ERROR_CODES.AUTH.JWT_EXPIRED),
  jwtMissing: () => createStructuredError(ERROR_CODES.AUTH.JWT_MISSING),
  refreshTokenExpired: () =>
    createStructuredError(ERROR_CODES.AUTH.REFRESH_TOKEN_EXPIRED),
};

/**
 * Default error messages minden error kódhoz
 */

/**
 * Egyszerűsített handleError függvény
 * @param {Response} res - Express response objektum
 * @param {Error} error - Dobott error
 * @param {string} errorCode - Error kód (pl. ERROR_CODES.USER.NOT_FOUND)
 * @returns {void}
 */
function handleError(res, error, errorCode) {
  if (error && error.isStructured) {
    return errorResponse(res, error.message, error.code);
  } else {
    const defaultMessage = getErrorMessage(errorCode);
    return errorResponse(res, defaultMessage, errorCode);
  }
}

module.exports = {
  createError,
  UserErrors,
  EmailVerificationErrors,
  PasswordResetErrors,
  FileErrors,
  AuthErrors,
  DialogueErrors,
  DialoguePracticeErrors,
  handleError,
  getErrorMessage,
};
