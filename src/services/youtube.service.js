const Song = require("../models/Song");

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

const YOUTUBE_REGION = "IN";
const MUSIC_CATEGORY_ID = "10";
const MAX_RESULTS = 20;

/**
 * Generic YouTube API request
 */
const youtubeRequest = async (endpoint, params) => {
  const searchParams = new URLSearchParams({
    ...params,
    key: process.env.YOUTUBE_API_KEY,
  });

  const response = await fetch(
    `${YOUTUBE_BASE_URL}/${endpoint}?${searchParams.toString()}`,
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "YouTube API request failed",
    );

    error.statusCode = response.status;

    throw error;
  }

  return data;
};

/**
 * Convert YouTube video response
 * into our Song format
 */
const normalizeYouTubeVideo = (item) => {
  const snippet = item?.snippet;

  if (!item?.id || !snippet) {
    return null;
  }

  return {
    youtubeVideoId: item.id,
    title: snippet.title,
    channelName: snippet.channelTitle,
    thumbnail:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      null,
    category: "music",
    isActive: true,
  };
};

/**
 * Save / update songs in MongoDB
 */
const saveSongsToDatabase = async (items) => {
  const operations = [];

  for (const item of items) {
    const song = item?.id?.videoId
      ? normalizeYouTubeSearchResult(item)
      : normalizeYouTubeVideo(item);

    if (!song) {
      continue;
    }

    operations.push({
      updateOne: {
        filter: {
          youtubeVideoId: song.youtubeVideoId,
        },

        update: {
          $set: {
            title: song.title,
            channelName: song.channelName,
            thumbnail: song.thumbnail,
            isActive: true,
          },

          $setOnInsert: {
            youtubeVideoId: song.youtubeVideoId,
            category: song.category,
          },
        },

        upsert: true,
      },
    });
  }

  if (operations.length === 0) {
    return;
  }

  await Song.bulkWrite(operations, {
    ordered: false,
  });
};
/**
 * Get popular music videos for India
 */
const getPopularMusic = async ({ pageToken } = {}) => {
  const params = {
    part: "snippet",
    chart: "mostPopular",
    regionCode: YOUTUBE_REGION,
    videoCategoryId: MUSIC_CATEGORY_ID,
    maxResults: String(MAX_RESULTS),
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const data = await youtubeRequest("videos", params);

  await saveSongsToDatabase(data.items || []);

  const songs = (data.items || []).map(normalizeYouTubeVideo).filter(Boolean);

  return {
    songs,
    nextPageToken: data.nextPageToken || null,
    prevPageToken: data.prevPageToken || null,
  };
};

/**
 * Get complete Home data
 */
const getHomeData = async ({ pageToken } = {}) => {
  const popularMusic = await getPopularMusic({
    pageToken,
  });

  return {
    trending: popularMusic.songs,
    nextPageToken: popularMusic.nextPageToken,
    prevPageToken: popularMusic.prevPageToken,
  };
};

/**
 * Existing Search API
 */
const searchYouTube = async ({ query, pageToken }) => {
  const params = {
    part: "snippet",
    q: `${query} song`,
    type: "video",
    videoCategoryId: MUSIC_CATEGORY_ID,
    regionCode: YOUTUBE_REGION,
    maxResults: String(MAX_RESULTS),
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const data = await youtubeRequest("search", params);

  await saveSongsToDatabase(data.items || []);

  const songs = (data.items || [])
    .map(normalizeYouTubeSearchResult)
    .filter(Boolean);

  return {
    songs,
    nextPageToken: data.nextPageToken || null,
    prevPageToken: data.prevPageToken || null,
  };
};

const getCategorySongs = async ({ category, pageToken }) => {
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    const error = new Error("Unsupported music category");

    error.statusCode = 400;

    throw error;
  }

  const params = {
    part: "snippet",
    q: config.query,
    type: "video",
    videoCategoryId: "10",
    maxResults: String(MAX_RESULTS),
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  const data = await youtubeRequest("search", params);

  await saveSongsToDatabase(data.items || []);

  const songs = (data.items || [])
    .map(normalizeYouTubeSearchResult)
    .filter(Boolean);

  return {
    category,
    songs,
    nextPageToken: data.nextPageToken || null,
    prevPageToken: data.prevPageToken || null,
  };
};

const normalizeYouTubeSearchResult = (item) => {
  const videoId = item?.id?.videoId;
  const snippet = item?.snippet;

  if (!videoId || !snippet) {
    return null;
  }

  return {
    youtubeVideoId: videoId,
    title: snippet.title,
    channelName: snippet.channelTitle,
    thumbnail:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      null,
    category: "music",
    isActive: true,
  };
};
const CATEGORY_CONFIG = {
  hindi: {
    query: "Hindi songs",
  },

  english: {
    query: "English songs",
  },

  bollywood: {
    query: "Bollywood songs",
  },

  punjabi: {
    query: "Punjabi songs",
  },

  devotional: {
    query: "Hindi devotional songs",
  },
  bhojpuri: {
    query: "Bhojpuri songs",
  },
};

module.exports = {
  searchYouTube,
  getPopularMusic,
  getHomeData,
  getCategorySongs,
};
