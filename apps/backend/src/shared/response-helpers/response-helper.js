const logger = require("../logger");

// Sikeres válasz
exports.successResponse = (
  res,
  message,
  data = null,
  isNeedLog = false,
  statusCode = 200,
  extra = null
) => {
  if (isNeedLog) {
    logger.info(
      `${message}
      ${data ? JSON.stringify(data) : null}`
    );
  }

  // Ellenőrizzük, hogy az adat objektum-e, és van-e benne `data` mező
  const isObject =
    typeof data === "object" && !Array.isArray(data) && data !== null;
  const hasDataField = isObject && data.hasOwnProperty("data");

  // Ha van `data` mező és az objektum tartalmaz más attribútumokat is
  if (hasDataField) {
    const { data: nestedData, ...rest } = data; // Bontsd ki a `data` mezőt és a többit
    return res.status(statusCode).json({
      status: "OK",
      message,
      data: nestedData,
      ...rest,
    });
  }

  // Alapértelmezett válasz, ha nincs speciális `data` mező
  return res.status(statusCode).json({
    status: "OK",
    message,
    data,
    ...(extra !== null && { extra }),
  });
};

// Error kódok definíciója
const ERROR_CODES = {
  // Auth hibák
  AUTH: {
    JWT_EXPIRED: "AUTH.JWT_EXPIRED",
    JWT_INVALID: "AUTH.JWT_INVALID", 
    JWT_MISSING: "AUTH.JWT_MISSING",
    INVALID_CREDENTIALS: "AUTH.INVALID_CREDENTIALS",
    EMAIL_NOT_VERIFIED: "AUTH.EMAIL_NOT_VERIFIED",
    USER_INACTIVE: "AUTH.USER_INACTIVE",
    USER_NOT_FOUND: "AUTH.USER_NOT_FOUND",
    INSUFFICIENT_PERMISSIONS: "AUTH.INSUFFICIENT_PERMISSIONS",
    REFRESH_TOKEN_EXPIRED: "AUTH.REFRESH_TOKEN_EXPIRED",
    REFRESH_TOKEN_INVALID: "AUTH.REFRESH_TOKEN_INVALID"
  },
  
  // User hibák
  USER: {
    CREATE_FAILED: "USER.CREATE_FAILED",
    UPDATE_FAILED: "USER.UPDATE_FAILED",
    DELETE_FAILED: "USER.DELETE_FAILED",
    NOT_FOUND: "USER.NOT_FOUND",
    EMAIL_EXISTS: "USER.EMAIL_EXISTS",
    PASSWORD_CHANGE_FAILED: "USER.PASSWORD_CHANGE_FAILED",
    PASSWORD_MISMATCH: "USER.PASSWORD_MISMATCH",
    QUERY_FAILED: "USER.QUERY_FAILED"
  },
  
  // Email verifikáció hibák
  EMAIL_VERIFICATION: {
    TOKEN_EXPIRED: "EMAIL_VERIFICATION.TOKEN_EXPIRED",
    TOKEN_INVALID: "EMAIL_VERIFICATION.TOKEN_INVALID",
    ALREADY_VERIFIED: "EMAIL_VERIFICATION.ALREADY_VERIFIED",
    SEND_FAILED: "EMAIL_VERIFICATION.SEND_FAILED"
  },
  
  // Password reset hibák
  PASSWORD_RESET: {
    REQUEST_FAILED: "PASSWORD_RESET.REQUEST_FAILED",
    TOKEN_EXPIRED: "PASSWORD_RESET.TOKEN_EXPIRED",
    TOKEN_INVALID: "PASSWORD_RESET.TOKEN_INVALID",
    SUBMIT_FAILED: "PASSWORD_RESET.SUBMIT_FAILED",
    EMAIL_SEND_FAILED: "PASSWORD_RESET.EMAIL_SEND_FAILED"
  },
  
  // File hibák
  FILE: {
    UPLOAD_FAILED: "FILE.UPLOAD_FAILED",
    DELETE_FAILED: "FILE.DELETE_FAILED",
    NOT_FOUND: "FILE.NOT_FOUND",
    QUERY_FAILED: "FILE.QUERY_FAILED",
    INVALID_FILE: "FILE.INVALID_FILE",
    FILE_TOO_LARGE: "FILE.FILE_TOO_LARGE",
    INVALID_FILE_TYPE: "FILE.INVALID_FILE_TYPE"
  },
  
  // Dialogue hibák
  DIALOGUE: {
    CREATE_FAILED: "DIALOGUE.CREATE_FAILED",
    UPDATE_FAILED: "DIALOGUE.UPDATE_FAILED",
    DELETE_FAILED: "DIALOGUE.DELETE_FAILED",
    NOT_FOUND: "DIALOGUE.NOT_FOUND",
    QUERY_FAILED: "DIALOGUE.QUERY_FAILED",
  },

  // DialoguePractice hibák
  DIALOGUE_PRACTICE: {
    CREATE_FAILED: "DIALOGUE_PRACTICE.CREATE_FAILED",
    UPDATE_FAILED: "DIALOGUE_PRACTICE.UPDATE_FAILED",
    DELETE_FAILED: "DIALOGUE_PRACTICE.DELETE_FAILED",
    NOT_FOUND: "DIALOGUE_PRACTICE.NOT_FOUND",
    QUERY_FAILED: "DIALOGUE_PRACTICE.QUERY_FAILED",
  },

  // Általános hibák
  GENERAL: {
    INTERNAL_ERROR: "GENERAL.INTERNAL_ERROR",
    VALIDATION_ERROR: "GENERAL.VALIDATION_ERROR",
    NOT_FOUND: "GENERAL.NOT_FOUND",
    UNAUTHORIZED: "GENERAL.UNAUTHORIZED",
    FORBIDDEN: "GENERAL.FORBIDDEN",
    BAD_REQUEST: "GENERAL.BAD_REQUEST"
  }
};

// Hibás válasz
exports.errorResponse = (
  res,
  message,
  errorCode,
  isNeedLog = true,
  statusCode = 400,
  errorDetails = null
) => {
  if (isNeedLog) {
    logger.error(
      `${message} | Code: ${errorCode}
      ${errorDetails ? JSON.stringify(errorDetails) : null}`
    );
  }
  
  return res.status(statusCode).json({
    status: "FAILED",
    message,
    errorCode,
    ...(errorDetails && { details: errorDetails })
  });
};

// Strukturált error kezelése (deprecated - használd az error-helper.js-ből)
exports.handleError = (res, error, defaultMessage, defaultCode) => {
  if (error && error.isStructured) {
    return exports.errorResponse(res, error.message, error.code);
  } else {
    return exports.errorResponse(res, defaultMessage, defaultCode);
  }
};

// Error kódok exportálása
exports.ERROR_CODES = ERROR_CODES;
