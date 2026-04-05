const express = require("express");

const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { serializeUser } = require("../utils/formatters");
const { createAccessToken, hashPassword, verifyPassword } = require("../utils/security");
const { validateLoginPayload, validateRegisterPayload } = require("../utils/validation");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, name, password } = validateRegisterPayload(req.body);
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    const token = createAccessToken(user._id.toString(), user.email);
    res.status(201).json({
      token,
      user: serializeUser(user),
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = validateLoginPayload(req.body);
    const user = await User.findOne({ email }).select("+password_hash").exec();

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = createAccessToken(user._id.toString(), user.email);
    res.json({
      token,
      user: serializeUser(user),
    });
  })
);

router.get(
  "/verify",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(serializeUser(req.currentUser));
  })
);

module.exports = router;
