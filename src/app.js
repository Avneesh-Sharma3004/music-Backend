const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const youtubeRoutes = require("./routes/youtube.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.set("trust proxy", 1);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use(errorHandler);

module.exports = app;
