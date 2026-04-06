const { sendingEmail } = require("../../shared/email-helpers/email");

const sendingPasswordResetEmail = async (user, url) => {
  let html = `
  <p>Kedves ${user.firstname}!</p>
  <p>Az alábbi linkre kattintva tudod visszaállítani a jelszavadat:<br>
  <a href="${url}" target="_blank">Jelszó módosítása</a></p>
  <p><small>Ha nem kérted a jelszavad visszaállítását, akkor kérjük, hagyd figyelmen kívül ezt az e-mailt. A jelszavad nem fog megváltozni, hacsak nem kattintasz a linkre, és nem hozol létre új jelszót.</small></p>
  <p>Üdvözlettel,<br>A(z) ${process.env.WEBSITE_NAME} csapata</p>
  `;

  await sendingEmail({
    subject: `Jelszó visszaállítás`,
    html: html,
    to: user.email,
  });
};

const sendingSetPasswordEmail = async (user, url) => {
  let html = `
  <p>Kedves ${user.firstname}!</p>
  <p>Létrehoztuk a fiókodat a ${process.env.WEBSITE_NAME} oldalon. A jelszavadat az alábbi linkre kattintva tudod beállítani:<br>
  <a href="${url}" target="_blank">Jelszó beállítása</a></p>
  <p><small>Ha nem vártad ezt az e-mailt, kérjük, hagyd figyelmen kívül.</small></p>
  <p>Üdvözlettel,<br>A(z) ${process.env.WEBSITE_NAME} csapata</p>
  `;

  await sendingEmail({
    subject: `Jelszó beállítása - ${process.env.WEBSITE_NAME}`,
    html: html,
    to: user.email,
  });
};

module.exports = {
  sendingPasswordResetEmail,
  sendingSetPasswordEmail,
};
