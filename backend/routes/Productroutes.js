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
