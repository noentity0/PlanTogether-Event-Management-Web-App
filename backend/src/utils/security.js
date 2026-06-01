const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { cookieSameSite, cookieSecure, jwtAlgorithm, jwtExpireMinutes, jwtSecretKey } = require("../config/env");

const ACCESS_TOKEN_COOKIE = "plantogether_access_token";

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

function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    maxAge: jwtExpireMinutes * 60 * 1000,
    path: "/",
  };
}

function clearAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: "/",
  };
}

module.exports = {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  clearAccessTokenCookieOptions,
  hashPassword,
  verifyPassword,
  createAccessToken,
  decodeAccessToken,
};
