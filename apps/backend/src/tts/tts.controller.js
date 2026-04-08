const ttsService = require("./tts.service");

class TtsController {
  async speak(req, res) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({
          status: "FAILED",
          message: "A szöveg megadása kötelező.",
          errorCode: "TTS.MISSING_TEXT",
        });
      }

      if (text.length > 4096) {
        return res.status(400).json({
          status: "FAILED",
          message: "A szöveg túl hosszú (max 4096 karakter).",
          errorCode: "TTS.TEXT_TOO_LONG",
        });
      }

      const audioBuffer = await ttsService.synthesize(text.trim());

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length,
        "Cache-Control": "no-store",
      });
      res.send(audioBuffer);
    } catch (error) {
      res.status(500).json({
        status: "FAILED",
        message: "Sikertelen hangszintézis.",
        errorCode: "TTS.SYNTHESIS_FAILED",
      });
    }
  }
}

module.exports = new TtsController();
