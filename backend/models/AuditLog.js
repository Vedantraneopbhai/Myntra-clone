const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: {
      type: String,
      enum: ["creation", "success", "failure", "refund", "receipt_downloaded", "csv_exported"],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

// Indexes optimized for audit lookups
AuditLogSchema.index({ transactionId: 1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
