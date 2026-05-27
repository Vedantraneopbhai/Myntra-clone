const mongoose = require("mongoose");

const RecentlyViewedSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      index: true
    },
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product",
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index for deduplication: only one entry per user+product combination
RecentlyViewedSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for fast retrieval of user's recently viewed items sorted by viewedAt
RecentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

// Index for fast retrieval of user's browsing history
RecentlyViewedSchema.index({ user: 1 });

module.exports = mongoose.model("RecentlyViewed", RecentlyViewedSchema);
