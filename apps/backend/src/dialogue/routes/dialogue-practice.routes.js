const express = require("express");
const router = express.Router();
const dialoguePracticeController = require("../controllers/dialogue-practice.controller");
const {
  verifyAdminToken,
  verifyToken,
  checkUserStatus,
} = require("../../user/middlewares/auth.middleware");

// Authenticated user routes
router.post("/", verifyToken, checkUserStatus, dialoguePracticeController.createPractice);
router.get("/review", verifyToken, checkUserStatus, dialoguePracticeController.getNextPractice);
router.get("/", verifyToken, checkUserStatus, dialoguePracticeController.getMyPractices);
router.get("/:id", verifyToken, checkUserStatus, dialoguePracticeController.getPracticeById);
router.put("/:id", verifyToken, checkUserStatus, dialoguePracticeController.updatePractice);
router.delete("/:id", verifyToken, checkUserStatus, dialoguePracticeController.deletePractice);

// Admin routes
router.post("/admin/query", verifyAdminToken, checkUserStatus, dialoguePracticeController.queryPractices);

module.exports = router;
