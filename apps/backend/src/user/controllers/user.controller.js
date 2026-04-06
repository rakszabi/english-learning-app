const userService = require("../services/user.service");
const bcrypt = require("bcryptjs");
const {
  ERROR_CODES,
} = require("../../shared/response-helpers/response-helper");
const {
  UserErrors,
  handleError,
} = require("../../shared/response-helpers/error-helper");
const {
  SUCCESS_CODES,
  handleSuccess,
} = require("../../shared/response-helpers/success-helper");
const {
  sendingEmailVerification,
} = require("../services/email-verification.service");
const passwordResetRequestService = require("../services/password-reset-request.service");
const {
  sendingSetPasswordEmail,
} = require("../services/password-reset-email.service");

exports.createUser = async (req, res) => {
  try {
    const password = req.body.password;
    const hasPassword =
      password != null && String(password).trim() !== "";

    const userRaw = {
      email: req.body.email,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      avatarUrl: req.body.avatarUrl || "",
      profileHeadline: req.body.profileHeadline || "",
      role: req.body.role || "USER",
      status: req.body.status || "ACTIVE",
    };

    const isEmailExists = Boolean(
      await userService.countUserByEmail(userRaw.email),
    );
    if (isEmailExists) throw UserErrors.emailExists();

    let user;
    if (hasPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await userService.createUser({
        ...userRaw,
        passwordHash: hashedPassword,
      });

      const verificationToken = userService.generateEmailVerificationToken(
        user.email,
      );
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const verificationUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;
      await sendingEmailVerification(user, verificationUrl);
    } else {
      user = await userService.createUser(userRaw);

      const rawToken = await passwordResetRequestService.createRequestForUser(
        user.id,
      );
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const setPasswordUrl = `${baseUrl}/api/profile/password-reset/${rawToken}`;
      await sendingSetPasswordEmail(user, setPasswordUrl);
    }

    handleSuccess(res, SUCCESS_CODES.USER.CREATE_SUCCESS, user);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.CREATE_FAILED);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, users);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const users = await userService.getAdminUsers();

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, users);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id, true);

    if (!user) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, user);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.decoded.email);

    if (!user) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, user);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const updatedUsers = await userService.updateUserStatus(ids, status);

    handleSuccess(res, SUCCESS_CODES.USER.UPDATE_SUCCESS, updatedUsers);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.UPDATE_FAILED);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userRaw = {
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      avatarUrl: req.body.avatarUrl,
      profileHeadline: req.body.profileHeadline,
      role: req.body.role,
      status: req.body.status,
    };

    const updatedUser = await userService.updateUser(req.params.id, userRaw);

    if (!updatedUser) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.UPDATE_SUCCESS, updatedUser);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.UPDATE_FAILED);
  }
};

exports.removeUser = async (req, res) => {
  try {
    const deletedUser = await userService.removeUser(req.params.id);

    if (!deletedUser) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.DELETE_SUCCESS);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.DELETE_FAILED);
  }
};

exports.queryUsers = async (req, res) => {
  try {
    const { pagination, sort, search, filters } = req.body;

    const result = await userService.queryUsers({
      pagination,
      sort,
      search,
      filters: { ...filters, role: ["USER"] },
    });

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, {
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.queryAdminUsers = async (req, res) => {
  try {
    const { pagination, sort, search, filters } = req.body;

    const result = await userService.queryUsers({
      pagination,
      sort,
      search,
      filters: { ...filters, role: ["ADMIN"] },
    });

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, {
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};
