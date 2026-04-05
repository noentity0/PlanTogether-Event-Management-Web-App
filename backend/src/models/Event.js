const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      alias: "userId",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    joined_at: {
      type: Date,
      required: true,
      default: Date.now,
      alias: "joinedAt",
    },
  },
  { _id: false }
);

const bookmarkedBySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

const commentAuthorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    author: {
      type: commentAuthorSchema,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 600,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
      alias: "createdAt",
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1500,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: ["Music", "Tech", "Sports", "Art", "Food", "Business"],
    },
    capacity: {
      type: Number,
      default: null,
      min: 1,
      max: 10000,
    },
    starts_at: {
      type: Date,
      required: true,
      index: true,
      alias: "startsAt",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      alias: "createdBy",
    },
    created_by_name: {
      type: String,
      required: true,
      trim: true,
      alias: "createdByName",
    },
    created_by_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      alias: "createdByEmail",
    },
    registrations: {
      type: [registrationSchema],
      default: [],
    },
    bookmarked_by: {
      type: [bookmarkedBySchema],
      default: [],
      alias: "bookmarkedBy",
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Event", eventSchema);
