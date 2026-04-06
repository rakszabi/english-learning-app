const { Op } = require("sequelize");

const User = require("../user/models/user.model");

/**
 * Konfiguráció: mely modellekben, mely mezőkben keresünk.
 * Itt könnyen bővíthető a keresés a jövőben.
 */
const adminSearchConfig = [
  // User
  {
    model: User,
    type: "user",
    titleField: "email",
    searchFields: ["email", "firstname", "lastname"],
    extraFields: ["firstname", "lastname"],
    where: { status: { [Op.ne]: "DELETED" } },
  },
];

module.exports = {
  adminSearchConfig,
};

