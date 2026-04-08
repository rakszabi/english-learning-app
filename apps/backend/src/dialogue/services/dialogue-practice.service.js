const DialoguePractice = require("../models/dialogue-practice.model");
const Dialogue = require("../models/dialogue.model");
const User = require("../../user/models/user.model");
const queryDatabase = require("../../shared/database-helpers/query.helper");
const { DialoguePracticeErrors } = require("../../shared/response-helpers/error-helper");

class DialoguePracticeService {
  async createPractice(data) {
    const practice = await DialoguePractice.create(data);
    return await this.getPracticeById(practice.id);
  }

  /**
   * Returns the latest practice per dialogue for a user, enriched with
   * `totalPracticeCount` across all sessions for that dialogue.
   */
  async getPracticesByUser(userId) {
    const all = await DialoguePractice.findAll({
      where: { userId },
      // learningDate csak dátum, ezért másodlagos kulcsként id DESC kell,
      // hogy azonos napon belül is a legutóbb létrehozott kerüljön elsőre
      order: [["learningDate", "DESC"], ["id", "DESC"]],
      include: [{ model: Dialogue, as: "dialogue" }],
    });

    // Deduplikálás: dialógusonként csak a legutóbbi practice marad meg,
    // de a teljes ismétlésszámot beleírjuk
    const byDialogue = new Map();
    for (const practice of all) {
      const dId = practice.dialogueId;
      if (!byDialogue.has(dId)) {
        byDialogue.set(dId, { latest: practice, count: 0 });
      }
      byDialogue.get(dId).count++;
    }

    return Array.from(byDialogue.values()).map(({ latest, count }) => ({
      ...latest.toJSON(),
      totalPracticeCount: count,
    }));
  }

  /**
   * Returns the raw, unfiltered practice history for a user (all sessions).
   */
  async getPracticeHistoryByUser(userId) {
    return await DialoguePractice.findAll({
      where: { userId },
      order: [["learningDate", "DESC"], ["id", "DESC"]],
      include: [{ model: Dialogue, as: "dialogue" }],
    });
  }

  async getPracticeById(id) {
    const practice = await DialoguePractice.findOne({
      where: { id },
      include: [
        { model: Dialogue, as: "dialogue" },
        { model: User, as: "user", attributes: { exclude: ["passwordHash"] } },
      ],
    });
    if (!practice) return null;
    return practice;
  }

  async updatePractice(id, userId, data) {
    const practice = await DialoguePractice.findOne({ where: { id, userId } });
    if (!practice) throw DialoguePracticeErrors.notFound();
    await practice.update(data);
    return await this.getPracticeById(id);
  }

  async deletePractice(id, userId) {
    const practice = await DialoguePractice.findOne({ where: { id, userId } });
    if (!practice) throw DialoguePracticeErrors.notFound();
    await practice.destroy();
    return true;
  }

  async getNextPracticeDialogue(userId) {
    // ── Scoring configuration ─────────────────────────────────────────────
    // Weights must sum to 1.0
    const WEIGHTS = {
      recency:    0.40, // Mennyi ideje volt legutóbb gyakorolva (régebben = jobb)
      difficulty: 0.35, // Legutóbbi practice nehézsége (HARD = jobb)
      frequency:  0.15, // Hányszor volt összesen gyakorolva (kevesebbet = jobb)
      random:     0.10, // Kis véletlenszerűség, hogy ne legyen determinisztikus
    };

    // Ennél régebbi legutóbbi practice = maximális recency pont (nem nő tovább)
    const MAX_RECENCY_DAYS = 30;

    const DIFFICULTY_SCORE = { HARD: 1.0, MEDIUM: 0.6, EASY: 0.2 };
    // ─────────────────────────────────────────────────────────────────────

    const allPractices = await DialoguePractice.findAll({
      where: { userId },
      include: [{ model: Dialogue, as: "dialogue" }],
      // learningDate csak dátum → azonos napon belül id DESC adja a valódi sorrendet
      order: [["learningDate", "DESC"], ["id", "DESC"]],
    });

    if (allPractices.length === 0) return null;

    // Csoportosítás dialogueId szerint; a fenti rendezés garantálja,
    // hogy az első előfordulás mindig a ténylegesen legutóbbi practice
    const byDialogue = new Map();
    for (const practice of allPractices) {
      const dId = practice.dialogueId;
      if (!byDialogue.has(dId)) {
        byDialogue.set(dId, { dialogue: practice.dialogue, latest: practice, count: 0 });
      }
      byDialogue.get(dId).count++;
    }

    // Raw értékek kiszámítása
    // createdAt-et használjuk a recency-hez, mert a learningDate csak dátum,
    // így azonos napon belül is pontos az eltelt idő
    const now = new Date();
    const candidates = Array.from(byDialogue.values()).map(({ dialogue, latest, count }) => {
      const ms = now - new Date(latest.createdAt);
      const daysSince = Math.max(0, ms / 86_400_000); // törtrész is számít
      return {
        dialogue,
        daysSince,
        difficultyRaw: DIFFICULTY_SCORE[latest.score] ?? 0.5,
        practiceCount: count,
      };
    });

    // Frequency normalizálásához kell a max count a poolban
    const maxCount = Math.max(...candidates.map((c) => c.practiceCount));

    // Végső score kiszámítása minden jelöltnek
    const scored = candidates.map((c) => ({
      dialogue: c.dialogue,
      score:
        WEIGHTS.recency    * Math.min(c.daysSince / MAX_RECENCY_DAYS, 1) +
        WEIGHTS.difficulty * c.difficultyRaw +
        WEIGHTS.frequency  * (1 - (c.practiceCount - 1) / maxCount) +
        WEIGHTS.random     * Math.random(),
    }));

    // Legmagasabb score-ú dialógus visszaadása
    scored.sort((a, b) => b.score - a.score);
    return scored[0].dialogue;
  }

  async queryPractices({ pagination, sort, search, filters }) {
    return await queryDatabase({
      model: DialoguePractice,
      pagination,
      sort,
      search,
      filters,
      include: [
        { model: Dialogue, as: "dialogue" },
        { model: User, as: "user", attributes: { exclude: ["passwordHash"] } },
      ],
    });
  }
}

module.exports = new DialoguePracticeService();
