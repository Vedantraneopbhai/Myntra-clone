const express = require("express");
const Address = require("../models/Address");
const router = express.Router();

// GET all addresses for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

// GET single address
router.get("/detail/:addressId", async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ message: "Failed to fetch address" });
  }
});

// POST create new address
router.post("/", async (req, res) => {
  try {
    const { userId, label, fullName, phoneNumber, address, city, state, zipCode, isDefault } = req.body;

    // Validate required fields
    if (!userId || !label || !fullName || !phoneNumber || !address || !city || !state || !zipCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      label,
      fullName,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      isDefault: isDefault || false,
    });

    await newAddress.save();
    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ message: "Failed to create address" });
  }
});

// PUT update address
router.put("/:addressId", async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, fullName, phoneNumber, address, city, state, zipCode, isDefault } = req.body;

    // Find the address
    let updatedAddress = await Address.findById(addressId);
    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await Address.updateMany({ userId: updatedAddress.userId, _id: { $ne: addressId } }, { isDefault: false });
    }

    // Update fields
    if (label) updatedAddress.label = label;
    if (fullName) updatedAddress.fullName = fullName;
    if (phoneNumber) updatedAddress.phoneNumber = phoneNumber;
    if (address) updatedAddress.address = address;
    if (city) updatedAddress.city = city;
    if (state) updatedAddress.state = state;
    if (zipCode) updatedAddress.zipCode = zipCode;
    if (isDefault !== undefined) updatedAddress.isDefault = isDefault;

    await updatedAddress.save();
    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
});

// DELETE address
router.delete("/:addressId", async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address" });
  }
});

// GET default address for user
router.get("/:userId/default", async (req, res) => {
  try {
    const { userId } = req.params;
    const defaultAddress = await Address.findOne({ userId, isDefault: true });
    if (!defaultAddress) {
      return res.status(404).json({ message: "No default address set" });
    }
    res.status(200).json(defaultAddress);
  } catch (error) {
    console.error("Error fetching default address:", error);
    res.status(500).json({ message: "Failed to fetch default address" });
  }
});

module.exports = router;
