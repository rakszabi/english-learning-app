const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const { verifyAdminToken, checkUserStatus } = require("../../user/middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Admin
router.post(
  "/admin/upload",
  verifyAdminToken,
  checkUserStatus,
  upload.single("file"),
  fileController.uploadFile
);
router.get("/admin", verifyAdminToken, checkUserStatus, fileController.getFiles);
router.get("/admin/:id", verifyAdminToken, checkUserStatus, fileController.getFileById);
router.put(
  "/admin/set-status",
  verifyAdminToken,
  checkUserStatus,
  fileController.updateFileStatus
);
router.delete("/admin/:id", verifyAdminToken, checkUserStatus, fileController.deleteFile);
router.post("/admin/query", verifyAdminToken, checkUserStatus, fileController.queryFiles);

module.exports = router;
