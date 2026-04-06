const openai = require("../../shared/ai/openai");

const SYSTEM_PROMPT = `You are an English language learning assistant.
Your task is to generate a realistic, natural conversational dialogue between two people (speaker A and speaker B) based on a given topic.

Rules:
- The dialogue must have between 8 and 12 lines total, alternating between speaker A and B.
- Each line must be natural, practical English suitable for language learners.
- Provide an accurate Hungarian translation for every line.
- Return ONLY a valid JSON object with this exact structure, no extra text or markdown:
{
  "topic": "<the topic>",
  "lines": [
    { "speaker": "A", "en": "<English sentence>", "hu": "<Hungarian translation>" },
    { "speaker": "B", "en": "<English sentence>", "hu": "<Hungarian translation>" }
  ]
}`;

class DialogueGeneratorService {
  async generateDialogue(topic) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate a dialogue about: "${topic}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const raw = response.choices[0].message.content;
    const parsed = JSON.parse(raw);

    if (!parsed.lines || !Array.isArray(parsed.lines) || parsed.lines.length < 8) {
      throw new Error("Unexpected AI response format");
    }

    return {
      topic: parsed.topic ?? topic,
      lines: parsed.lines,
    };
  }
}

module.exports = new DialogueGeneratorService();
