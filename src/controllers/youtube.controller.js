const {
  searchYouTube,
  getHomeData,
  getCategorySongs,
} = require("../services/youtube.service");

const home = async (req, res, next) => {
  try {
    const { pageToken } = req.query;

    const data = await getHomeData({
      pageToken,
    });

    return res.status(200).json({
      success: true,
      message: "Home data fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { q, pageToken } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const data = await searchYouTube({
      query: q.trim(),
      pageToken,
    });

    return res.status(200).json({
      success: true,
      message: "YouTube search successful",
      data: {
        items: data.items || [],
        nextPageToken: data.nextPageToken || null,
        prevPageToken: data.prevPageToken || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const category = async (req, res, next) => {
  try {
    const categoryName = req.params.category?.trim().toLowerCase();

    const { pageToken } = req.query;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const data = await getCategorySongs({
      category: categoryName,
      pageToken,
    });

    return res.status(200).json({
      success: true,
      message: "Category songs fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  home,
  search,
  category,
};
