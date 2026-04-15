const openai = require("../shared/ai/openai");

/** OpenAI TTS voice per dialogue speaker (A vs B). */
const SPEAKER_VOICES = {
  A: "echo",
  B: "nova",
};

class TtsService {
  /**
   * @param {string} text
   * @param {"A" | "B"} [speaker]
   * @returns {Promise<Buffer>} MP3 audio buffer
   */
  async synthesize(text, speaker = "A") {
    const voice =
      SPEAKER_VOICES[speaker] ?? SPEAKER_VOICES.A;

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

module.exports = new TtsService();
