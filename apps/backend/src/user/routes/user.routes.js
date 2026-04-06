const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyAdminToken, checkUserStatus } = require("../middlewares/auth.middleware");

// Admin
router.post("/admin", verifyAdminToken, checkUserStatus, userController.createUser);
router.post("/admin/query", verifyAdminToken, checkUserStatus, userController.queryUsers);
router.post(
  "/admin/query-admin",
  verifyAdminToken,
  checkUserStatus,
  userController.queryAdminUsers
);
router.get("/admin", verifyAdminToken, checkUserStatus, userController.getUsers);
router.get("/admin/:id", verifyAdminToken, checkUserStatus, userController.getUserById);
router.put(
  "/admin/set-status",
  verifyAdminToken,
  checkUserStatus,
  userController.updateUserStatus
);
router.put("/admin/:id", verifyAdminToken, checkUserStatus, userController.updateUser);
router.delete("/admin/:id", verifyAdminToken, checkUserStatus, userController.removeUser);

module.exports = router;
