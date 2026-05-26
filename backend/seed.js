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

    // Enrich productData with stock and isDiscontinued before inserting
    const enrichedProductData = productData.map((p, index) => {
      const stockMap = {};
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach((size) => {
          // Assign a random stock between 5 and 15
          stockMap[size] = Math.floor(Math.random() * 11) + 5;
        });
      }
      
      // Mark Wrangler Slim Fit Jeans (index 5) as discontinued for testing discontinued handling
      const isDiscontinued = index === 5; 
      
      return {
        ...p,
        stock: stockMap,
        isDiscontinued: isDiscontinued,
      };
    });

    // Insert products first
    const insertedProducts = await Product.insertMany(enrichedProductData);
    console.log(`${insertedProducts.length} products inserted`);

    // Build category-to-products mapping so each category can show multiple products
    const processedCategories = categoryData.map((cat) => {
      const matchedProducts = insertedProducts
        .filter((product) => product.category === cat.name)
        .map((product) => product._id);

      return {
        name: cat.name,
        subcategory: cat.subcategory,
        image: cat.image,
        productId: matchedProducts,
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
