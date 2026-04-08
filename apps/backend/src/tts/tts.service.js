const openai = require("../shared/ai/openai");

class TtsService {
  /**
   * @param {string} text
   * @returns {Promise<Buffer>} MP3 audio buffer
   */
  async synthesize(text) {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      response_format: "mp3",
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

module.exports = new TtsService();
