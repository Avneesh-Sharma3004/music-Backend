const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["play", "complete", "skip", "like", "unlike"],
      required: true,
      index: true,
    },

    durationPlayed: {
      type: Number,
      min: 0,
      default: 0,
    },

    source: {
      type: String,
      enum: ["home", "search", "category", "recommendation", "playlist"],
      default: "home",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * User's latest activities
 */
userActivitySchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * User + song activity lookup
 */
userActivitySchema.index({
  user: 1,
  song: 1,
  action: 1,
});

/**
 * Recommendation queries
 */
userActivitySchema.index({
  user: 1,
  action: 1,
  createdAt: -1,
});

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

module.exports = UserActivity;
