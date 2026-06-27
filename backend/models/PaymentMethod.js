const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "upi", "netbanking", "wallet"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // For card payments
    cardNumber: {
      type: String, // Store encrypted/last 4 digits only
    },
    cardHolderName: {
      type: String,
    },
    expiryMonth: {
      type: String,
    },
    expiryYear: {
      type: String,
    },
    cvv: {
      type: String, // Never store in production - only for demo
    },
    
    // For UPI
    upiId: {
      type: String,
    },
    
    // For Wallet/Others
    balance: {
      type: Number,
      default: 0,
    },
    
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Don't expose sensitive data
paymentMethodSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.cardNumber) {
    obj.cardNumber = `****${obj.cardNumber.slice(-4)}`;
  }
  delete obj.cvv;
  return obj;
};

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
