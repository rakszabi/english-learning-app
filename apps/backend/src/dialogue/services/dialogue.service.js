const { Op } = require("sequelize");
const Dialogue = require("../models/dialogue.model");
const DialoguePractice = require("../models/dialogue-practice.model");
const queryDatabase = require("../../shared/database-helpers/query.helper");
const { DialogueErrors } = require("../../shared/response-helpers/error-helper");

class DialogueService {
  async createDialogue(data) {
    const dialogue = await Dialogue.create(data);
    return await this.getDialogueById(dialogue.id);
  }

  async getAllDialogues() {
    return await Dialogue.findAll({
      order: [["createdAt", "DESC"]],
    });
  }

  async getAllTopics() {
    const dialogues = await Dialogue.findAll({ attributes: ["topic"] });
    return dialogues.map((d) => d.topic);
  }

  async getDialogueById(id) {
    const dialogue = await Dialogue.findOne({ where: { id } });
    if (!dialogue) return null;
    return dialogue;
  }

  async updateDialogue(id, data) {
    const dialogue = await Dialogue.findOne({ where: { id } });
    if (!dialogue) throw DialogueErrors.notFound();
    await dialogue.update(data);
    return await this.getDialogueById(id);
  }

  async deleteDialogue(id) {
    const dialogue = await Dialogue.findOne({ where: { id } });
    if (!dialogue) throw DialogueErrors.notFound();
    await dialogue.destroy();
    return true;
  }

  async countUnpracticedByUser(userId) {
    return await Dialogue.count({
      include: [
        {
          model: DialoguePractice,
          as: "practices",
          required: false,
          where: { userId },
          attributes: [],
        },
      ],
      where: { "$practices.id$": { [Op.is]: null } },
    });
  }

  _scoreToNumber(score) {
    if (score === "EASY") return 3;
    if (score === "MEDIUM") return 2;
    return 1;
  }

  _roundedAverageToScoreLabel(rounded) {
    if (rounded >= 3) return "EASY";
    if (rounded >= 2) return "MEDIUM";
    return "HARD";
  }

  async getPracticedByUser(userId) {
    const practices = await DialoguePractice.findAll({
      where: { userId },
      include: [{ model: Dialogue, as: "dialogue", attributes: ["id", "topic", "createdAt"] }],
      order: [
        ["learningDate", "DESC"],
        ["id", "DESC"],
      ],
      attributes: ["score", "learningDate", "dialogueId"],
    });

    const byDialogue = new Map();
    for (const p of practices) {
      const dId = p.dialogueId;
      if (!byDialogue.has(dId)) {
        byDialogue.set(dId, {
          dialogue: p.dialogue,
          latest: p,
          scores: [],
        });
      }
      byDialogue.get(dId).scores.push(p.score);
    }

    const rows = Array.from(byDialogue.values()).map(
      ({ dialogue, latest, scores }) => {
        const n = scores.length;
        const avgNum =
          scores.reduce((sum, s) => sum + this._scoreToNumber(s), 0) / n;
        const averageScore = this._roundedAverageToScoreLabel(Math.round(avgNum));
        const scoreBreakdown = scores.reduce(
          (acc, s) => {
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          },
          { EASY: 0, MEDIUM: 0, HARD: 0 }
        );
        return {
          id: dialogue.id,
          topic: dialogue.topic,
          createdAt: dialogue.createdAt,
          practiced: true,
          practiceCount: n,
          latestPractice: {
            score: latest.score,
            learningDate: latest.learningDate,
          },
          averageScore,
          scoreBreakdown,
        };
      }
    );

    rows.sort((a, b) => {
      const da = String(b.latestPractice.learningDate).localeCompare(
        String(a.latestPractice.learningDate)
      );
      if (da !== 0) return da;
      return b.id - a.id;
    });

    return rows;
  }

  async getUnpracticedByUser(userId) {
    const rows = await Dialogue.findAll({
      attributes: ["id", "topic", "createdAt"],
      include: [
        {
          model: DialoguePractice,
          as: "practices",
          required: false,
          where: { userId },
          attributes: [],
        },
      ],
      where: { "$practices.id$": { [Op.is]: null } },
      order: [["createdAt", "DESC"]],
    });
    return rows.map((d) => ({
      id: d.id,
      topic: d.topic,
      createdAt: d.createdAt,
      practiced: false,
      practiceCount: 0,
    }));
  }

  async queryDialogues({ pagination, sort, search, filters }) {
    return await queryDatabase({
      model: Dialogue,
      pagination,
      sort,
      search,
      filters,
    });
  }
}

module.exports = new DialogueService();
