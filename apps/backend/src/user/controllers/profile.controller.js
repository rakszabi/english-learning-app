const userService = require("../services/user.service");
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
const bcrypt = require("bcryptjs");
const {
  sendingEmailVerification,
} = require("../services/email-verification.service");
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.decoded.email);

    if (!user) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, user);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const email = req.decoded.email;
    const profileRaw = {
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      avatarUrl: req.body.avatarUrl,
      profileHeadline: req.body.profileHeadline,
    };

    const updatedProfile = await userService.updateProfile(email, profileRaw);

    if (!updatedProfile) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.UPDATE_SUCCESS, updatedProfile);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.changePassword = async (req, res) => {
  let email = req.decoded.email;
  let oldPassword = req.body.oldPassword;
  let newPassword = req.body.newPassword;

  try {
    await userService.changePassword(email, oldPassword, newPassword);

    const result = await userService.getUserByEmail(email);
    if (!result || Object.keys(result).length === 0)
      throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.PASSWORD_CHANGE_SUCCESS, result);
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.PASSWORD_CHANGE_FAILED);
  }
};

exports.userRegistration = async (req, res) => {
  try {
    const password = req.body.password;
    const userRaw = {
      email: req.body.email,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      avatarUrl: "",
      profileHeadline: "",
      role: "USER",
      status: "ACTIVE",
    };

    const isEmailExists = Boolean(
      await userService.countUserByEmail(userRaw.email)
    );
    if (isEmailExists) throw UserErrors.emailExists();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      ...userRaw,
      passwordHash: hashedPassword,
    });

    // Email verifikációs token generálása és levél küldése
    const verificationToken = userService.generateEmailVerificationToken(
      user.email
    );
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const verificationUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;

    await sendingEmailVerification(user, verificationUrl);

    handleSuccess(
      res,
      SUCCESS_CODES.USER.REGISTRATION_SUCCESS,
      user
    );
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.CREATE_FAILED);
  }
};
