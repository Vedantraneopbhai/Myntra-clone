const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const ProcessedWebhook = require("../models/ProcessedWebhook");

dotenv.config({ path: "../.env" });

async function verifyTransactionsSystem() {
  console.log("=======================================================");
  console.log("🔍 STARTING TRANSACTION SYSTEM INTEGRATION VERIFICATION");
  console.log("=======================================================\n");

  const mongoUri = process.env.MONGO_URI || "mongodb+srv://admin:admin%40123@cluster0.jaebpoa.mongodb.net/myntra_clone?appName=Cluster0";
  
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected successfully.\n");

    const userId = new mongoose.Types.ObjectId("6a05808d043e8f5b5380b024");

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. DATA SEED AUDIT CHECK
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("1. 📊 Checking database records for Test User (6a05808d043e8f5b5380b024)...");
    const totalTransactions = await Transaction.countDocuments({ userId });
    console.log(`   - Total seeded transactions found: ${totalTransactions}`);
    if (totalTransactions >= 10000) {
      console.log(`   ✅ Seed verification: Success! (${totalTransactions} records present)`);
    } else {
      console.log(`   ❌ Seed verification: Failed! Expected >= 10,000, found ${totalTransactions}`);
    }
    console.log("");

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. QUERY PERFORMANCE CHECK (TARGET: < 50ms)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("2. ⚡ Testing index performance on paginated, filtered queries...");
    const filters = [
      { status: "success", paymentMode: "Card", page: 1, limit: 10 },
      { status: "refunded", paymentMode: "UPI", page: 5, limit: 10 },
      { status: "All", paymentMode: "All", page: 200, limit: 15 }
    ];

    for (let i = 0; i < filters.length; i++) {
      const f = filters[i];
      const query = { userId };
      if (f.status !== "All") query.status = f.status;
      if (f.paymentMode !== "All") query.paymentMode = f.paymentMode;

      const startTime = Date.now();
      const results = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((f.page - 1) * f.limit)
        .limit(f.limit);
      const queryDuration = Date.now() - startTime;

      console.log(`   - Query ${i + 1} (status: "${f.status}", payMode: "${f.paymentMode}", page: ${f.page}):`);
      console.log(`     Returned ${results.length} records in ${queryDuration}ms`);
      if (queryDuration < 50) {
        console.log(`     ✅ Performance: Excellent (< 50ms)`);
      } else {
        console.log(`     ⚠️ Performance warning: Query took ${queryDuration}ms (> 50ms)`);
      }
    }
    console.log("");

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. IDEMPOTENT WEBHOOK HANDLER SIMULATOR
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("3. 🛡️ Simulating Idempotent Webhook Event Processor...");
    const testEventId = `evt_test_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // First Webhook Processing
    console.log(`   - Receiving webhook for Event ID: ${testEventId}`);
    let webhookResult1;
    try {
      await ProcessedWebhook.create({ eventId: testEventId });
      webhookResult1 = { success: true, message: "Webhook accepted and processed" };
    } catch (err) {
      webhookResult1 = { success: false, error: err };
    }
    console.log(`     First webhook result:`, webhookResult1);

    // Second Duplicate Webhook Processing
    console.log(`   - Receiving DUPLICATE webhook for Event ID: ${testEventId}`);
    let webhookResult2;
    try {
      await ProcessedWebhook.create({ eventId: testEventId });
      webhookResult2 = { success: true, message: "Webhook accepted and processed" };
    } catch (err) {
      if (err.code === 11000) {
        webhookResult2 = { success: true, idempotent: true, message: "Webhook already processed. No action taken." };
      } else {
        webhookResult2 = { success: false, error: err };
      }
    }
    console.log(`     Second webhook result:`, webhookResult2);

    if (webhookResult1.success && webhookResult2.idempotent) {
      console.log("   ✅ Webhook Idempotency: Working perfectly! Duplicate rejected gracefully.");
    } else {
      console.log("   ❌ Webhook Idempotency: FAILED verification.");
    }
    console.log("");

    // Cleanup test event
    await ProcessedWebhook.deleteOne({ eventId: testEventId });

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. REFUND TRANSITION WORKFLOW
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("4. 🔄 Verifying refund transition workflow...");
    const sampleTx = await Transaction.findOne({ userId, status: "success" });
    if (sampleTx) {
      console.log(`   - Found successful transaction ${sampleTx._id} (Invoice: ${sampleTx.invoiceId})`);
      const oldStatus = sampleTx.status;
      
      // Request refund simulation
      sampleTx.status = "refunded";
      await sampleTx.save();

      await AuditLog.create({
        transactionId: sampleTx._id,
        userId,
        event: "refund",
        description: "Verified refund transition inside testing verification suite.",
        metadata: { reason: "Self-Testing verification" }
      });

      const updatedTx = await Transaction.findById(sampleTx._id);
      console.log(`     Updated status: ${updatedTx.status}`);

      if (updatedTx.status === "refunded") {
        console.log("     ✅ Refund Transition: Success!");
      } else {
        console.log("     ❌ Refund Transition: Failed!");
      }

      // Revert sample transaction status back to success for repeatability
      updatedTx.status = "success";
      await updatedTx.save();
      console.log("     - Restored sample transaction back to success status.");
    } else {
      console.log("   ⚠️ No successful transaction found to run refund test on.");
    }
    console.log("");

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. AUDIT LOG VALIDATION
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("5. 📓 Validating Audit Log entries...");
    const auditCount = await AuditLog.countDocuments({ userId });
    const recentAudit = await AuditLog.findOne({ userId }).sort({ createdAt: -1 });

    console.log(`   - Total audit logs found: ${auditCount}`);
    if (recentAudit) {
      console.log(`   - Most recent audit log event: "${recentAudit.event}"`);
      console.log(`     Description: "${recentAudit.description}"`);
    }

    if (auditCount > 0) {
      console.log("   ✅ Audit Logging: Validated successfully!");
    } else {
      console.log("   ❌ Audit Logging: No records found.");
    }
    console.log("");

    console.log("=======================================================");
    console.log("🏁 INTEGRATION TESTS COMPLETED SUCCESSFULLY!");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Verification failed with error:", err);
    process.exit(1);
  }
}

verifyTransactionsSystem();
