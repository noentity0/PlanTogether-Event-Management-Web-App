const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ApiError = require("../utils/apiError");
const { ACCESS_TOKEN_COOKIE, decodeAccessToken } = require("../utils/security");

function extractBearerToken(authorization) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "").trim();
}

function extractCookieToken(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").reduce((accumulator, entry) => {
    const separatorIndex = entry.indexOf("=");
    if (separatorIndex < 0) {
      return accumulator;
    }

    const key = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
  }, {});

  return cookies[ACCESS_TOKEN_COOKIE] || null;
}

function extractAccessToken(req) {
  return extractBearerToken(req.headers.authorization) || extractCookieToken(req.headers.cookie);
}

async function resolveUserFromToken(token) {
  const payload = decodeAccessToken(token);
  const userId = payload.sub;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, "Invalid token payload");
  }

  const user = await User.findById(userId).exec();
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  return user;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      throw new ApiError(401, "Missing or invalid authorization header");
    }

    req.currentUser = await resolveUserFromToken(token);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Token has expired"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid token"));
      return;
    }

    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.currentUser) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  if (req.currentUser.role !== "admin") {
    next(new ApiError(403, "Admin access required"));
    return;
  }

  next();
}

async function optionalAuth(req, res, next) {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      req.currentUser = null;
      next();
      return;
    }

    req.currentUser = await resolveUserFromToken(token);
    next();
  } catch (error) {
    req.currentUser = null;
    next();
  }
}

module.exports = {
  optionalAuth,
  requireAdmin,
  requireAuth,
};
