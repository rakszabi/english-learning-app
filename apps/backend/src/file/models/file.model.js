const { DataTypes } = require("sequelize");
const sequelize = require("../../shared/database-helpers/database");

const File = sequelize.define("File", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  webpFilename: DataTypes.TEXT,
  originalName: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  webpPath: DataTypes.TEXT,
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  webpUrl: DataTypes.TEXT,
  mimetype: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(["PUBLISHED", "DELETED"]),
    defaultValue: "PUBLISHED",
  },
}, {
  indexes: [], // Ne hozzon létre automatikus indexeket, csak primary key és foreign key indexek
});

module.exports = File;
