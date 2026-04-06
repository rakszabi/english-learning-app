const {
  ERROR_CODES,
  handleError,
} = require("../../shared/response-helpers/response-helper");
const { AuthErrors } = require("../../shared/response-helpers/error-helper");
const {
  SUCCESS_CODES,
  handleSuccess,
} = require("../../shared/response-helpers/success-helper");
const userService = require("../services/user.service");
const { generateAccessToken, generateRefreshToken } = require("../../shared/oauth-config");

exports.login = async (req, res) => {
  try {
    let user = req.user;
    delete req.user.password;

    handleSuccess(res, SUCCESS_CODES.AUTH.LOGIN_SUCCESS, {
      data: user,
      jwt: req.token,
      refresh: req.refreshToken,
    });
  } catch (error) {
    handleError(res, error, ERROR_CODES.AUTH.INVALID_CREDENTIALS);
    return;
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    let user = req.user;
    delete req.user.password;

    if (user.role !== "ADMIN") throw AuthErrors.insufficientPermissions();

    handleSuccess(res, SUCCESS_CODES.AUTH.LOGIN_SUCCESS, {
      data: user,
      jwt: req.token,
      refresh: req.refreshToken,
    });
  } catch (error) {
    handleError(res, error, ERROR_CODES.AUTH.INVALID_CREDENTIALS);
    return;
  }
};

exports.tokenRefresh = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.user.email);

    handleSuccess(res, SUCCESS_CODES.AUTH.REFRESH_SUCCESS, {
      data: user,
      jwt: req.token,
      refresh: req.refreshToken,
    });
  } catch (error) {
    handleError(res, error, ERROR_CODES.AUTH.REFRESH_TOKEN_EXPIRED);
  }
};
