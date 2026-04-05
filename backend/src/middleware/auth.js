const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ApiError = require("../utils/apiError");
const { decodeAccessToken } = require("../utils/security");

function extractBearerToken(authorization) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "").trim();
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
    const token = extractBearerToken(req.headers.authorization);

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

async function optionalAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

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
  requireAuth,
};
