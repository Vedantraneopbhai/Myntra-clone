const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    invoiceId: { type: String, unique: true, required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["Card", "UPI", "Netbanking", "Wallet"], required: true },
    status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending" },
    paymentGatewayTransactionId: { type: String },
  },
  { timestamps: true }
);

// Indexes optimized for server-side sorting, pagination, and filtering
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ paymentMode: 1 });
TransactionSchema.index({ invoiceId: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
