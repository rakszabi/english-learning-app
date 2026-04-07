const dialoguePracticeService = require("../services/dialogue-practice.service");
const { ERROR_CODES } = require("../../shared/response-helpers/response-helper");
const { DialoguePracticeErrors, handleError } = require("../../shared/response-helpers/error-helper");
const { SUCCESS_CODES, handleSuccess } = require("../../shared/response-helpers/success-helper");

class DialoguePracticeController {
  async createPractice(req, res) {
    try {
      const data = { ...req.body, userId: req.decoded.id };
      const practice = await dialoguePracticeService.createPractice(data);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.CREATE_SUCCESS, practice);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.CREATE_FAILED);
    }
  }

  async getMyPractices(req, res) {
    try {
      const practices = await dialoguePracticeService.getPracticesByUser(req.decoded.id);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.QUERY_SUCCESS, practices);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.QUERY_FAILED);
    }
  }

  async getPracticeById(req, res) {
    try {
      const practice = await dialoguePracticeService.getPracticeById(req.params.id);
      if (!practice) throw DialoguePracticeErrors.notFound();
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.QUERY_SUCCESS, practice);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.QUERY_FAILED);
    }
  }

  async updatePractice(req, res) {
    try {
      const practice = await dialoguePracticeService.updatePractice(
        req.params.id,
        req.decoded.id,
        req.body
      );
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.UPDATE_SUCCESS, practice);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.UPDATE_FAILED);
    }
  }

  async deletePractice(req, res) {
    try {
      await dialoguePracticeService.deletePractice(req.params.id, req.decoded.id);
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.DELETE_SUCCESS);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.DELETE_FAILED);
    }
  }

  async getNextPractice(req, res) {
    try {
      const dialogue = await dialoguePracticeService.getNextPracticeDialogue(req.decoded.id);
      if (!dialogue) {
        return res.status(404).json({
          status: "FAILED",
          message: "Nincs gyakorolható dialógus.",
          errorCode: "DIALOGUE_PRACTICE.NONE_AVAILABLE",
        });
      }
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.QUERY_SUCCESS, dialogue);
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.QUERY_FAILED);
    }
  }

  async queryPractices(req, res) {
    try {
      const { pagination, sort, search, filters } = req.body;
      const result = await dialoguePracticeService.queryPractices({ pagination, sort, search, filters });
      handleSuccess(res, SUCCESS_CODES.DIALOGUE_PRACTICE.QUERY_SUCCESS, {
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      handleError(res, error, ERROR_CODES.DIALOGUE_PRACTICE.QUERY_FAILED);
    }
  }
}

module.exports = new DialoguePracticeController();
