const axios = require("axios");

const url = "https://www.google.com/recaptcha/api/siteverify";
const secretKey = process.env.RECAPTCHA_SECRET_KEY;

async function recaptchaVerification(recaptchaToken) {
  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", recaptchaToken);

  const response = await axios.post(url, params);
  return response.data.success;
}

module.exports = { recaptchaVerification };
