const cron = require("node-cron");
const NotificationQueue = require("../models/NotificationQueue");
const NotificationToken = require("../models/NotificationToken");
const Bag = require("../models/Bag");
const notificationService = require("./notificationService");

/**
 * Process the notification queue
 * Runs every minute to find pending notifications
 */
const processQueue = async () => {
  const pending = await NotificationQueue.find({
    status: "pending",
    scheduledAt: { $lte: new Date() },
    attempts: { $lt: 3 },
  }).limit(50);

  for (let item of pending) {
    try {
      item.attempts += 1;
      const results = await notificationService.sendToUser(
        item.userId,
        item.title,
        item.body,
        item.data
      );

      // If at least one ticket was successful or if no tokens were found (nothing to do)
      item.status = "sent";
      await item.save();
    } catch (error) {
      console.error(`Failed to send notification ${item._id}:`, error);
      item.lastError = error.message;
      if (item.attempts >= 3) {
        item.status = "failed";
      }
      await item.save();
    }
  }
};

/**
 * Check for abandoned carts
 * Runs daily at 10 AM
 */
const checkAbandonedCarts = async () => {
  console.log("Checking for abandoned carts...");
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Find unique userIds who have items in their bag updated > 24h ago
  const abandonedUserIds = await Bag.distinct("userId", {
    updatedAt: { $lte: twentyFourHoursAgo }
  });

  for (let userId of abandonedUserIds) {
    // Check if we already sent a reminder recently (last 3 days)
    const recentNotification = await NotificationQueue.findOne({
      userId: userId,
      title: /Shopping Bag/i,
      createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    });

    if (!recentNotification) {
      await NotificationQueue.create({
        userId: userId,
        title: "🛒 Items waiting in your bag!",
        body: "Your favorite items are waiting. Complete your purchase now before they sell out!",
        type: "scheduled",
        data: { screen: "Bag" }
      });
      console.log(`Queued abandonment reminder for user ${userId}`);
    }
  }
};

const initWorkers = () => {
  // Process queue every minute
  cron.schedule("* * * * *", processQueue);
  
  // Check abandoned carts daily at 10:00
  cron.schedule("0 10 * * *", checkAbandonedCarts);
  
  console.log("Notification workers initialized");
};

module.exports = {
  initWorkers,
  processQueue,
  checkAbandonedCarts,
};
