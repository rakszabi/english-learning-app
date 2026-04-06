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
