const File = require("./file/models/file.model");
const PasswordResetRequest = require("./user/models/password-reset-request.model");
const User = require("./user/models/user.model");
const Dialogue = require("./dialogue/models/dialogue.model");
const DialoguePractice = require("./dialogue/models/dialogue-practice.model");

User.hasMany(PasswordResetRequest, {
  foreignKey: "userId",
  as: "passwordResetRequests",
  onDelete: "CASCADE",
});
PasswordResetRequest.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

// Dialogue - DialoguePractice associations
Dialogue.hasMany(DialoguePractice, {
  foreignKey: "dialogueId",
  as: "practices",
  onDelete: "CASCADE",
});
DialoguePractice.belongsTo(Dialogue, {
  foreignKey: "dialogueId",
  as: "dialogue",
  onDelete: "CASCADE",
});

// User - DialoguePractice associations
User.hasMany(DialoguePractice, {
  foreignKey: "userId",
  as: "dialoguePractices",
  onDelete: "CASCADE",
});
DialoguePractice.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

module.exports = {
  User,
  PasswordResetRequest,
  File,
  Dialogue,
  DialoguePractice,
};
