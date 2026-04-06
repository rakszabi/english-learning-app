const { Op } = require("sequelize");
const { createError } = require("../response-helpers/error-helper");
const { ERROR_CODES } = require("../response-helpers/response-helper");

async function getAdjacentElements({ id, model, orderBy = "createdAt" }) {
  const currentElement = await model.findOne({
    where: { id },
    attributes: [orderBy, "id"],
  });

  if (!currentElement) {
    throw createError(ERROR_CODES.GENERAL.NOT_FOUND, "Elem nem található!");
  }

  const previousElement = await model.findOne({
    where: {
      [orderBy]: { [Op.lt]: currentElement[orderBy] },
    },
    order: [[orderBy, "DESC"]],
    attributes: ["id"],
  });

  const nextElement = await model.findOne({
    where: {
      [orderBy]: { [Op.gt]: currentElement[orderBy] },
    },
    order: [[orderBy, "ASC"]],
    attributes: ["id"],
  });

  return {
    previousElementId: previousElement ? previousElement.id : null,
    nextElementId: nextElement ? nextElement.id : null,
  };
}

module.exports = getAdjacentElements;
