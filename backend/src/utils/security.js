const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwtAlgorithm, jwtExpireMinutes, jwtSecretKey } = require("../config/env");

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function createAccessToken(userId, email) {
  return jwt.sign(
    {
      sub: userId,
      email,
    },
    jwtSecretKey,
    {
      algorithm: jwtAlgorithm,
      expiresIn: `${jwtExpireMinutes}m`,
    }
  );
}

function decodeAccessToken(token) {
  return jwt.verify(token, jwtSecretKey, {
    algorithms: [jwtAlgorithm],
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  decodeAccessToken,
};
