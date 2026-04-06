const { DataTypes } = require("sequelize");
const sequelize = require("../../shared/database-helpers/database");
const Dialogue = require("./dialogue.model");
const User = require("../../user/models/user.model");

const DialoguePractice = sequelize.define("DialoguePractice", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dialogueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Dialogue,
      key: "id",
    },
  },
  learningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  score: {
    type: DataTypes.ENUM("EASY", "MEDIUM", "HARD"),
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

module.exports = DialoguePractice;
