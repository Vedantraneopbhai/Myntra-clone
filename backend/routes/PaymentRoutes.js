const express = require("express");
const PaymentMethod = require("../models/PaymentMethod");
const router = express.Router();

// GET all payment methods for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const paymentMethods = await PaymentMethod.find({ userId, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ message: "Failed to fetch payment methods" });
  }
});

// POST create new payment method
router.post("/", async (req, res) => {
  try {
    const { userId, type, name, cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, upiId, isDefault } = req.body;

    // Validate required fields
    if (!userId || !type || !name) {
      return res.status(400).json({ message: "UserId, type, and name are required" });
    }

    // Validate type-specific fields
    if (type === "credit" || type === "debit") {
      if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear) {
        return res.status(400).json({ message: "Card details are required" });
      }
    }

    if (type === "upi") {
      if (!upiId) {
        return res.status(400).json({ message: "UPI ID is required" });
      }
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany({ userId }, { isDefault: false });
    }

    const newPaymentMethod = new PaymentMethod({
      userId,
      type,
      name,
      cardNumber: cardNumber || null,
      cardHolderName: cardHolderName || null,
      expiryMonth: expiryMonth || null,
      expiryYear: expiryYear || null,
      cvv: cvv || null,
      upiId: upiId || null,
      isDefault: isDefault || false,
    });

    await newPaymentMethod.save();
    res.status(201).json({
      success: true,
      message: "Payment method added successfully",
      paymentMethod: newPaymentMethod,
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    res.status(500).json({ message: "Failed to create payment method" });
  }
});

// PUT update payment method
router.put("/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { name, isDefault } = req.body;

    // Find the payment method
    let paymentMethod = await PaymentMethod.findById(paymentId);
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await PaymentMethod.updateMany({ userId: paymentMethod.userId, _id: { $ne: paymentId } }, { isDefault: false });
    }

    // Update fields (limited to avoid changing card details)
    if (name) paymentMethod.name = name;
    if (isDefault !== undefined) paymentMethod.isDefault = isDefault;

    await paymentMethod.save();
    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      paymentMethod,
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ message: "Failed to update payment method" });
  }
});

// DELETE payment method (soft delete)
router.delete("/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      paymentId,
      { isActive: false },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ message: "Failed to delete payment method" });
  }
});

// GET default payment method for user
router.get("/:userId/default", async (req, res) => {
  try {
    const { userId } = req.params;
    const defaultPayment = await PaymentMethod.findOne({ userId, isDefault: true, isActive: true });
    if (!defaultPayment) {
      return res.status(404).json({ message: "No default payment method set" });
    }
    res.status(200).json(defaultPayment);
  } catch (error) {
    console.error("Error fetching default payment method:", error);
    res.status(500).json({ message: "Failed to fetch default payment method" });
  }
});

module.exports = router;
