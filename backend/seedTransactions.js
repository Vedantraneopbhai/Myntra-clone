const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const AuditLog = require("./models/AuditLog");

dotenv.config();

async function seedTransactions() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in environment");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    // 1. Fetch or create a test user
    let user = await User.findOne({});
    if (!user) {
      console.log("No existing user found. Creating a test user...");
      user = new User({
        fullName: "Vedant Rane",
        email: "vedant@example.com",
        password: "password123", // mock password
      });
      await user.save();
      console.log(`Created test user: ${user.fullName} (${user._id})`);
    } else {
      console.log(`Found existing user: ${user.fullName} (${user._id})`);
    }

    // 2. Clear existing transactions for this user to make it repeatable
    console.log("Clearing existing transactions and audit logs...");
    await Transaction.deleteMany({ userId: user._id });
    await AuditLog.deleteMany({ userId: user._id });
    console.log("Cleared.");

    // 3. Generate 10,250 records
    const recordCount = 10250;
    console.log(`Generating ${recordCount} transaction records. Please wait...`);

    const statuses = ["success", "pending", "failed", "refunded"];
    const paymentModes = ["Card", "UPI", "Netbanking", "Wallet"];
    
    // Status probability distribution: success (80%), failed (10%), pending (7%), refunded (3%)
    function getRandomStatus() {
      const rand = Math.random();
      if (rand < 0.80) return "success";
      if (rand < 0.90) return "failed";
      if (rand < 0.97) return "pending";
      return "refunded";
    }

    const transactionsBatch = [];
    const baseDate = new Date();

    for (let i = 0; i < recordCount; i++) {
      // Stagger timestamps backwards by ~12 minutes per transaction to cover last ~3 months
      const createdAt = new Date(baseDate.getTime() - i * 12 * 60 * 1000);
      const invoiceId = `INV-${createdAt.toISOString().slice(0, 10).replace(/-/g, "")}-${String(100000 + i).slice(-6)}`;
      const amount = Math.floor(199 + Math.random() * 9800);
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const status = getRandomStatus();
      const gatewayTxId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      transactionsBatch.push({
        userId: user._id,
        invoiceId,
        amount,
        paymentMode,
        status,
        paymentGatewayTransactionId: gatewayTxId,
        createdAt,
        updatedAt: createdAt,
      });

      // Insert in batches of 2000 to keep memory under control and operations highly responsive
      if (transactionsBatch.length === 2000 || i === recordCount - 1) {
        await Transaction.insertMany(transactionsBatch);
        transactionsBatch.length = 0; // clear array
        console.log(`Inserted ${i + 1} / ${recordCount} records...`);
      }
    }

    // 4. Create an audit log record representing this seeding event
    await AuditLog.create({
      userId: user._id,
      event: "creation",
      description: `Seeded ${recordCount} mock transactions for user ${user.fullName} to support pagination and performance testing.`,
    });

    console.log("\n=======================================================");
    console.log("✅ TRANSACTION SEEDING COMPLETED SUCCESSFULLY!");
    console.log(`Seeded user ID: ${user._id}`);
    console.log(`Seeded user Name: ${user.fullName}`);
    console.log(`Seeded user Email: ${user.email}`);
    console.log("Run the server to begin testing pagination/filtering!");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seedTransactions();
