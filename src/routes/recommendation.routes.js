const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  recordUserActivity,
  getUserRecommendations,
} = require("../controllers/recommendation.controller");

const router = express.Router();

router.post("/activity", authenticate, recordUserActivity);
router.get("/", authenticate, getUserRecommendations);

module.exports = router;
