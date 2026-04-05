const ApiError = require("../utils/apiError");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ detail: error.detail });
    return;
  }

  if (error && error.code === 11000) {
    res.status(409).json({ detail: "An account with this email already exists" });
    return;
  }

  if (error && error.name === "ValidationError") {
    const firstMessage = Object.values(error.errors || {})[0]?.message || "Validation failed";
    res.status(400).json({ detail: firstMessage });
    return;
  }

  console.error(error);
  res.status(500).json({ detail: "Internal server error" });
}

module.exports = errorHandler;
