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
const { formatProfileUser } = require("../helpers/profile-user.helper");

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.decoded.email);

    if (!user) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.QUERY_SUCCESS, formatProfileUser(user));
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

    handleSuccess(res, SUCCESS_CODES.USER.UPDATE_SUCCESS, formatProfileUser(updatedProfile));
  } catch (error) {
    handleError(res, error, ERROR_CODES.USER.QUERY_FAILED);
  }
};

exports.updateLearningPreferences = async (req, res) => {
  try {
    const email = req.decoded.email;
    const body = req.body ?? {};

    let levelId = body.levelId;
    if (levelId === "" || levelId === undefined) levelId = null;
    if (levelId !== null && levelId !== undefined) {
      levelId = parseInt(levelId, 10);
      if (Number.isNaN(levelId) || ![1, 2, 3, 4, 5].includes(levelId)) {
        return res.status(400).json({
          status: "FAILED",
          message: "levelId must be null or an integer from 1 to 5.",
          errorCode: "USER.LEARNING_PREFS_INVALID",
        });
      }
    }

    let interests = body.interests;
    if (interests === undefined) interests = [];
    if (!Array.isArray(interests)) {
      return res.status(400).json({
        status: "FAILED",
        message: "interests must be an array of strings.",
        errorCode: "USER.LEARNING_PREFS_INVALID",
      });
    }
    const cleanedInterests = [
      ...new Set(
        interests
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 40)
          .map((s) => (s.length > 80 ? s.slice(0, 80) : s))
      ),
    ];

    const dailyNew = body.dailyNewDialogues;
    const dailyPractice = body.dailyPracticeSessions;

    const parseGoal = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "string" ? parseInt(v, 10) : Math.floor(Number(v));
      if (Number.isNaN(n) || n < 0 || n > 20) {
        return "bad";
      }
      return n;
    };

    const gNew = parseGoal(dailyNew);
    const gPractice = parseGoal(dailyPractice);
    if (gNew === "bad" || gPractice === "bad") {
      return res.status(400).json({
        status: "FAILED",
        message: "Daily goals must be empty or an integer from 0 to 20.",
        errorCode: "USER.LEARNING_PREFS_INVALID",
      });
    }

    const updated = await userService.updateLearningPreferences(email, {
      learningLevelId: levelId,
      learningInterests: cleanedInterests,
      dailyNewDialoguesGoal: gNew,
      dailyPracticeGoal: gPractice,
    });

    if (!updated) throw UserErrors.notFound();

    handleSuccess(res, SUCCESS_CODES.USER.UPDATE_SUCCESS, formatProfileUser(updated));
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

    handleSuccess(res, SUCCESS_CODES.USER.PASSWORD_CHANGE_SUCCESS, formatProfileUser(result));
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
