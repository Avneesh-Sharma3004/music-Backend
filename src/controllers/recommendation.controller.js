const { recordActivity } = require("../services/activity.service");
const { getRecommendations } = require("../services/recommendation.service");

const recordUserActivity = async (req, res, next) => {
  try {
    const { youtubeVideoId, action, durationPlayed, source } = req.body;

    if (!youtubeVideoId) {
      return res.status(400).json({
        success: false,
        message: "youtubeVideoId is required",
      });
    }

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "action is required",
      });
    }

    const activity = await recordActivity({
      userId: req.user.id,
      youtubeVideoId,
      action,
      durationPlayed,
      source,
    });

    return res.status(201).json({
      success: true,
      message: "Activity recorded successfully",
      data: {
        id: activity._id,
        action: activity.action,
        createdAt: activity.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserRecommendations = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Recommendations fetched successfully",
      data: {
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordUserActivity,
  getUserRecommendations,
};
