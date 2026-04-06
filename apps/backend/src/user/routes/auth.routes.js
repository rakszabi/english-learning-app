const express = require("express");
const router = express.Router();
const {
  statusValidation,
  userLogin,
  adminValidation,
  tokenRefresh,
} = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const emailVerificationController = require("../controllers/email-verification.controller");

// Admin
router.post("/login", statusValidation, userLogin, authController.login);
router.post(
  "/admin/login",
  statusValidation,
  adminValidation,
  userLogin,
  authController.loginAdmin
);
router.post("/refresh", tokenRefresh, authController.tokenRefresh);

// Email verifikáció
router.get("/verify-email/:token", emailVerificationController.verifyEmail);

module.exports = router;
