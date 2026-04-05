const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { nowUtc, parseEventDateTime } = require("../utils/date");
const { deriveDisplayName, serializeEvent } = require("../utils/formatters");
const { validateCommentPayload, validateEventPayload } = require("../utils/validation");

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEventFilters(query) {
  const conditions = [];
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const category = typeof query.category === "string" ? query.category.trim() : "";
  const includePast =
    query.include_past === true ||
    query.include_past === "true" ||
    query.include_past === "1";

  if (!includePast) {
    conditions.push({
      $or: [{ starts_at: { $gte: nowUtc() } }, { startsAt: { $gte: nowUtc() } }],
    });
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    conditions.push({
      $or: [{ title: regex }, { description: regex }, { location: regex }],
    });
  }

  if (category && category !== "All") {
    conditions.push({ category });
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions };
}

function buildUserEntry(user) {
  return {
    userId: user._id.toString(),
    name: user.name || deriveDisplayName(user.email),
    email: user.email,
    joinedAt: nowUtc(),
  };
}

function buildBookmarkEntry(user) {
  return {
    id: user._id.toString(),
    name: user.name || deriveDisplayName(user.email),
    email: user.email,
  };
}

function buildCommentEntry(message, user) {
  return {
    id: crypto.randomUUID(),
    author: {
      id: user._id.toString(),
      name: user.name || deriveDisplayName(user.email),
      email: user.email,
    },
    message,
    createdAt: nowUtc(),
  };
}

function isEventOwner(event, user) {
  return Boolean(user && event.createdBy && event.createdBy.toString() === user._id.toString());
}

function includePrivateLists(event, user) {
  return isEventOwner(event, user);
}

function ensureCapacityAvailable(event) {
  return event.capacity == null || event.registrations.length < event.capacity;
}

async function getEventOr404(eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(404, "Event not found");
  }

  const event = await Event.findById(eventId).exec();
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return event;
}

function buildEventDocument(payload, startsAt, currentUser) {
  return {
    title: payload.title,
    description: payload.description,
    date: payload.date,
    time: payload.time,
    location: payload.location,
    category: payload.category,
    capacity: payload.capacity,
    startsAt,
    createdBy: currentUser._id,
    createdByName: currentUser.name || deriveDisplayName(currentUser.email),
    createdByEmail: currentUser.email,
    registrations: [],
    bookmarkedBy: [],
    comments: [],
  };
}

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = validateEventPayload(req.body);
    let startsAt;

    try {
      startsAt = parseEventDateTime(payload.date, payload.time);
    } catch (error) {
      throw new ApiError(400, "Use date format YYYY-MM-DD and time format HH:MM");
    }

    if (startsAt <= nowUtc()) {
      throw new ApiError(400, "Event date and time must be in the future");
    }

    const event = await Event.create(buildEventDocument(payload, startsAt, req.currentUser));
    res.status(201).json(
      serializeEvent(event, req.currentUser, {
        includePrivate: true,
      })
    );
  })
);

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const events = await Event.find(buildEventFilters(req.query)).sort({ starts_at: 1 }).lean().exec();
    res.json(events.map((event) => serializeEvent(event, req.currentUser)));
  })
);

router.get(
  "/my/created",
  requireAuth,
  asyncHandler(async (req, res) => {
    const events = await Event.find({ $or: [{ created_by: req.currentUser._id }, { createdBy: req.currentUser._id }] })
      .sort({ starts_at: 1 })
      .lean()
      .exec();
    res.json(events.map((event) => serializeEvent(event, req.currentUser)));
  })
);

router.get(
  "/my/registered",
  requireAuth,
  asyncHandler(async (req, res) => {
    const events = await Event.find({
      $or: [
        { "registrations.user_id": req.currentUser._id.toString() },
        { "registrations.userId": req.currentUser._id.toString() },
      ],
    })
      .sort({ starts_at: 1 })
      .lean()
      .exec();

    res.json(events.map((event) => serializeEvent(event, req.currentUser)));
  })
);

router.get(
  "/my/bookmarked",
  requireAuth,
  asyncHandler(async (req, res) => {
    const events = await Event.find({
      $or: [{ "bookmarked_by.id": req.currentUser._id.toString() }, { "bookmarkedBy.id": req.currentUser._id.toString() }],
    })
      .sort({ starts_at: 1 })
      .lean()
      .exec();

    res.json(events.map((event) => serializeEvent(event, req.currentUser)));
  })
);

router.get(
  "/:eventId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

router.put(
  "/:eventId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);

    if (!isEventOwner(event, req.currentUser)) {
      throw new ApiError(403, "You can only edit your own events");
    }

    const payload = validateEventPayload(req.body);
    let startsAt;

    try {
      startsAt = parseEventDateTime(payload.date, payload.time);
    } catch (error) {
      throw new ApiError(400, "Use date format YYYY-MM-DD and time format HH:MM");
    }

    if (startsAt <= nowUtc()) {
      throw new ApiError(400, "Event date and time must be in the future");
    }

    if (payload.capacity !== null && event.registrations.length > payload.capacity) {
      throw new ApiError(400, "Capacity cannot be lower than the number of registered attendees");
    }

    event.title = payload.title;
    event.description = payload.description;
    event.date = payload.date;
    event.time = payload.time;
    event.location = payload.location;
    event.category = payload.category;
    event.capacity = payload.capacity;
    event.startsAt = startsAt;

    await event.save();

    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: true,
      })
    );
  })
);

router.delete(
  "/:eventId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);

    if (!isEventOwner(event, req.currentUser)) {
      throw new ApiError(403, "You can only delete your own events");
    }

    await event.deleteOne();
    res.status(204).send();
  })
);

router.post(
  "/:eventId/register",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    const userId = req.currentUser._id.toString();

    if (event.registrations.some((entry) => entry.userId === userId)) {
      throw new ApiError(400, "You are already registered for this event");
    }

    if (!ensureCapacityAvailable(event)) {
      throw new ApiError(400, "This event is already full");
    }

    event.registrations.push(buildUserEntry(req.currentUser));
    await event.save();

    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

router.delete(
  "/:eventId/register",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    const userId = req.currentUser._id.toString();
    const registrationIndex = event.registrations.findIndex((entry) => entry.userId === userId);

    if (registrationIndex < 0) {
      throw new ApiError(400, "You are not registered for this event");
    }

    event.registrations.splice(registrationIndex, 1);
    await event.save();

    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

router.post(
  "/:eventId/bookmark",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    const userId = req.currentUser._id.toString();

    if (event.bookmarkedBy.some((entry) => entry.id === userId)) {
      throw new ApiError(400, "This event is already in your saved list");
    }

    event.bookmarkedBy.push(buildBookmarkEntry(req.currentUser));
    await event.save();

    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

router.delete(
  "/:eventId/bookmark",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    const userId = req.currentUser._id.toString();
    const bookmarkIndex = event.bookmarkedBy.findIndex((entry) => entry.id === userId);

    if (bookmarkIndex < 0) {
      throw new ApiError(400, "This event is not in your saved list");
    }

    event.bookmarkedBy.splice(bookmarkIndex, 1);
    await event.save();

    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

router.post(
  "/:eventId/comments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    const { message } = validateCommentPayload(req.body);

    event.comments.push(buildCommentEntry(message, req.currentUser));
    await event.save();

    res.status(201).json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

router.delete(
  "/:eventId/comments/:commentId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await getEventOr404(req.params.eventId);
    const commentIndex = event.comments.findIndex((comment) => comment.id === req.params.commentId);

    if (commentIndex < 0) {
      throw new ApiError(404, "Comment not found");
    }

    const comment = event.comments[commentIndex];
    const authorId = comment.author?.id;

    if (authorId !== req.currentUser._id.toString() && !isEventOwner(event, req.currentUser)) {
      throw new ApiError(403, "You cannot delete this comment");
    }

    event.comments.splice(commentIndex, 1);
    await event.save();

    res.json(
      serializeEvent(event, req.currentUser, {
        includePrivate: includePrivateLists(event, req.currentUser),
        includeComments: true,
      })
    );
  })
);

module.exports = router;
