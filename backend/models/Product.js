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

module.exports = mongoose.model("Product", ProductSchema);
