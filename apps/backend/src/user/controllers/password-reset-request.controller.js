const passwordResetRequestService = require("../services/password-reset-request.service");
const bcrypt = require("bcryptjs");
const userService = require("../services/user.service");
const {
  sendingPasswordResetEmail,
} = require("../services/password-reset-email.service");
const logger = require("../../shared/logger");
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

exports.createPasswordResetRequest = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.body.email);
    if (!user) throw UserErrors.notFound();

    const rawToken = await passwordResetRequestService.createRequestForUser(
      user.id
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    await sendingPasswordResetEmail(
      user,
      `${baseUrl}/api/profile/password-reset/${rawToken}`
    );

    handleSuccess(res, SUCCESS_CODES.PASSWORD_RESET.REQUEST_SUCCESS);
  } catch (error) {
    handleError(res, error, ERROR_CODES.PASSWORD_RESET.REQUEST_FAILED);
  }
};

exports.passwordResetPage = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const passwordResetSubmitUrl = `${baseUrl}/api/profile/password-reset-submit`;

    res.render("password-reset", {
      passwordResetSubmitUrl: passwordResetSubmitUrl,
      title: "Jelszó visszaállítás",
      token: req.params.token,
    });
  } catch (error) {
    handleError(res, error, ERROR_CODES.PASSWORD_RESET.REQUEST_FAILED);
  }
};

exports.passwordResetSubmit = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const confirmPassword = req.body["confirm-password"];

  if (password !== confirmPassword) {
    logger.error("A két jelszó nem egyezik!");
    res.render("password-reset-error", {
      title: "A két jelszó nem egyezik!",
      message: "Hiba! A két jelszó nem egyezik!",
    });
    return;
  }

  try {
    const allValidPasswordResetRequest =
      await passwordResetRequestService.getAllValidPasswordResetRequest();

    // Ellenőrizzük a nyers tokent a rekordok hash-elt tokenjeivel
    let matchingRequest = null;
    for (const request of allValidPasswordResetRequest) {
      const isMatch = await bcrypt.compare(token, request.token);
      if (isMatch) {
        matchingRequest = request;
        break;
      }
    }

    // Ha nem találunk megfelelő rekordot, hiba
    if (!matchingRequest) {
      logger.error("Érvénytelen vagy lejárt token!");
      res.render("password-reset-error", {
        title: "Érvénytelen vagy lejárt token!",
        message: "Hiba! Érvénytelen vagy lejárt token!",
      });
      return;
    }

    // Ha találunk megfelelő rekordot, frissítjük a jelszót
    const user = await userService.getUserById(matchingRequest.userId);
    if (!user) {
      logger.error("Felhasználó nem található!");
      res.render("password-reset-error", {
        title: "Felhasználó nem található!",
        message: "Hiba! Felhasználó nem található!",
      });
      return;
    }

    // Jelszó hash-elése és mentése
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await userService.updateUser(user.id, { passwordHash: hashedPassword });

    // Ha még nem volt verifikálva az email (pl. admin által létrehozott user), most megjelöljük
    if (!user.emailVerifiedAt) {
      await userService.verifyEmail(user.email);
    }

    // Felhasznált reset request törlése
    await passwordResetRequestService.removePasswordResetRequest(
      matchingRequest.id
    );

    logger.info(`Sikeres jelszó módosítás: ${user.id} (${user.email})`);

    // Sikeres válasz
    res.render("password-reset-success", {
      title: "Sikeres jelszó módosítás!",
      message: "Sikeres jelszó módosítás!",
    });
    return;
  } catch (error) {
    handleError(res, error, ERROR_CODES.PASSWORD_RESET.SUBMIT_FAILED);
  }
};
