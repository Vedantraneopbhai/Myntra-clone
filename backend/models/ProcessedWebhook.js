const mongoose = require("mongoose");

const ProcessedWebhookSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true, required: true },
    status: { type: String, enum: ["processing", "completed", "failed"], default: "processing" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProcessedWebhook", ProcessedWebhookSchema);
