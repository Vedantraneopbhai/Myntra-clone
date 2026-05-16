const express = require("express");
const router = express.Router();
const NotificationToken = require("../models/NotificationToken");
const NotificationQueue = require("../models/NotificationQueue");
const notificationService = require("../services/notificationService");

// Register or update a push token
router.post("/register-token", async (req, res) => {
  const { userId, token, platform } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "userId and token are required" });
  }

  try {
    // Update existing token if it exists for this user, or create new
    // Also ensures a token isn't shared across users (though unlikely)
    await NotificationToken.findOneAndUpdate(
      { token },
      { userId, platform, lastUsed: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Token registered successfully" });
  } catch (error) {
    console.error("Error registering token:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove a token (e.g. on logout)
router.post("/unregister-token", async (req, res) => {
  const { token } = req.body;

  try {
    await NotificationToken.deleteOne({ token });
    res.status(200).json({ message: "Token removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Send a test notification immediately (Debug only)
router.post("/test-notification", async (req, res) => {
  const { userId, title, body, data } = req.body;

  try {
    const results = await notificationService.sendToUser(
      userId,
      title || "Test Notification",
      body || "This is a test notification from Myntra Clone",
      data || { test: true }
    );
    res.status(200).json({ message: "Test notification sent", results });
  } catch (error) {
    res.status(500).json({ message: "Error sending notification", error: error.message });
  }
});

module.exports = router;
