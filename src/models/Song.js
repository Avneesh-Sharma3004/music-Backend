const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    youtubeVideoId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    channelName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    artist: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },

    language: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true,
    },

    category: {
      type: String,
      default: "music",
      trim: true,
      lowercase: true,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Song = mongoose.model("Song", songSchema);

module.exports = Song;
