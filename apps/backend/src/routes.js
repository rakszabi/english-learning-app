const express = require("express");

const userRoutes = require("./user/routes/user.routes");
const profileRoutes = require("./user/routes/profile.routes");
const authRoutes = require("./user/routes/auth.routes");
const fileRoutes = require("./file/routes/file.routes");
const adminSearchRoutes = require("./admin-search/routes/admin-search.routes");
const dialogueRoutes = require("./dialogue/routes/dialogue.routes");
const dialoguePracticeRoutes = require("./dialogue/routes/dialogue-practice.routes");
const router = express.Router();

// Routes
router.use("/api/user", userRoutes);
router.use("/api/profile", profileRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/file", fileRoutes);
router.use("/api/search", adminSearchRoutes);
router.use("/api/dialogue", dialogueRoutes);
router.use("/api/dialogue-practice", dialoguePracticeRoutes);


module.exports = router;
