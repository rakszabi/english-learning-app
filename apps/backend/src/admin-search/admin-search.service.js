const { Op } = require("sequelize");
const { adminSearchConfig } = require("./admin-search.config");

class AdminSearchService {
  /**
   * Globális admin keresés.
   * @param {Object} params
   * @param {string} params.query - Keresőkifejezés
   * @param {string[]} [params.types] - Szűrés entitás típusokra (pl. ["user","product"])
   * @param {number} [params.limitPerType=10] - Találatok maximális száma típusonként
   */
  async search({ query, types, limitPerType = 10 }) {
    if (!query || typeof query !== "string" || !query.trim()) {
      return [];
    }

    const trimmedQuery = query.trim();

    // Ha a types meg van adva, szűrjük a konfigot
    const activeConfigs =
      Array.isArray(types) && types.length
        ? adminSearchConfig.filter((c) => types.includes(c.type))
        : adminSearchConfig;

    const resultsPerModel = await Promise.all(
      activeConfigs.map(async (conf) => {
        const {
          model,
          type,
          searchFields,
          titleField,
          extraFields = [],
          where = {},
        } = conf;

        // OR feltétel az összes keresett mezőre
        const orConditions = searchFields.map((field) => ({
          [field]: { [Op.like]: `%${trimmedQuery}%` },
        }));

        const whereCombined = {
          ...where,
          [Op.or]: orConditions,
        };

        const attributes = ["id", titleField, ...extraFields];

        const rows = await model.findAll({
          where: whereCombined,
          attributes,
          limit: limitPerType,
          order: [[titleField, "ASC"]],
        });

        return rows.map((row) => {
          const json = row.toJSON();
          const title = json[titleField];

          const extra = {};
          extraFields.forEach((f) => {
            if (json[f] !== undefined) {
              extra[f] = json[f];
            }
          });

          return {
            id: json.id,
            type,
            title: title ?? "",
            ...(Object.keys(extra).length ? { extra } : {}),
          };
        });
      })
    );

    return resultsPerModel.flat();
  }
}

module.exports = new AdminSearchService();

