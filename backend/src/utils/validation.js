const ApiError = require("./apiError");

const EVENT_CATEGORIES = ["Music", "Tech", "Sports", "Art", "Food", "Business"];

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function requireString(value, detail) {
  if (typeof value !== "string") {
    throw new ApiError(400, detail);
  }

  return value.trim();
}

function validateRegisterPayload(payload = {}) {
  const name = requireString(payload.name, "Enter a valid name");
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (name.length < 2 || name.length > 80) {
    throw new ApiError(400, "Enter a valid name");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Enter a valid email");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  return {
    name,
    email,
    password,
  };
}

function validateLoginPayload(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  return {
    email,
    password,
  };
}

function validateCommentPayload(payload = {}) {
  const message = requireString(payload.message, "Comment must be between 2 and 600 characters");

  if (message.length < 2 || message.length > 600) {
    throw new ApiError(400, "Comment must be between 2 and 600 characters");
  }

  return {
    message,
  };
}

function validateEventPayload(payload = {}) {
  const title = requireString(payload.title, "Title must be between 3 and 120 characters");
  const description = requireString(payload.description, "Description must be between 10 and 1500 characters");
  const date = requireString(payload.date, "Use date format YYYY-MM-DD and time format HH:MM");
  const time = requireString(payload.time, "Use date format YYYY-MM-DD and time format HH:MM");
  const location = requireString(payload.location, "Location must be between 2 and 200 characters");
  const category = requireString(payload.category, "Select a valid category");
  const rawCapacity = payload.capacity;

  if (title.length < 3 || title.length > 120) {
    throw new ApiError(400, "Title must be between 3 and 120 characters");
  }

  if (description.length < 10 || description.length > 1500) {
    throw new ApiError(400, "Description must be between 10 and 1500 characters");
  }

  if (location.length < 2 || location.length > 200) {
    throw new ApiError(400, "Location must be between 2 and 200 characters");
  }

  if (!EVENT_CATEGORIES.includes(category)) {
    throw new ApiError(400, "Select a valid category");
  }

  let capacity = null;
  if (rawCapacity !== null && rawCapacity !== undefined && rawCapacity !== "") {
    capacity = Number(rawCapacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
      throw new ApiError(400, "Capacity must be between 1 and 10000");
    }
  }

  return {
    title,
    description,
    date,
    time,
    location,
    category,
    capacity,
  };
}

module.exports = {
  EVENT_CATEGORIES,
  validateCommentPayload,
  validateEventPayload,
  validateLoginPayload,
  validateRegisterPayload,
};
