const openai = require("../../shared/ai/openai");

const SYSTEM_PROMPT = `You are an English language learning assistant. 
Your task is to generate a list of unique, diverse dialogue topic ideas for language learners.
Each topic should be suitable for a realistic conversational dialogue between two or more people.
Cover a wide range of everyday situations, social contexts, and difficulty levels.
Return ONLY a valid JSON array of strings, with no additional text, markdown, or explanation.`;

class DialogueTopicGeneratorService {
  /**
   * @param {number} count - Number of topic ideas to generate
   * @param {string[]} existingTopics - Already existing topics to avoid duplicates
   */
  async generateTopics(count = 20, existingTopics = []) {
    const avoidClause =
      existingTopics.length > 0
        ? `\n\nAvoid these already existing topics:\n${existingTopics.map((t) => `- ${t}`).join("\n")}`
        : "";

    const userPrompt = `Generate exactly ${count} unique English dialogue topic ideas for language learners.
Each item should be a short, descriptive topic title (e.g. "Ordering food at a restaurant", "Asking for directions in a city").
Return a JSON array of strings only.${avoidClause}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
    });

    const raw = response.choices[0].message.content;
    const parsed = JSON.parse(raw);

    const topics = Array.isArray(parsed) ? parsed : parsed.topics ?? parsed[Object.keys(parsed)[0]];

    if (!Array.isArray(topics)) {
      throw new Error("Unexpected AI response format");
    }

    return topics;
  }
}

module.exports = new DialogueTopicGeneratorService();
