const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const router = express.Router();
const mongoose = require("mongoose");
const NotificationQueue = require("../models/NotificationQueue");

function genrateRandomTracking() {
  const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
  const statusOptions = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "In Transit",
  ];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
  const randomcarrier = carriers[Math.floor(Math.random() * carriers.length)];
  const randomstatusOptions =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const randomlocations =
    locations[Math.floor(Math.random() * locations.length)];

  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier: randomcarrier,
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentLocation: randomlocations,
    status: randomstatusOptions,
    timeline: [
      {
        status: "Order placed",
        location: "Warehouse",
        timestamp: new Date().toISOString(),
      },
      {
        status: randomstatusOptions,
        location: randomlocations,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
router.post("/create/:userId", async (req, res) => {
  const Product = require("../models/Product");
  try {
    const userid = req.params.userId;
    
    // 1. Fetch only active bag items
    const bag = await Bag.find({ userId: userid, isSavedForLater: false }).populate("productId");
    if (bag.length === 0) {
      return res.status(400).json({ message: "No active items in the bag to checkout." });
    }

    // 2. Perform validations: stock, price changes, discontinued
    for (let item of bag) {
      if (!item.productId) {
        return res.status(400).json({ message: "One of the products in your cart no longer exists." });
      }

      if (item.productId.isDiscontinued) {
        return res.status(400).json({
          message: `Product "${item.productId.name}" has been discontinued and cannot be purchased. Please remove it from your bag.`
        });
      }

      // Validate size stock
      const stockMap = item.productId.stock;
      const availableStock = stockMap ? stockMap.get(item.size) || 0 : 0;
      if (availableStock === 0) {
        return res.status(400).json({
          message: `Product "${item.productId.name}" (size ${item.size}) is out of stock. Please remove or adjust it.`
        });
      }

      if (item.quantity > availableStock) {
        return res.status(400).json({
          message: `Product "${item.productId.name}" (size ${item.size}) has insufficient stock. Available: ${availableStock}, Requested: ${item.quantity}.`
        });
      }

      // Detect price changes before checkout
      if (item.priceAtAddition !== item.productId.price) {
        return res.status(400).json({
          message: `Price change detected for "${item.productId.name}". Price changed from ₹${item.priceAtAddition} to ₹${item.productId.price}. Please review and accept the update in your bag.`
        });
      }
    }

    // 3. Concurrency-Safe Stock Reservation with Rollback on conflict/depletion
    const successfullyDeducted = [];
    try {
      for (let item of bag) {
        const decrementField = `stock.${item.size}`;
        // Atomic transaction replacement: update stock ONLY IF stock >= quantity
        const result = await Product.findOneAndUpdate(
          {
            _id: item.productId._id,
            [decrementField]: { $gte: item.quantity }
          },
          {
            $inc: { [decrementField]: -item.quantity }
          },
          { new: true }
        );

        if (!result) {
          // Depletion or race condition conflict! Rollback already deducted items
          throw new Error(`Insufficient stock for "${item.productId.name}" during final reservation.`);
        }

        successfullyDeducted.push({
          productId: item.productId._id,
          size: item.size,
          quantity: item.quantity
        });
      }
    } catch (reserveError) {
      console.warn("[Stock Reservation Failure] Rollback initiated:", reserveError.message);
      // Rollback logic
      for (let rollbackItem of successfullyDeducted) {
        const incrementField = `stock.${rollbackItem.size}`;
        await Product.updateOne(
          { _id: rollbackItem.productId },
          { $inc: { [incrementField]: rollbackItem.quantity } }
        );
      }
      return res.status(400).json({ message: reserveError.message || "Stock reservation failed during concurrent checkout. Please try again." });
    }

    const orderitem = bag.map((item) => ({
      productId: item.productId._id,
      size: item.size,
      price: item.productId.price,
      quantity: item.quantity,
    }));

    // Fix bug: sum + item.price * item.quantity instead of sum + item.price + item.quantity
    const total = orderitem.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Fix bug: items: orderitem (Schema expects items, not item)
    const newOrder = new Order({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: orderitem,
      total: total,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      tracking: genrateRandomTracking(),
    });
    await newOrder.save();
    
    // Queue a real-time notification
    await NotificationQueue.create({
      userId: userid,
      title: "🎉 Order Placed!",
      body: `Your order for ₹${total} has been successfully placed and is being processed.`,
      type: "real-time",
      data: { orderId: newOrder._id, screen: "Orders" }
    });

    // Delete ONLY active items from bag (Preserve "Save for Later" items!)
    await Bag.deleteMany({ userId: userid, isSavedForLater: false });
    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
router.get("/user/:userid", async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.userid }).populate(
      "items.productId"
    );
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;