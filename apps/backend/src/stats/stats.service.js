const DialoguePractice = require("../dialogue/models/dialogue-practice.model");

class StatsService {
  /**
   * Returns daily activity for the last `days` days for a given user.
   * Each entry contains:
   *   - date: 'YYYY-MM-DD'
   *   - newCount: first-ever practice of that dialogue (= "learned new")
   *   - reviewCount: any subsequent practice of an already-seen dialogue
   *
   * "First-ever" is determined by the lowest `id` per dialogueId across
   * ALL time, not just the requested window — so a dialogue first seen
   * 60 days ago is always "review" in the current window.
   */
  async getDailyActivity(userId, days = 30) {
    const allPractices = await DialoguePractice.findAll({
      where: { userId },
      attributes: ["id", "dialogueId", "learningDate"],
      order: [["id", "ASC"]],
    });

    // Track which practice id was the very first for each dialogue
    const firstPracticeId = new Map();
    for (const p of allPractices) {
      if (!firstPracticeId.has(p.dialogueId)) {
        firstPracticeId.set(p.dialogueId, p.id);
      }
    }

    // Build ordered date buckets for the requested window
    const dateMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, { date: key, newCount: 0, reviewCount: 0 });
    }

    // Classify each practice into its date bucket
    for (const p of allPractices) {
      const entry = dateMap.get(p.learningDate);
      if (!entry) continue;

      if (firstPracticeId.get(p.dialogueId) === p.id) {
        entry.newCount++;
      } else {
        entry.reviewCount++;
      }
    }

    return Array.from(dateMap.values());
  }
}

module.exports = new StatsService();
