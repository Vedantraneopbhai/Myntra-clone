const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(`Signup attempt: ${email}`);
  try {
    if (!fullName || !email || !password) {
      console.log(`Signup failed: Missing fields - fullName: ${fullName}, email: ${email}, password: ${password ? 'provided' : 'missing'}`);
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    const existinguser = await User.findOne({ email: email.toLowerCase() });
    if (existinguser) {
      console.log(`Signup failed: User ${email} already exists`);
      return res.status(409).json({ 
        success: false,
        message: "User already exists" 
      });
    }
    
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedpassword,
    });
    
    await user.save();
    console.log(`Signup successful: ${email}`);
    
    const userData = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email
    };
    
    res.status(201).json({ 
      success: true,
      user: userData 
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Something went wrong during signup",
      error: error.message 
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt: ${email}`);
  try {
    if (!email || !password) {
      console.log(`Login failed: Missing credentials`);
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }
    
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log(`Login successful: ${email}`);
    const userData = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email
    };
    
    res.status(200).json({ 
      success: true,
      user: userData 
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Something went wrong during login",
      error: error.message 
    });
  }
});

module.exports = router;