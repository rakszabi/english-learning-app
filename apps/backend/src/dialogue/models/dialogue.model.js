const { DataTypes } = require("sequelize");
const sequelize = require("../../shared/database-helpers/database");

const Dialogue = sequelize.define("Dialogue", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dialogJson: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Dialogue;
