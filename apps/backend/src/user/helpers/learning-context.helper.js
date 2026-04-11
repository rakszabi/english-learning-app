const { parseLearningInterests } = require("./profile-user.helper");

/** Matches app learning levels (profile UI) — used in AI prompts */
const LEVEL_META = {
  1: {
    name: "Beginner",
    guidance:
      "CEFR roughly A1–A2: very simple vocabulary, short sentences, basic everyday expressions and familiar topics only.",
  },
  2: {
    name: "Elementary",
    guidance:
      "CEFR roughly A2–B1: common situations, simple connected sentences, everyday vocabulary.",
  },
  3: {
    name: "Intermediate",
    guidance:
      "CEFR roughly B1–B2: broader vocabulary, opinions, natural pace, some abstract topics.",
  },
  4: {
    name: "Upper intermediate",
    guidance:
      "CEFR roughly B2–C1: nuanced language, longer turns, faster natural dialogue, subtle meanings.",
  },
  5: {
    name: "Advanced",
    guidance:
      "CEFR roughly C1+: idioms, register shifts, near-native complexity and subtlety.",
  },
};

/**
 * @param {object|null} row - User row with learningLevelId, learningInterests
 * @returns {null | { levelId: number|null, levelName: string|null, levelGuidance: string|null, interests: string[] }}
 */
function buildAiLearningContextFromUserRow(row) {
  if (!row) return null;

  const interests = parseLearningInterests(row.learningInterests);
  const levelId = row.learningLevelId;
  const hasLevel = levelId === 1 || levelId === 2 || levelId === 3 || levelId === 4 || levelId === 5;
  const hasInterests = interests.length > 0;

  if (!hasLevel && !hasInterests) return null;

  const meta = hasLevel ? LEVEL_META[levelId] : null;

  return {
    levelId: hasLevel ? levelId : null,
    levelName: meta ? meta.name : null,
    levelGuidance: meta ? meta.guidance : null,
    interests,
  };
}

module.exports = { buildAiLearningContextFromUserRow, LEVEL_META };
