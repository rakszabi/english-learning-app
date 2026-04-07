const messages = require("../locales/hu.json");

/**
 * Success kódok definíciója
 */
const SUCCESS_CODES = {
  // User sikeres műveletek
  USER: {
    CREATE_SUCCESS: "USER.CREATE_SUCCESS",
    UPDATE_SUCCESS: "USER.UPDATE_SUCCESS",
    DELETE_SUCCESS: "USER.DELETE_SUCCESS",
    QUERY_SUCCESS: "USER.QUERY_SUCCESS",
    PASSWORD_CHANGE_SUCCESS: "USER.PASSWORD_CHANGE_SUCCESS",
    REGISTRATION_SUCCESS: "USER.REGISTRATION_SUCCESS",
  },

  // File sikeres műveletek
  FILE: {
    UPLOAD_SUCCESS: "FILE.UPLOAD_SUCCESS",
    UPDATE_SUCCESS: "FILE.UPDATE_SUCCESS",
    DELETE_SUCCESS: "FILE.DELETE_SUCCESS",
    QUERY_SUCCESS: "FILE.QUERY_SUCCESS",
  },

  // Dialogue sikeres műveletek
  DIALOGUE: {
    CREATE_SUCCESS: "DIALOGUE.CREATE_SUCCESS",
    UPDATE_SUCCESS: "DIALOGUE.UPDATE_SUCCESS",
    DELETE_SUCCESS: "DIALOGUE.DELETE_SUCCESS",
    QUERY_SUCCESS: "DIALOGUE.QUERY_SUCCESS",
  },

  // DialoguePractice sikeres műveletek
  DIALOGUE_PRACTICE: {
    CREATE_SUCCESS: "DIALOGUE_PRACTICE.CREATE_SUCCESS",
    UPDATE_SUCCESS: "DIALOGUE_PRACTICE.UPDATE_SUCCESS",
    DELETE_SUCCESS: "DIALOGUE_PRACTICE.DELETE_SUCCESS",
    QUERY_SUCCESS: "DIALOGUE_PRACTICE.QUERY_SUCCESS",
  },

  // Általános sikeres műveletek
  GENERAL: {
    QUERY_SUCCESS: "GENERAL.QUERY_SUCCESS",
  },

  // Auth sikeres műveletek
  AUTH: {
    LOGIN_SUCCESS: "AUTH.LOGIN_SUCCESS",
    LOGOUT_SUCCESS: "AUTH.LOGOUT_SUCCESS",
    REGISTER_SUCCESS: "AUTH.REGISTER_SUCCESS",
    REFRESH_SUCCESS: "AUTH.REFRESH_SUCCESS",
  },

  // Email verifikáció sikeres műveletek
  EMAIL_VERIFICATION: {
    SEND_SUCCESS: "EMAIL_VERIFICATION.SEND_SUCCESS",
    VERIFY_SUCCESS: "EMAIL_VERIFICATION.VERIFY_SUCCESS",
  },

  // Password reset sikeres műveletek
  PASSWORD_RESET: {
    REQUEST_SUCCESS: "PASSWORD_RESET.REQUEST_SUCCESS",
    RESET_SUCCESS: "PASSWORD_RESET.RESET_SUCCESS",
  },
};

/**
 * Default success messages minden success kódhoz
 */

/**
 * Success üzenet lekérése a hu.json fájlból
 * @param {string} successCode - Success kód (pl. "USER.CREATE_SUCCESS")
 * @returns {string} Success üzenet
 */
function getSuccessMessage(successCode) {
  const [category, code] = successCode.split(".");
  return messages.success[category]?.[code] || "👍 Sikeres művelet!";
}

/**
 * Dinamikus success generátor függvény
 * @param {string} successCode - Success kód
 * @param {any} details - Opcionális részletes információk
 * @returns {string} Success üzenet
 */
function createSuccessMessage(successCode, details = null) {
  const message = getSuccessMessage(successCode);
  return message;
}

/**
 * Egyszerűsített handleSuccess függvény
 * @param {Response} res - Express response objektum
 * @param {string} successCode - Success kód (pl. SUCCESS_CODES.USER.CREATE_SUCCESS)
 * @param {any} data - Válasz adat
 * @param {any} details - Opcionális részletes információk
 * @returns {void}
 */
function handleSuccess(res, successCode, data = null, details = null) {
  const message = createSuccessMessage(successCode, details);

  // Konzisztens formátum az error response-szal
  return res.status(200).json({
    status: "OK",
    message,
    data,
    messageCode: successCode,
    ...(details && { details }),
  });
}

module.exports = {
  SUCCESS_CODES,
  createSuccessMessage,
  handleSuccess,
  getSuccessMessage,
};
