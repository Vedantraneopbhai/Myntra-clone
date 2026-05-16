const { Expo } = require("expo-server-sdk");
const NotificationToken = require("../models/NotificationToken");

const expo = new Expo();

/**
 * Send notifications to a specific user
 */
const sendToUser = async (userId, title, body, data = {}) => {
  const tokens = await NotificationToken.find({ userId });
  
  if (tokens.length === 0) {
    console.log(`No tokens found for user ${userId}`);
    return [];
  }

  const messages = [];
  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) {
      console.error(`Push token ${pushToken.token} is not a valid Expo push token`);
      // Optionally remove invalid token
      await NotificationToken.deleteOne({ _id: pushToken._id });
      continue;
    }

    messages.push({
      to: pushToken.token,
      sound: "default",
      title,
      body,
      data,
    });
  }

  return await sendMessages(messages);
};

/**
 * Core function to send messages in chunks and handle ticket responses
 */
const sendMessages = async (messages) => {
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  let errors = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending chunk:", error);
      errors.push(error);
    }
  }

  // Handle receipts later if needed, but for now we check for immediate errors
  for (let ticket of tickets) {
    if (ticket.status === "error") {
      if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
        // Token is no longer valid, we should remove it
        // We'd need to map the ticket back to the token, which requires more logic
        // For simplicity in this version, we handle it during sending or via periodic cleanup
      }
    }
  }

  return tickets;
};

module.exports = {
  sendToUser,
  sendMessages,
};
