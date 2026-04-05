function stringifyId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value.toString === "function") {
    return value.toString();
  }

  return String(value);
}

function deriveDisplayName(email) {
  if (!email) {
    return "Guest User";
  }

  const localPart = email.split("@", 1)[0];
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  return normalized ? normalized.replace(/\b\w/g, (character) => character.toUpperCase()) : email;
}

function serializeUser(user) {
  return {
    id: stringifyId(user._id),
    name: user.name || deriveDisplayName(user.email),
    email: user.email,
    created_at: user.createdAt || user.created_at,
  };
}

function serializeUserSummary(user) {
  return {
    id: stringifyId(user._id || user.id),
    name: user.name || deriveDisplayName(user.email),
    email: user.email || "",
  };
}

function serializeParticipant(participant) {
  return {
    user_id: stringifyId(participant.userId || participant.user_id),
    name: participant.name || deriveDisplayName(participant.email),
    email: participant.email || "",
    joined_at: participant.joinedAt || participant.joined_at || new Date(),
  };
}

function serializeComment(comment) {
  const author = comment.author || {};

  return {
    id: stringifyId(comment.id),
    author: {
      id: stringifyId(author.id || author._id || author.userId),
      name: author.name || deriveDisplayName(author.email),
      email: author.email || "",
    },
    message: comment.message || "",
    created_at: comment.createdAt || comment.created_at || new Date(),
  };
}

function serializeEvent(event, currentUser = null, options = {}) {
  const includePrivate = Boolean(options.includePrivate);
  const includeComments = Boolean(options.includeComments);
  const registrations = (event.registrations || []).map(serializeParticipant);
  const bookmarkedBy = (event.bookmarkedBy || event.bookmarked_by || []).map(serializeUserSummary);
  const comments = (event.comments || []).map(serializeComment);
  const currentUserId = currentUser ? stringifyId(currentUser._id) : null;
  const createdBy = stringifyId(event.createdBy || event.created_by);
  const capacity = event.capacity ?? null;
  const attendeeCount = registrations.length;

  const payload = {
    id: stringifyId(event._id),
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    capacity,
    starts_at: event.startsAt || event.starts_at,
    created_by: createdBy,
    created_by_name: event.createdByName || event.created_by_name || deriveDisplayName(event.createdByEmail || event.created_by_email),
    created_by_email: event.createdByEmail || event.created_by_email || "",
    attendee_count: attendeeCount,
    saved_count: bookmarkedBy.length,
    available_spots: capacity === null ? null : Math.max(capacity - attendeeCount, 0),
    is_owner: currentUserId === createdBy,
    is_registered: registrations.some((entry) => entry.user_id === currentUserId),
    is_bookmarked: bookmarkedBy.some((entry) => entry.id === currentUserId),
    created_at: event.createdAt || event.created_at,
    updated_at: event.updatedAt || event.updated_at,
  };

  if (includePrivate) {
    payload.registrations = registrations;
    payload.bookmarked_by = bookmarkedBy;
  }

  if (includeComments || includePrivate) {
    payload.comments = comments;
  }

  return payload;
}

module.exports = {
  deriveDisplayName,
  serializeEvent,
  serializeUser,
  stringifyId,
};
