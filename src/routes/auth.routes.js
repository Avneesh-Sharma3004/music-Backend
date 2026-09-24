const express = require("express");

const { register, refresh, login } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

module.exports = router;
