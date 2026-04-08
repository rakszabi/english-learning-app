const bcrypt = require("bcryptjs");
const userService = require("../services/user.service");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
const refreshList = {};
const logger = require("../../shared/logger");
const { ERROR_CODES } = require("../../shared/response-helpers/response-helper");
const { AuthErrors, handleError } = require("../../shared/response-helpers/error-helper");
const {
  TOKEN_EXPIRES_TIME,
  REFRESH_TOKEN_EXPIRES_TIME,
} = require("../../shared/config");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) throw AuthErrors.jwtMissing();

    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.decoded = decoded;
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.JWT_EXPIRED);
    return;
  }
  return next();
};

exports.verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw AuthErrors.jwtMissing();

    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    if (decoded.role !== "ADMIN") throw AuthErrors.insufficientPermissions();

    req.decoded = decoded;
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.JWT_EXPIRED);
    return;
  }
  return next();
};

exports.statusValidation = async (req, res, next) => {
  try {
    const user = await userService.getUserByEmail(req.body.email);
    if (user.status !== "ACTIVE") throw AuthErrors.userInactive();

    next();
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.USER_INACTIVE);
    return;
  }
};

exports.adminValidation = async (req, res, next) => {
  try {
    const user = await userService.getUserByEmail(req.body.email);
    if (user.role !== "ADMIN") throw AuthErrors.insufficientPermissions();

    next();
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.INSUFFICIENT_PERMISSIONS);
    return;
  }
};

exports.checkUserStatus = async (req, res, next) => {
  try {
    // Ellenőrizzük, hogy van-e decoded user (authenticated request)
    if (!req.decoded || !req.decoded.email) {
      handleError(res, null, ERROR_CODES.AUTH.JWT_MISSING);
      return;
    }

    // Lekérjük a felhasználót az adatbázisból
    const user = await userService.getUserByEmail(req.decoded.email);
    if (!user) {
      handleError(res, null, ERROR_CODES.AUTH.USER_NOT_FOUND);
      return;
    }

    // Ellenőrizzük a státuszt
    if (user.status !== "ACTIVE") {
      handleError(res, null, ERROR_CODES.AUTH.USER_INACTIVE);
      return;
    }

    // Ha minden rendben, folytatjuk
    next();
  } catch (error) {
    handleError(res, null, ERROR_CODES.GENERAL.INTERNAL_ERROR);
    return;
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const user = await emailPasswordValidation(
      req.body.email,
      req.body.password
    );

    if (user.provider === 'local') {
      const isEmailVerified = await userService.isEmailVerified(user.email);
      if (!isEmailVerified) {
        throw AuthErrors.emailNotVerified();
      }
    }

    // Bejelentkezési idő frissítése
    await userService.updateLastLoginAt(user.email);

    const token = generateAccessToken(user.id, user.email, user.role, user.firstname, user.lastname);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role, user.firstname, user.lastname);
    req.token = token;
    req.refreshToken = refreshToken;
    req.user = user;

    addToList(refreshToken, token);
    logger.info(`Felhasználó bejelentkezett: ${user.id} (${user.email}) - ${user.provider}`);

    return next();
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.INVALID_CREDENTIALS);
    return;
  }
};

exports.tokenRefresh = async (req, res, next) => {
  try {
    const postData = req.body;
    if (postData.refreshToken && postData.refreshToken in refreshList) {
      const decoded = jwt.verify(
        postData.refreshToken,
        process.env.SECRET_RTOKEN
      );

      const user = await userService.getUserByEmail(decoded.email);
      if (user && user.provider === 'local') {
        const isEmailVerified = await userService.isEmailVerified(decoded.email);
        if (!isEmailVerified) {
          handleError(res, null, ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED);
          return;
        }
      }

      const token = generateAccessToken(
        decoded.id,
        decoded.email,
        decoded.role,
        decoded.firstname,
        decoded.lastname
      );
      const refreshToken = generateRefreshToken(
        decoded.id,
        decoded.email,
        decoded.role,
        decoded.firstname,
        decoded.lastname
      );

      req.user = {
        email: decoded.email,
        role: decoded.role,
      };
      req.token = token;
      req.refreshToken = refreshToken;

      addToList(refreshToken, token);
    } else {
      handleError(res, null, ERROR_CODES.AUTH.REFRESH_TOKEN_EXPIRED);
      return;
    }
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.REFRESH_TOKEN_EXPIRED);
    return;
  }
  next();
};

const emailPasswordValidation = async (email, password) => {
  try {
    const userPassword = await userService.getPasswordByEmail(email);
    if (!userPassword) throw AuthErrors.invalidCredentials();

    let isValidPassword = await bcrypt.compare(password, userPassword);
    if (!isValidPassword) throw AuthErrors.invalidCredentials();

    const user = await userService.getUserByEmail(email);
    return user;
  } catch (error) {
    handleError(res, null, ERROR_CODES.AUTH.INVALID_CREDENTIALS);
  }
};

function generateAccessToken(userId, email, role, firstname, lastname) {
  return jwt.sign(
    { id: userId, email, role, firstname: firstname ?? null, lastname: lastname ?? null },
    process.env.SECRET_TOKEN,
    { expiresIn: TOKEN_EXPIRES_TIME }
  );
}

function generateRefreshToken(userId, email, role, firstname, lastname) {
  return jwt.sign(
    { id: userId, email, role, firstname: firstname ?? null, lastname: lastname ?? null },
    process.env.SECRET_RTOKEN,
    { expiresIn: REFRESH_TOKEN_EXPIRES_TIME }
  );
}

function addToList(refreshToken, token) {
  refreshList[refreshToken] = {
    status: "loggedin",
    token: token,
    refreshtoken: refreshToken,
  };
}
