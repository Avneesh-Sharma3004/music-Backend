const UserActivity = require("../models/UserActivity");
const Song = require("../models/Song");

const ALLOWED_ACTIONS = ["play", "complete", "skip", "like", "unlike"];

const ALLOWED_SOURCES = [
  "home",
  "search",
  "category",
  "recommendation",
  "playlist",
];

const recordActivity = async ({
  userId,
  youtubeVideoId,
  action,
  durationPlayed = 0,
  source = "home",
}) => {
  if (!ALLOWED_ACTIONS.includes(action)) {
    const error = new Error("Invalid activity action");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_SOURCES.includes(source)) {
    const error = new Error("Invalid activity source");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(durationPlayed) || durationPlayed < 0) {
    const error = new Error("durationPlayed must be a valid positive number");

    error.statusCode = 400;
    throw error;
  }

  const song = await Song.findOne({
    youtubeVideoId,
    isActive: true,
  }).select("_id");

  if (!song) {
    const error = new Error("Song not found");
    error.statusCode = 404;
    throw error;
  }

  const activity = await UserActivity.create({
    user: userId,
    song: song._id,
    action,
    durationPlayed,
    source,
  });

  return activity;
};

module.exports = {
  recordActivity,
};
