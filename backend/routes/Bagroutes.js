const express = require("express");
const Bag = require("../models/Bag");
const Product = require("../models/Product");
const router = express.Router();

// Helper to save a Bag document with optimistic locking retry logic
async function saveWithRetry(bagItem, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await bagItem.save();
    } catch (error) {
      const isVersionError = error.name === "VersionError";
      const isDupError = error.code === 11000 || error.message.includes("E11000");

      if ((isVersionError || isDupError) && attempt < retries) {
        console.warn(`[Bag Concurrency Retry] Attempt ${attempt} failed: ${error.name || "DuplicateKey"}. Retrying...`);
        
        if (isDupError) {
          // If a duplicate error occurred, another session inserted the item.
          // Fetch the existing item and merge quantities
          const existing = await Bag.findOne({
            userId: bagItem.userId,
            productId: bagItem.productId,
            size: bagItem.size,
          });
          if (existing) {
            existing.quantity += bagItem.quantity;
            existing.isSavedForLater = false;
            existing.priceAtAddition = bagItem.priceAtAddition;
            bagItem = existing;
          }
        } else {
          // If a version mismatch occurred, reload the item from the DB and apply new updates
          const fresh = await Bag.findById(bagItem._id);
          if (fresh) {
            fresh.quantity = bagItem.quantity;
            fresh.isSavedForLater = bagItem.isSavedForLater;
            fresh.priceAtAddition = bagItem.priceAtAddition;
            bagItem = fresh;
          }
        }
        continue;
      }
      throw error;
    }
  }
}

// POST /bag: Add to bag or Move from saved to active bag
router.post("/", async (req, res) => {
  const { userId, productId, size, quantity } = req.body;
  if (!userId || !productId || !size) {
    return res.status(400).json({ message: "userId, productId, and size are required." });
  }

  const reqQty = Number(quantity) || 1;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.isDiscontinued) {
      return res.status(400).json({ message: "This product is discontinued and cannot be added to the bag." });
    }

    // Validate size exists in product
    if (!product.sizes.includes(size)) {
      return res.status(400).json({ message: `Size ${size} is not available for this product.` });
    }

    // Validate stock
    const availableStock = product.stock ? product.stock.get(size) || 0 : 0;
    if (availableStock === 0) {
      return res.status(400).json({ message: "This size is currently out of stock." });
    }

    // Look for existing item
    let bagItem = await Bag.findOne({ userId, productId, size });

    if (bagItem) {
      // If it exists, update quantity and ensure it's active
      const newQuantity = bagItem.isSavedForLater ? reqQty : bagItem.quantity + reqQty;
      
      if (newQuantity > availableStock) {
        return res.status(400).json({
          message: `Cannot add ${reqQty} more. Total in bag (${newQuantity}) exceeds available stock (${availableStock}).`,
        });
      }

      bagItem.quantity = newQuantity;
      bagItem.isSavedForLater = false;
      bagItem.priceAtAddition = product.price; // Update priceAtAddition to current price
    } else {
      // Create new bag item
      if (reqQty > availableStock) {
        return res.status(400).json({
          message: `Requested quantity (${reqQty}) exceeds available stock (${availableStock}).`,
        });
      }

      bagItem = new Bag({
        userId,
        productId,
        size,
        quantity: reqQty,
        isSavedForLater: false,
        priceAtAddition: product.price,
      });
    }

    const saved = await saveWithRetry(bagItem);
    res.status(200).json(saved);
  } catch (error) {
    console.error("Error adding to bag:", error);
    res.status(500).json({ message: "Something went wrong adding item to bag." });
  }
});

// GET /bag/:userid: Fetch user's cart (active and saved items) with validations
router.get("/:userid", async (req, res) => {
  try {
    const rawBag = await Bag.find({ userId: req.params.userid }).populate("productId");

    // Map through bag items and perform real-time price, stock, and discontinued checks
    const checkedBag = rawBag.map((item) => {
      const plainItem = item.toObject();

      if (!plainItem.productId) {
        // Product was deleted from DB
        return {
          ...plainItem,
          isDiscontinued: true,
          outOfStock: true,
          priceChanged: false,
        };
      }

      const product = plainItem.productId;
      const size = plainItem.size;
      const quantity = plainItem.quantity;

      // 1. Discontinued check
      const isDiscontinued = !!product.isDiscontinued;

      // 2. Stock check
      const stockVal = product.stock ? product.stock[size] || 0 : 0;
      const outOfStock = stockVal === 0 || isDiscontinued;
      const lowStock = !outOfStock && stockVal < 3;
      const stockMismatch = !outOfStock && stockVal < quantity;

      // 3. Price change check
      const oldPrice = plainItem.priceAtAddition;
      const newPrice = product.price;
      const priceChanged = oldPrice !== newPrice;

      return {
        ...plainItem,
        isDiscontinued,
        outOfStock,
        lowStock,
        stockMismatch,
        availableStock: stockVal,
        priceChanged,
        oldPrice,
        newPrice,
      };
    });

    res.status(200).json(checkedBag);
  } catch (error) {
    console.error("Error fetching bag:", error);
    res.status(500).json({ message: "Something went wrong fetching bag." });
  }
});

// PUT /bag/:itemid: Update quantity or toggle active/saved status
router.put("/:itemid", async (req, res) => {
  const { quantity, isSavedForLater } = req.body;

  try {
    const bagItem = await Bag.findById(req.params.itemid);
    if (!bagItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    const product = await Product.findById(bagItem.productId);
    if (!product) {
      return res.status(404).json({ message: "Product no longer exists." });
    }

    // If moving from saved to active bag
    if (isSavedForLater === false && bagItem.isSavedForLater === true) {
      if (product.isDiscontinued) {
        return res.status(400).json({ message: "This product has been discontinued and cannot be moved to the bag." });
      }

      const availableStock = product.stock ? product.stock.get(bagItem.size) || 0 : 0;
      if (availableStock === 0) {
        return res.status(400).json({ message: "This item is currently out of stock and cannot be moved to the bag." });
      }

      // Automatically update priceAtAddition to match the fresh price on activation
      bagItem.priceAtAddition = product.price;
      bagItem.isSavedForLater = false;
    }

    // If updating quantity
    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (newQty <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than zero." });
      }

      const availableStock = product.stock ? product.stock.get(bagItem.size) || 0 : 0;
      if (newQty > availableStock && !bagItem.isSavedForLater) {
        return res.status(400).json({
          message: `Cannot update quantity to ${newQty}. Only ${availableStock} items are available in stock.`,
        });
      }

      bagItem.quantity = newQty;
    }

    // Apply isSavedForLater toggle directly if not moving to active (or after its checks)
    if (isSavedForLater !== undefined) {
      bagItem.isSavedForLater = !!isSavedForLater;
    }

    const saved = await saveWithRetry(bagItem);
    res.status(200).json(saved);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Something went wrong updating cart item." });
  }
});

// POST /bag/accept-prices/:userid: Acknowledge price changes and update priceAtAddition
router.post("/accept-prices/:userid", async (req, res) => {
  const userId = req.params.userid;

  try {
    const rawBag = await Bag.find({ userId }).populate("productId");
    let updatedCount = 0;

    for (let item of rawBag) {
      if (item.productId && item.priceAtAddition !== item.productId.price) {
        item.priceAtAddition = item.productId.price;
        await saveWithRetry(item);
        updatedCount++;
      }
    }

    res.status(200).json({ message: `Successfully acknowledged price updates for ${updatedCount} items.` });
  } catch (error) {
    console.error("Error accepting price updates:", error);
    res.status(500).json({ message: "Something went wrong accepting price updates." });
  }
});

// DELETE /bag/:itemid: Remove item from cart
router.delete("/:itemid", async (req, res) => {
  try {
    const deleted = await Bag.findByIdAndDelete(req.params.itemid);
    if (!deleted) {
      return res.status(404).json({ message: "Item not found in bag." });
    }
    res.status(200).json({ message: "Item removed from bag successfully." });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ message: "Error removing item from bag." });
  }
});

module.exports = router;
