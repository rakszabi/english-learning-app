const express = require("express");
const router = express.Router();
const dialogueController = require("../controllers/dialogue.controller");
const {
  verifyAdminToken,
  verifyToken,
  checkUserStatus,
} = require("../../user/middlewares/auth.middleware");

// Authenticated user routes
router.get("/", verifyToken, checkUserStatus, dialogueController.getAllDialogues);
router.get("/:id", verifyToken, checkUserStatus, dialogueController.getDialogueById);

// Admin routes
router.post("/admin/generate-topics", verifyAdminToken, checkUserStatus, dialogueController.generateTopics);
router.post("/admin/generate", verifyAdminToken, checkUserStatus, dialogueController.generateDialogue);
router.post("/admin", verifyAdminToken, checkUserStatus, dialogueController.createDialogue);
router.post("/admin/query", verifyAdminToken, checkUserStatus, dialogueController.queryDialogues);
router.get("/admin/all", verifyAdminToken, checkUserStatus, dialogueController.getAllDialogues);
router.put("/admin/:id", verifyAdminToken, checkUserStatus, dialogueController.updateDialogue);
router.delete("/admin/:id", verifyAdminToken, checkUserStatus, dialogueController.deleteDialogue);

module.exports = router;
