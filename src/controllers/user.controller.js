const RefreshToken = require("../models/RefreshTocken");

const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all refresh sessions
    await RefreshToken.deleteMany({
      user: userId,
    });

    // Permanently delete user
    await req.user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  deleteAccount,
};
