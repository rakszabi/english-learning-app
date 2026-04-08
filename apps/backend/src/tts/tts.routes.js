const express = require("express");
const router = express.Router();
const ttsController = require("./tts.controller");
const { verifyToken, checkUserStatus } = require("../user/middlewares/auth.middleware");

router.post("/speak", verifyToken, checkUserStatus, ttsController.speak);

module.exports = router;
