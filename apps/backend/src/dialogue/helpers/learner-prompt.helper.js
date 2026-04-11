/**
 * @param {null | { levelName: string|null, levelGuidance: string|null, interests: string[] }} ctx
 * @returns {string} Extra instructions for OpenAI user message (empty if no ctx)
 */
function buildLearnerInstructionBlock(ctx) {
  if (!ctx) return "";

  const parts = [];

  if (ctx.levelGuidance && ctx.levelName) {
    parts.push(
      `Learner level: ${ctx.levelName}. ${ctx.levelGuidance}`,
      "Match vocabulary complexity, sentence length, and situation realism to this level."
    );
  }

  if (ctx.interests && ctx.interests.length > 0) {
    parts.push(
      `Learner interest areas (use where they fit naturally; do not force every topic): ${ctx.interests.join(", ")}.`
    );
  }

  if (parts.length === 0) return "";

  return `\n\n--- Learner profile ---\n${parts.join("\n")}`;
}

module.exports = { buildLearnerInstructionBlock };
