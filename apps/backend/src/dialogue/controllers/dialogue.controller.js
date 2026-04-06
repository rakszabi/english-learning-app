const dialogueService = require("../services/dialogue.service");
const dialogueTopicGeneratorService = require("../services/dialogue-topic-generator.service");
const { ERROR_CODES } = require("../../shared/response-helpers/response-helper");
const { DialogueErrors, handleError } = require("../../shared/response-helpers/error-helper");
const { SUCCESS_CODES, handleSuccess } = require("../../shared/response-helpers/success-helper");

class DialogueController {
  async createDialogue(req, res) {
    try {
      const dialogue = await dialogueService.createDialogue(req.body);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.CREATE_SUCCESS, dialogue);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.CREATE_FAILED);
    }
  }

  async getAllDialogues(req, res) {
    try {
      const dialogues = await dialogueService.getAllDialogues();
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.QUERY_SUCCESS, dialogues);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.QUERY_FAILED);
    }
  }

  async getDialogueById(req, res) {
    try {
      const dialogue = await dialogueService.getDialogueById(req.params.id);
      if (!dialogue) throw DialogueErrors.notFound();
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.QUERY_SUCCESS, dialogue);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.QUERY_FAILED);
    }
  }

  async queryDialogues(req, res) {
    try {
      const { pagination, sort, search, filters } = req.body;
      const result = await dialogueService.queryDialogues({ pagination, sort, search, filters });
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.QUERY_SUCCESS, {
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.QUERY_FAILED);
    }
  }

  async updateDialogue(req, res) {
    try {
      const dialogue = await dialogueService.updateDialogue(req.params.id, req.body);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.UPDATE_SUCCESS, dialogue);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.UPDATE_FAILED);
    }
  }

  async deleteDialogue(req, res) {
    try {
      await dialogueService.deleteDialogue(req.params.id);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.DELETE_SUCCESS);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.DELETE_FAILED);
    }
  }

  async generateTopics(req, res) {
    try {
      const count = parseInt(req.query.count) || 20;
      const existingTopics = req.body.existingTopics ?? [];
      const topics = await dialogueTopicGeneratorService.generateTopics(count, existingTopics);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE.QUERY_SUCCESS, topics);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE.QUERY_FAILED);
    }
  }
}

module.exports = new DialogueController();
