const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");
const Product = require("./models/Product");
const categoryData = require("./category.json");
const productData = require("./product.json");

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data");

    // Insert products first
    const insertedProducts = await Product.insertMany(productData);
    console.log(`${insertedProducts.length} products inserted`);

    // Convert category data to proper format
    const processedCategories = categoryData.map((cat) => {
      return {
        ...cat,
        productId: cat.productId && cat.productId.$oid ? 
          new mongoose.Types.ObjectId(cat.productId.$oid) : 
          undefined,
      };
    });

    // Insert categories
    const insertedCategories = await Category.insertMany(processedCategories);
    console.log(`${insertedCategories.length} categories inserted`);

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
