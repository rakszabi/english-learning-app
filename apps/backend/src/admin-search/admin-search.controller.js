const adminSearchService = require("./admin-search.service");
const {
  ERROR_CODES,
} = require("../shared/response-helpers/response-helper");
const {
  handleError,
} = require("../shared/response-helpers/error-helper");
const {
  SUCCESS_CODES,
  handleSuccess,
} = require("../shared/response-helpers/success-helper");

class AdminSearchController {
  async search(req, res) {
    try {
      const { query, types, limitPerType } = req.query;

      const parsedTypes =
        typeof types === "string" && types.length
          ? types
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined;

      const parsedLimit = limitPerType ? Number(limitPerType) : undefined;

      const results = await adminSearchService.search({
        query,
        types: parsedTypes,
        limitPerType: parsedLimit || 10,
      });

      handleSuccess(res, SUCCESS_CODES.GENERAL.QUERY_SUCCESS, {
        results,
      });
    } catch (error) {
      handleError(res, error, ERROR_CODES.GENERAL.INTERNAL_ERROR);
    }
  }
}

module.exports = new AdminSearchController();

