const { DataTypes } = require("sequelize");
const sequelize = require("../../shared/database-helpers/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false,
      validate: { isEmail: true },
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
    },
    firstname: {
      type: DataTypes.STRING,
    },
    lastname: {
      type: DataTypes.STRING,
    },
    avatarUrl: {
      type: DataTypes.STRING,
    },
    profileHeadline: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USER",
      validate: { isIn: [["ADMIN", "USER"]] },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ACTIVE",
      validate: { isIn: [["ACTIVE", "INACTIVE", "DELETED"]] },
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "local",
      validate: { isIn: [["local"]] },
    },
    learningLevelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // TEXT + JSON string: shared MySQL hosts often break on native JSON + alter/sync
    learningInterests: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
    },
    dailyNewDialoguesGoal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dailyPracticeGoal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ["passwordHash"] },
    },
    scopes: {
      withSensitive: { attributes: { include: ["passwordHash"] } },
      active: { where: { status: "ACTIVE" } },
    },
    hooks: {
      beforeValidate(user) {
        if (user.email) user.email = user.email.trim().toLowerCase();
      },
      beforeSave(user) {
        const v = user.getDataValue("learningInterests");
        if (Array.isArray(v)) {
          user.setDataValue("learningInterests", JSON.stringify(v));
        }
      },
    },
  }
);

module.exports = User;
