const express = require("express");

const User = require("../models/User");
const { requireAdmin, requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { serializeUser } = require("../utils/formatters");

const router = express.Router();

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ created_at: -1 }).lean().exec();
    res.json(users.map(serializeUser));
  })
);

module.exports = router;
