const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const queryDatabase = require("../../shared/database-helpers/query.helper");
const { UserErrors } = require("../../shared/response-helpers/error-helper");
const getAdjacentElements = require("../../shared/database-helpers/adjacent-element.helper");

class UserService {
  // Új User létrehozása
  async createUser(userRaw) {
    const user = await User.create(userRaw);

    return await this.getUserById(user.id);
  }

  // E-mail meglét ellenőrzése
  async countUserByEmail(email) {
    return await User.count({ where: { email } });
  }

  // Minden felhasználó lekérése
  async getUsers() {
    const users = await User.findAll({
      order: [["email", "ASC"]],
    });
    const userDatas = users.map((user) => {
      const userData = user.toJSON();
      return userData;
    });

    return userDatas;
  }

  // Admin felhasználók lekérése
  async getAdminUsers() {
    const users = await User.findAll({
      where: { role: "ADMIN" },
      order: [["email", "ASC"]],
    });
    const userDatas = users.map((user) => {
      const userData = user.toJSON();
      return userData;
    });

    return userDatas;
  }

  // Egy felhasználó lekérése ID alapján
  async getUserById(id, includeAdjacent = false) {
    const user = await User.findByPk(id, {});
    if (!user) return null;

    const userData = user.toJSON();

    if (includeAdjacent) {
      try {
        const adjacentElements = await getAdjacentElements({
          id: id,
          model: User,
          orderBy: "createdAt"
        });

        return {
          ...userData,
          previousElementId: adjacentElements.previousElementId,
          nextElementId: adjacentElements.nextElementId
        };
      } catch (error) {
        // Ha hiba van az adjacent element lekérdezésben, csak a user-t adjuk vissza
        return userData;
      }
    }

    return userData;
  }

  // Egy felhasználó lekérése email alapján
  async getUserByEmail(email) {
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) return null;

    const userData = user.toJSON();
    return userData;
  }

  // Felhasználók státusz frissítése
  async updateUserStatus(ids, status) {
    await User.update({ status }, { where: { id: ids } });

    const updatedUsers = await User.findAll({
      where: {
        id: ids,
      },
    });

    return updatedUsers.map((user) => {
      const plainUser = user.toJSON();
      return plainUser;
    });
  }

  // Felhasználó frissítése ID alapján
  async updateUser(id, userRaw) {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return null;
    }

    // Adatok frissítése
    const user = await User.findByPk(id);
    await user.update(userRaw);

    // Visszaadjuk az aktualizált elemet
    return await this.getUserById(id);
  }

  // Profil frissítése
  async updateProfile(email, profileRaw) {
    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      return null;
    }

    // Adatok frissítése
    const profile = await User.findOne({ where: { email: email } });
    await profile.update(profileRaw);

    // Visszaadjuk az aktualizált elemet
    return await this.getUserById(profile.id);
  }

  async changePassword(email, oldPassword, newPassword) {
    try {
      const existingUser = await this.getUserByEmail(email);
      if (!existingUser) return null;

      // Jelszó hash lekérése a withSensitive scope-pal
      const user = await User.scope("withSensitive").findOne({
        where: { email: email },
      });
      if (!user) {
        throw UserErrors.notFound();
      }

      const isValidPasswordbcrypt = await bcrypt.compare(
        oldPassword,
        user.passwordHash
      );

      if (isValidPasswordbcrypt) {
        // Aszinkron jelszó hash-elés await-tel
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await user.update({ passwordHash: hash });
        return true;
      } else {
        throw UserErrors.passwordMismatch();
      }
    } catch (error) {
      throw error;
    }
  }

  // Felhasználó törlése ID alapján
  async removeUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      return null;
    }

    await user.destroy();
    return true;
  }

  async queryUsers({ pagination, sort, search, filters }) {
    const result = await queryDatabase({
      model: User,
      pagination,
      sort,
      search,
      filters,
    });

    // Adatok átalakítása
    result.data = result.data.map((user) => {
      const plainObject = user.toJSON();
      return plainObject;
    });

    return result;
  }

  async getPasswordByEmail(email) {
    const user = await User.scope("withSensitive").findOne({
      where: { email: email },
    });
    if (!user) return null;

    const userData = user.toJSON();
    return userData.passwordHash;
  }

  // Felhasználó bejelentkezési idő frissítése
  async updateLastLoginAt(email) {
    const user = await User.findOne({ where: { email: email } });
    if (!user) return null;

    await user.update({ lastLoginAt: new Date() });
    return user;
  }

  // Email verifikáció ellenőrzése
  async isEmailVerified(email) {
    const user = await User.findOne({ where: { email: email } });
    if (!user) return false;

    return user.emailVerifiedAt !== null;
  }

  // Email verifikálása
  async verifyEmail(email) {
    const user = await User.findOne({ where: { email: email } });
    if (!user) return null;

    await user.update({ emailVerifiedAt: new Date() });
    return user;
  }

  // Email verifikációs token generálása
  generateEmailVerificationToken(email) {
    const timestamp = Date.now().toString();
    const data = `${email}|${timestamp}`;
    return Buffer.from(data, "utf-8").toString("base64");
  }

}

module.exports = new UserService();
