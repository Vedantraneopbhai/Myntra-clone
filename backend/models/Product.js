const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    price: Number,
    discount: String,
    description: String,
    sizes: [String],
    category: String,
    images: [String],
    stock: {
      type: Map,
      of: Number,
      default: {},
    },
    isDiscontinued: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ProductSchema.index({ 'category.level1': 1, 'category.level2': 1 });
ProductSchema.index({ 'ratings.count': -1, 'ratings.average': -1 });

module.exports = mongoose.model("Product", ProductSchema);
