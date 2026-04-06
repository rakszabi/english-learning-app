const passport = require('passport');
const userService = require('../user/services/user.service');
const jwt = require('jsonwebtoken');
const { TOKEN_EXPIRES_TIME, REFRESH_TOKEN_EXPIRES_TIME } = require('./config');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Token generálás függvények
function generateAccessToken(userId, email, role) {
  return jwt.sign(
    { id: userId, email: email, role: role },
    process.env.SECRET_TOKEN,
    {
      expiresIn: TOKEN_EXPIRES_TIME,
    }
  );
}

function generateRefreshToken(userId, email, role) {
  return jwt.sign(
    { id: userId, email: email, role: role },
    process.env.SECRET_RTOKEN,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_TIME,
    }
  );
}

module.exports = {
  passport,
  generateAccessToken,
  generateRefreshToken
};
