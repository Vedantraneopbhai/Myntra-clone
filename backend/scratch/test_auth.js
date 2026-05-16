const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

async function testAuth() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "password123";

    // 1. Test Signup
    console.log("\nTesting Signup...");
    const hashedpassword = await bcrypt.hash(testPassword, 10);
    const user = new User({
      fullName: "Test User",
      email: testEmail,
      password: hashedpassword,
    });
    await user.save();
    console.log("✅ Signup successful");
    console.log("User in DB:", user);

    // 2. Test Login
    console.log("\nTesting Login...");
    const foundUser = await User.findOne({ email: testEmail });
    if (!foundUser) {
      console.log("❌ User not found after signup");
      return;
    }

    const isMatch = await bcrypt.compare(testPassword, foundUser.password);
    if (isMatch) {
      console.log("✅ Login successful (Password match)");
    } else {
      console.log("❌ Login failed (Password mismatch)");
    }

    // 3. Test Object conversion (what goes to frontend)
    const { password: _, ...userData } = foundUser.toObject();
    console.log("User data sent to frontend:", userData);
    if (userData._id && userData.fullName && userData.email) {
      console.log("✅ User data format is correct");
    } else {
      console.log("❌ User data format is missing fields");
    }

    // Cleanup
    await User.deleteOne({ _id: foundUser._id });
    console.log("\nCleanup successful");

  } catch (error) {
    console.error("❌ Auth test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

testAuth();
