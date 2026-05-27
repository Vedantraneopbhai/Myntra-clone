const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ "products.product": 1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
