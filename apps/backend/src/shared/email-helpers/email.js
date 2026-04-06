const nodemailer = require("nodemailer");

async function sendingEmail({
  subject,
  html,
  to = process.env.ADMIN_EMAIL,
  replyTo = process.env.EMAIL_FROM,
}) {
  const mailOptions = {
    from: `${process.env.WEBSITE_NAME} <${process.env.EMAIL_FROM}>`,
    to: to,
    subject: subject,
    html: html,
    replyTo: replyTo,
  };
  await createTransport().sendMail(mailOptions);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PSW,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

module.exports = {
  sendingEmail,
};
