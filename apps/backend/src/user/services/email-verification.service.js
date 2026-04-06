const { sendingEmail } = require("../../shared/email-helpers/email");

const sendingEmailVerification = async (user, url) => {
  let html = `
  <p>Kedves ${user.firstname}!</p>
  <p>Köszönjük, hogy regisztráltál a ${process.env.WEBSITE_NAME} oldalra!</p>
  <p>Az email címed megerősítéséhez kattints az alábbi linkre:<br>
  <a href="${url}" target="_blank">Email cím megerősítése</a></p>
  <p><small>Ha nem regisztráltál a ${process.env.WEBSITE_NAME} oldalra, akkor kérjük, hagyd figyelmen kívül ezt az e-mailt.</small></p>
  <p>Üdvözlettel,<br>A(z) ${process.env.WEBSITE_NAME} csapata</p>
  `;

  await sendingEmail({
    subject: `Email cím megerősítése - ${process.env.WEBSITE_NAME}`,
    html: html,
    to: user.email,
  });
};

module.exports = {
  sendingEmailVerification,
};
