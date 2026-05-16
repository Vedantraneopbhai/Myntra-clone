const mongoose = require("mongoose");

const NotificationQueueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
    type: {
      type: String,
      enum: ["real-time", "scheduled"],
      default: "real-time",
    },
  },
  { timestamps: true }
);

// Index for efficient queue processing
NotificationQueueSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model("NotificationQueue", NotificationQueueSchema);
