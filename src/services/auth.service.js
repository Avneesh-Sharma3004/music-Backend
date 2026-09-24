const argon2 = require("argon2");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshTocken");
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generateTokenFamily,
} = require("../utils/token");

const registerUser = async ({
  name,
  username,
  email,
  password,
  ip,
  userAgent,
}) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    const error = new Error("Username is already taken");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await argon2.hash(password);

  const user = await User.create({
    name,
    username,
    email,
    passwordHash,
  });

  const accessToken = generateAccessToken(user._id);

  const refreshToken = generateRefreshToken();

  const refreshTokenHash = hashRefreshToken(refreshToken);
  const tokenFamily = generateTokenFamily();

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash: refreshTokenHash,
    tokenFamily,
    expiresAt,
    createdByIp: ip,
    userAgent,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },

    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async ({ refreshToken, ip, userAgent }) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
  });

  if (!storedToken) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  // Token reuse detection
  if (storedToken.revokedAt) {
    await RefreshToken.updateMany(
      {
        tokenFamily: storedToken.tokenFamily,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    const error = new Error("Refresh token reuse detected. Session revoked.");

    error.statusCode = 401;

    throw error;
  }

  // Expiry check
  if (storedToken.expiresAt <= new Date()) {
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const error = new Error("Refresh token expired");
    error.statusCode = 401;

    throw error;
  }

  // User check
  const user = await User.findById(storedToken.user);

  if (!user || !user.isActive) {
    const error = new Error("User account is inactive");
    error.statusCode = 401;

    throw error;
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user._id);

  const newRefreshToken = generateRefreshToken();

  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const newToken = await RefreshToken.create({
    user: user._id,
    tokenHash: newRefreshTokenHash,
    tokenFamily: storedToken.tokenFamily,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdByIp: ip,
    userAgent,
  });

  // Revoke old token
  storedToken.revokedAt = new Date();
  storedToken.replacedByTokenId = newToken._id;

  await storedToken.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const loginUser = async ({ email, password, ip, userAgent }) => {
  const user = await User.findOne({ email }).select("+passwordHash");

  // Same error for both cases
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate access token
  const accessToken = generateAccessToken(user._id);

  // Generate refresh token
  const refreshToken = generateRefreshToken();

  const refreshTokenHash = hashRefreshToken(refreshToken);

  // New login = new token family
  const tokenFamily = generateTokenFamily();

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash: refreshTokenHash,
    tokenFamily,
    expiresAt,
    createdByIp: ip,
    userAgent,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    },

    accessToken,
    refreshToken,
  };
};

module.exports = {
  registerUser,
  refreshAccessToken,
  loginUser,
};
