const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const passwordResetRequestController = require("../controllers/password-reset-request.controller");
const { verifyToken, checkUserStatus } = require("../middlewares/auth.middleware");

router.post("/registration", profileController.userRegistration);
router.get("/", verifyToken, checkUserStatus, profileController.getUserByEmail);
router.put("/", verifyToken, checkUserStatus, profileController.updateProfile);

router.put("/change-password", verifyToken, checkUserStatus, profileController.changePassword);
router.post(
  "/password-reset",
  passwordResetRequestController.createPasswordResetRequest
);
router.get(
  "/password-reset/:token",
  passwordResetRequestController.passwordResetPage
);
router.post(
  "/password-reset-submit",
  passwordResetRequestController.passwordResetSubmit
);

module.exports = router;
