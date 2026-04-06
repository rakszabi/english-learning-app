const Dialogue = require("../models/dialogue.model");
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
