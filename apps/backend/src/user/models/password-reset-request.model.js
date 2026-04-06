const { DataTypes } = require("sequelize");
const sequelize = require("../../shared/database-helpers/database");
const User = require("./user.model");

const PasswordResetRequest = sequelize.define("PasswordResetRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  indexes: [], // Ne hozzon létre automatikus indexeket, csak primary key és foreign key indexek
});

module.exports = PasswordResetRequest;
