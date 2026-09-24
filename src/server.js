// const express = require("express");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const cors = require("cors");

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// const PORT = 5000;

// app.get("/api/youtube/search", async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     const response = await axios.get(
//       "https://www.googleapis.com/youtube/v3/search",
//       {
//         params: {
//           part: "snippet",
//           q: q,
//           type: "video",
//           maxResults: 20,
//           key: process.env.YOUTUBE_API_KEY,
//         },
//       },
//     );

//     const videos = response.data.items.map((item) => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       thumbnail: item.snippet.thumbnails.high.url,
//       channelTitle: item.snippet.channelTitle,
//       publishedAt: item.snippet.publishedAt,
//     }));

//     res.json({
//       success: true,
//       count: videos.length,
//       videos,
//     });
//   } catch (error) {
//     console.log(error.response?.data || error.message);

//     res.status(500).json({
//       success: false,
//       message: "YouTube search failed",
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
