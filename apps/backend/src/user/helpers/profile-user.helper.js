function parseLearningInterests(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Maps DB learning columns to API `learningPreferences` and removes raw fields.
 * @param {object|null} user - Plain user object (e.g. from toJSON())
 */
function formatProfileUser(user) {
  if (!user) return null;
  const copy = { ...user };
  const learningPreferences = {
    levelId:
      copy.learningLevelId === 1 ||
      copy.learningLevelId === 2 ||
      copy.learningLevelId === 3 ||
      copy.learningLevelId === 4 ||
      copy.learningLevelId === 5
        ? copy.learningLevelId
        : null,
    interests: parseLearningInterests(copy.learningInterests),
    dailyNewDialogues:
      copy.dailyNewDialoguesGoal != null && Number.isFinite(Number(copy.dailyNewDialoguesGoal))
        ? Number(copy.dailyNewDialoguesGoal)
        : null,
    dailyPracticeSessions:
      copy.dailyPracticeGoal != null && Number.isFinite(Number(copy.dailyPracticeGoal))
        ? Number(copy.dailyPracticeGoal)
        : null,
  };

  delete copy.learningLevelId;
  delete copy.learningInterests;
  delete copy.dailyNewDialoguesGoal;
  delete copy.dailyPracticeGoal;

  copy.learningPreferences = learningPreferences;
  return copy;
}

module.exports = { formatProfileUser };
