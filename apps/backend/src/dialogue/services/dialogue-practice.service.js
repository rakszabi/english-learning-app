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

  async getPracticesByUser(userId) {
    return await DialoguePractice.findAll({
      where: { userId },
      order: [["learningDate", "DESC"]],
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
    const SCORE_WEIGHTS = { HARD: 3, MEDIUM: 2, EASY: 1 };

    const allPractices = await DialoguePractice.findAll({
      where: { userId },
      include: [{ model: Dialogue, as: "dialogue" }],
      order: [["learningDate", "DESC"]],
    });

    if (allPractices.length === 0) return null;

    // Legutóbbi gyakorlás dialogusonként
    const latestPerDialogue = new Map();
    for (const practice of allPractices) {
      if (!latestPerDialogue.has(practice.dialogueId)) {
        latestPerDialogue.set(practice.dialogueId, practice);
      }
    }

    const candidates = Array.from(latestPerDialogue.values());

    // Legalább 1 napja gyakorolt dialógusok
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const overdue = candidates.filter(
      (p) => new Date(p.learningDate) <= yesterday
    );

    const pool = overdue.length > 0 ? overdue : candidates;

    // Súlyozott random pick
    const weighted = [];
    for (const practice of pool) {
      const weight = SCORE_WEIGHTS[practice.score] ?? 1;
      for (let i = 0; i < weight; i++) {
        weighted.push(practice);
      }
    }

    const selected = weighted[Math.floor(Math.random() * weighted.length)];
    return selected.dialogue;
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
