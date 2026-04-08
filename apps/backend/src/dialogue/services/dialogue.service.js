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

  async getPracticedByUser(userId) {
    const practices = await DialoguePractice.findAll({
      where: { userId },
      include: [{ model: Dialogue, as: "dialogue", attributes: ["id", "topic", "createdAt"] }],
      order: [["learningDate", "DESC"]],
      attributes: ["score", "learningDate", "dialogueId"],
    });

    const seenIds = new Set();
    const result = [];
    for (const practice of practices) {
      if (!seenIds.has(practice.dialogueId)) {
        seenIds.add(practice.dialogueId);
        result.push({
          id: practice.dialogue.id,
          topic: practice.dialogue.topic,
          createdAt: practice.dialogue.createdAt,
          latestPractice: {
            score: practice.score,
            learningDate: practice.learningDate,
          },
        });
      }
    }
    return result;
  }

  async getUnpracticedByUser(userId) {
    return await Dialogue.findAll({
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
