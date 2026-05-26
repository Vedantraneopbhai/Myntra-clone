const mongoose = require("mongoose");

const BagItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    isSavedForLater: { type: Boolean, default: false },
    priceAtAddition: { type: Number, required: true },
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Compound unique index to guarantee no duplicate entries for the same user, product, and size
BagItemSchema.index({ userId: 1, productId: 1, size: 1 }, { unique: true });

module.exports = mongoose.model("Bag", BagItemSchema);
