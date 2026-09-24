const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const { home, search, category } = require("../controllers/youtube.controller");

const router = express.Router();

/**
 * Protected Home API
 */
router.get("/home", authenticate, home);

/**
 * Protected Search API
 */
router.get("/search", authenticate, search);
router.get("/category/:category", authenticate, category);

module.exports = router;
