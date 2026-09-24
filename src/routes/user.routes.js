const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const { getProfile, deleteAccount } = require("../controllers/user.controller");

const router = express.Router();

// Protected routes
router.get("/profile", authenticate, getProfile);

router.delete("/account", authenticate, deleteAccount);

module.exports = router;
