const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      sub: userId.toString(),
      type: "access",
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateTokenFamily = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generateTokenFamily,
};
