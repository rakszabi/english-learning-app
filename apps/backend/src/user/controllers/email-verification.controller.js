const userService = require("../services/user.service");

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Token dekódolása (egyszerű base64 dekódolás)
    const decodedData = Buffer.from(token, "base64").toString("utf-8");
    const [email, timestamp] = decodedData.split("|");

    // Ellenőrizzük, hogy a token nem régebbi mint 24 óra
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 óra milliszekundumban

    if (tokenAge > maxAge) {
      return res.render("email-verification-error", {
        title: "A verifikációs link lejárt!",
        message:
          "A verifikációs link lejárt. Kérjük, kérj új verifikációs emailt.",
        supportEmail: process.env.CONTACT_INFO_EMAIL,
        supportTelephone: process.env.CONTACT_INFO_TELEPHONE,
        supportName: process.env.CONTACT_INFO_NAME,
      });
    }

    // Ellenőrizzük, hogy a felhasználó létezik
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.render("email-verification-error", {
        title: "Felhasználó nem található!",
        message: "A felhasználó nem található a rendszerben.",
        supportEmail: process.env.CONTACT_INFO_EMAIL,
        supportTelephone: process.env.CONTACT_INFO_TELEPHONE,
        supportName: process.env.CONTACT_INFO_NAME,
      });
    }

    // Ellenőrizzük, hogy még nincs verifikálva
    if (user.emailVerifiedAt) {
      return res.render("email-verification-success", {
        title: "Email már verifikálva!",
        message: "Az email címed már korábban verifikálva lett.",
      });
    }

    // Email verifikálása
    await userService.verifyEmail(email);

    res.render("email-verification-success", {
      title: "E-mail cím sikeresen megerősítve!",
      message: "Az e-mail címedet sikeresen megerősítetted.",
    });
  } catch (error) {
    res.render("email-verification-error", {
      title: "Sikertelen email verifikáció!",
      message: "Hiba történt az email verifikáció során. Kérjük, próbáld újra.",
      supportEmail: process.env.CONTACT_INFO_EMAIL,
      supportTelephone: process.env.CONTACT_INFO_TELEPHONE,
      supportName: process.env.CONTACT_INFO_NAME,
    });
  }
};
