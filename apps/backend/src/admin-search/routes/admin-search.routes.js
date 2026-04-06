const express = require("express");
const router = express.Router();
const adminSearchController = require("../admin-search.controller");
const {
  verifyAdminToken,
  checkUserStatus,
} = require("../../user/middlewares/auth.middleware");

// Admin globális kereső
router.get(
  "/",
  verifyAdminToken,
  checkUserStatus,
  (req, res) => adminSearchController.search(req, res)
);

module.exports = router;

