const bcrypt = require("bcryptjs");
const { randomBytes } = require("@noble/hashes/utils.js");
const { PASSWORD_RESET_TOKEN_TIME } = require("../../shared/config");
const PasswordResetRequest = require("../models/password-reset-request.model");
const { Op } = require("sequelize");

const generateToken = async () => {
  const rawToken = Buffer.from(randomBytes(32)).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 10);
  return { rawToken, hashedToken };
};

class PasswordResetRequestService {
  // Létrehoz egy reset requestet a userhez és visszaadja a nyers tokent (set password / forgot password)
  async createRequestForUser(userId) {
    const { rawToken, hashedToken } = await generateToken();
    await this.createPasswordResetRequest({ userId, token: hashedToken });
    return rawToken;
  }

  // Új PasswordResetRequest létrehozása
  async createPasswordResetRequest(passwordResetRequestRaw) {
    // Először törlünk minden token-t, amit a userhez tartozik
    const passwordResetRequests = await PasswordResetRequest.findAll({
      where: { userId: passwordResetRequestRaw.userId },
    });
    for (let i = 0; i < passwordResetRequests.length; i++) {
      await passwordResetRequests[i].destroy();
    }

    await PasswordResetRequest.create(passwordResetRequestRaw);

    return true;
  }

  // Egy PasswordResetRequest lekérése userId alapján
  async getPasswordResetRequestByUserId(userId) {
    const passwordResetRequest = await PasswordResetRequest.findOne({
      where: userId,
    });
    if (!passwordResetRequest) return null;

    return passwordResetRequest;
  }

  // Lekérjük az összes PasswordResetRequest-et, ami még nem járt le
  async getAllValidPasswordResetRequest() {
    const passwordResetRequests = await PasswordResetRequest.findAll({
      where: {
        createdAt: {
          [Op.gt]: new Date(Date.now() - PASSWORD_RESET_TOKEN_TIME),
        },
      },
    });
    return passwordResetRequests;
  }

  // Töröljük a PasswordResetRequest-et
  async removePasswordResetRequest(id) {
    const passwordResetRequest = await PasswordResetRequest.findByPk(id);
    if (!passwordResetRequest) {
      return null;
    }

    await passwordResetRequest.destroy();
    return true;
  }
}

module.exports = new PasswordResetRequestService();
