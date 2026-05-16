const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(`Signup attempt: ${email}`);
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existinguser = await User.findOne({ email: email.toLowerCase() });
    if (existinguser) {
      console.log(`Signup failed: User ${email} already exists`);
      return res.status(409).json({ message: "User already exists" });
    }
    
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedpassword,
    });
    
    await user.save();
    console.log(`Signup successful: ${email}`);
    
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt: ${email}`);
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`Login successful: ${email}`);
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;