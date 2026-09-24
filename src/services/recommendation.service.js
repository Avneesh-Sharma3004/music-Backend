const UserActivity = require("../models/UserActivity");
const Song = require("../models/Song");

const SCORE = {
  play: 3,
  complete: 5,
  like: 10,
  skip: -5,
  unlike: -10,
};

const getRecommendations = async (userId) => {
  // 1. User ki recent activities
  const activities = await UserActivity.find({
    user: userId,
  })
    .populate({
      path: "song",
      select:
        "youtubeVideoId title channelName thumbnail artist language category tags",
    })
    .sort({
      createdAt: -1,
    })
    .limit(200)
    .lean();

  // New user ke liye
  if (!activities.length) {
    return await getColdStartRecommendations();
  }

  // 2. User preferences calculate karenge
  const artistScores = new Map();
  const categoryScores = new Map();
  const languageScores = new Map();

  const playedSongIds = new Set();

  for (const activity of activities) {
    const song = activity.song;

    if (!song) continue;

    const score = SCORE[activity.action] || 0;

    playedSongIds.add(song._id.toString());

    // Artist preference
    if (song.artist) {
      const current = artistScores.get(song.artist) || 0;

      artistScores.set(song.artist, current + score);
    }

    // Channel preference
    if (song.channelName) {
      const current = artistScores.get(song.channelName) || 0;

      artistScores.set(song.channelName, current + score);
    }

    // Category preference
    if (song.category) {
      const current = categoryScores.get(song.category) || 0;

      categoryScores.set(song.category, current + score);
    }

    // Language preference
    if (song.language) {
      const current = languageScores.get(song.language) || 0;

      languageScores.set(song.language, current + score);
    }
  }

  // 3. Candidate songs MongoDB se lenge
  const candidates = await Song.find({
    isActive: true,
  })
    .limit(500)
    .lean();

  // 4. Har candidate ka recommendation score
  const recommendations = candidates
    .map((song) => {
      let score = 0;

      if (song.artist) {
        score += (artistScores.get(song.artist) || 0) * 2;
      }

      if (song.channelName) {
        score += (artistScores.get(song.channelName) || 0) * 2;
      }

      if (song.category) {
        score += categoryScores.get(song.category) || 0;
      }

      if (song.language) {
        score += languageScores.get(song.language) || 0;
      }

      // Already consumed songs ko thoda lower priority
      if (playedSongIds.has(song._id.toString())) {
        score -= 2;
      }

      return {
        song,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // 5. Agar personalized candidates nahi mile
  if (!recommendations.length) {
    return await getColdStartRecommendations();
  }

  return recommendations.map((item) => ({
    ...item.song,
    recommendationScore: item.score,
  }));
};

// New user recommendation
const getColdStartRecommendations = async () => {
  const songs = await Song.find({
    isActive: true,
  })
    .sort({
      createdAt: -1,
    })
    .limit(20)
    .lean();

  return songs.map((song) => ({
    ...song,
    recommendationScore: 0,
  }));
};

module.exports = {
  getRecommendations,
};
