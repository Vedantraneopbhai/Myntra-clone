const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
const { getRecommendations } = require('../services/recommendationService');

router.get("/", async (req, res) => {
  try {
    const categories = await Product.find();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Search products by keyword
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

    // Search in name, brand, description, category
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ]
    }).limit(20);

    res.status(200).json(products);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Search failed" });
  }
});

// Get products by category
router.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { minPrice, maxPrice, brand, sortBy } = req.query;

    let query = { category: { $regex: categoryName, $options: "i" } };

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    let products = await Product.find(query);

    // Sorting
    if (sortBy === "price_low") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Category filter error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  const productid = req.params.id;
  try {
    const product = await Product.findById(productid);
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get('/recommendations/:productId/:userId', async (req, res) => {
    try {
        const recommendations = await getRecommendations(req.params.userId, req.params.productId);
        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
