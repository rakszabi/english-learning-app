const express = require("express");
const router = express.Router();
const statsController = require("./stats.controller");
const { verifyToken, checkUserStatus } = require("../user/middlewares/auth.middleware");

router.get("/daily-activity", verifyToken, checkUserStatus, statsController.getDailyActivity);

module.exports = router;
