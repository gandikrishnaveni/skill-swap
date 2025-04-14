const express = require("express");
const router = express.Router();

// Dummy example, replace with actual connected user logic
const User = require("../models/User"); // if you have a User model
const authenticate = require("../middleware/authenticate");

router.get("/", authenticate, async (req, res) => {
  try {
    // You can fetch user's connections from your DB
    const connectedUsers = await User.find({ _id: { $ne: req.user.id } }).select("name _id");
    res.json({ users: connectedUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to load users" });
  }
});

module.exports = router;
