const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const ProcessedWebhook = require("../models/ProcessedWebhook");
const Order = require("../models/Order");

// 1. Paginated, Sorted, and Filtered Transactions lookup
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const { status, paymentMode } = req.query;

    // Base query
    const query = { userId: new mongoose.Types.ObjectId(userId) };

    // Apply filters
    if (status && status !== "All") {
      query.status = status;
    }
    if (paymentMode && paymentMode !== "All") {
      query.paymentMode = paymentMode;
    }

    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Fetch data with pagination
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("orderId");

    const total = await Transaction.countDocuments(query);

    return res.status(200).json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// 2. Idempotent Webhook Handler
router.post("/webhook", async (req, res) => {
  const { eventId, type, data } = req.body;

  if (!eventId || !type || !data) {
    return res.status(400).json({ message: "Invalid webhook payload structure" });
  }

  try {
    // Attempt atomic insertion for the idempotency key (eventId)
    // If eventId exists, it will throw a duplicate key error (code 11000)
    await ProcessedWebhook.create({ eventId });
  } catch (err) {
    if (err.code === 11000) {
      console.log(`[Webhook Idempotency] Duplicate webhook received: ${eventId}. Ignoring.`);
      return res.status(200).json({
        message: "Webhook already processed. No action taken.",
        idempotent: true,
      });
    }
    console.error("Webhook idempotency tracking error:", err);
    return res.status(500).json({ message: "Database error during idempotency validation" });
  }

  // Transaction processing logic
  try {
    if (type === "payment.succeeded" || type === "payment.failed" || type === "payment.pending") {
      const { userId, orderId, amount, paymentMode, transactionId: gatewayTxId } = data;

      let status = "pending";
      if (type === "payment.succeeded") status = "success";
      if (type === "payment.failed") status = "failed";

      const invoiceId = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;

      const transaction = new Transaction({
        userId,
        orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
        invoiceId,
        amount,
        paymentMode,
        status,
        paymentGatewayTransactionId: gatewayTxId,
      });

      await transaction.save();

      // Create detailed Audit Log
      await AuditLog.create({
        transactionId: transaction._id,
        userId,
        event: status === "success" ? "success" : status === "failed" ? "failure" : "creation",
        description: `Webhook processed for event: ${type}. Invoice: ${invoiceId}. Status set to: ${status}.`,
        metadata: { eventId, type },
      });

      // Mark webhook completed successfully
      await ProcessedWebhook.updateOne({ eventId }, { status: "completed" });

      return res.status(200).json({
        success: true,
        transactionId: transaction._id,
        invoiceId,
      });
    } else {
      await ProcessedWebhook.updateOne({ eventId }, { status: "failed" });
      return res.status(400).json({ message: `Unsupported webhook event type: ${type}` });
    }
  } catch (processError) {
    console.error("Error processing webhook database actions:", processError);
    await ProcessedWebhook.updateOne({ eventId }, { status: "failed" });
    return res.status(500).json({ message: "Failed to apply webhook transactions" });
  }
});

// 3. Webhook/Route for Refund Trigger
router.post("/refund", async (req, res) => {
  const { transactionId, userId, reason } = req.body;

  if (!transactionId || !userId) {
    return res.status(400).json({ message: "transactionId and userId are required" });
  }

  try {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "success") {
      return res.status(400).json({ message: "Only successful transactions can be refunded" });
    }

    transaction.status = "refunded";
    await transaction.save();

    // Create Audit Log
    await AuditLog.create({
      transactionId: transaction._id,
      userId,
      event: "refund",
      description: `Transaction refunded. Reason: ${reason || "User requested"}`,
      metadata: { reason },
    });

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      transaction,
    });
  } catch (error) {
    console.error("Refund processing error:", error);
    return res.status(500).json({ message: "Failed to process refund" });
  }
});

// 4. High-Performance Streaming CSV Exporter
router.get("/export/csv/:userId", async (req, res) => {
  const { userId } = req.params;
  const { status, paymentMode } = req.query;

  try {
    // Verify user exists/setup search filters
    const query = { userId: new mongoose.Types.ObjectId(userId) };

    if (status && status !== "All") {
      query.status = status;
    }
    if (paymentMode && paymentMode !== "All") {
      query.paymentMode = paymentMode;
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=transactions_export_${userId}.csv`);

    // Write CSV Headers
    res.write("Invoice ID,Transaction ID,Amount,Payment Mode,Status,Date/Time,Gateway Ref ID\n");

    // Use Mongo Cursor to stream rows sequentially (low-memory footprint)
    const cursor = Transaction.find(query).sort({ createdAt: -1 }).cursor();

    let count = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const escapedInvoice = (doc.invoiceId || "").replace(/"/g, '""');
      const escapedMode = (doc.paymentMode || "").replace(/"/g, '""');
      const escapedStatus = (doc.status || "").replace(/"/g, '""');
      const dateStr = doc.createdAt ? doc.createdAt.toISOString() : "";
      const escapedGatewayId = (doc.paymentGatewayTransactionId || "").replace(/"/g, '""');

      const row = `"${escapedInvoice}","${doc._id}",${doc.amount},"${escapedMode}","${escapedStatus}","${dateStr}","${escapedGatewayId}"\n`;
      res.write(row);
      count++;
    }

    res.end();

    // Create Audit Log entry
    await AuditLog.create({
      userId,
      event: "csv_exported",
      description: `Successfully streamed CSV export containing ${count} transaction rows`,
      metadata: { filterStatus: status, filterPaymentMode: paymentMode, rowCount: count },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  }
});

// 5. Secure PDF Receipt Generation (via PDFKit)
router.get("/:transactionId/receipt", async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findById(transactionId).populate("userId");
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Attempt to find linked order details if present
    let orderDetails = null;
    if (transaction.orderId) {
      orderDetails = await Order.findById(transaction.orderId).populate("items.productId");
    }

    // Set Response Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=receipt_${transaction.invoiceId}.pdf`);

    // Create a new PDFKit Document
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Color definitions matching the central brand identity
    const brandPink = "#ff3f6c";
    const darkGray = "#2a2a2a";
    const lightText = "#666666";
    const lightBg = "#f9f9f9";
    const borderGray = "#eeeeee";

    // ── HEADER SECTION ──
    doc.rect(0, 0, 595.28, 12).fill(brandPink); // Top accent strip

    doc.fillColor(brandPink)
       .font("Helvetica-Bold")
       .fontSize(28)
       .text("Myntra", 50, 45);

    doc.fillColor(darkGray)
       .fontSize(10)
       .font("Helvetica")
       .text("ONLINE RETAIL SHOPPING INDIA", 50, 75);

    doc.fillColor(darkGray)
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("TAX INVOICE / RECEIPT", 400, 45, { align: "right" });

    // Header divider line
    doc.moveTo(50, 95).lineTo(545, 95).strokeColor(borderGray).stroke();

    // ── METADATA BOX (Two Columns) ──
    doc.fontSize(10).font("Helvetica-Bold").fillColor(darkGray);
    doc.text("Billed To:", 50, 115);
    doc.font("Helvetica").fillColor(lightText);
    doc.text(transaction.userId?.fullName || "Valued Customer", 50, 130);
    doc.text(transaction.userId?.email || "customer@myntra.com", 50, 142);
    if (orderDetails && orderDetails.shippingAddress) {
      doc.text(orderDetails.shippingAddress, 50, 154, { width: 220 });
    }

    doc.fontSize(10).font("Helvetica-Bold").fillColor(darkGray);
    doc.text("Invoice Details:", 320, 115);
    doc.font("Helvetica").fillColor(lightText);
    
    // Formatting variables
    const dateFormatted = transaction.createdAt
      ? transaction.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    doc.text(`Invoice ID: ${transaction.invoiceId}`, 320, 130);
    doc.text(`Date & Time: ${dateFormatted}`, 320, 142);
    doc.text(`Payment Mode: ${transaction.paymentMode}`, 320, 154);
    doc.text(`Gateway Ref: ${transaction.paymentGatewayTransactionId || "N/A"}`, 320, 166);

    doc.moveTo(50, 195).lineTo(545, 195).strokeColor(borderGray).stroke();

    // ── TRANSACTION / ORDER DETAIL TABLE ──
    doc.fontSize(12).font("Helvetica-Bold").fillColor(darkGray).text("Transaction Summary", 50, 215);

    // Table Header Background
    doc.rect(50, 235, 495, 22).fill(lightBg);

    // Table Headers Text
    doc.fontSize(9).font("Helvetica-Bold").fillColor(darkGray);
    doc.text("Item / Description", 60, 242);
    doc.text("Qty", 330, 242, { width: 30, align: "center" });
    doc.text("Unit Price", 380, 242, { width: 70, align: "right" });
    doc.text("Total", 470, 242, { width: 70, align: "right" });

    let currentY = 265;

    // Render items: if order exists, list actual items. Otherwise, list a generic transaction row.
    if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
      orderDetails.items.forEach((item) => {
        doc.fontSize(9).font("Helvetica").fillColor(lightText);

        const productName = item.productId
          ? `${item.productId.brand || ""} ${item.productId.name || "Item"}`
          : `Myntra Order Item (Size: ${item.size || "Standard"})`;

        doc.text(productName, 60, currentY, { width: 250 });
        doc.text(item.quantity ? String(item.quantity) : "1", 330, currentY, { width: 30, align: "center" });
        doc.text(`₹${item.price || item.productId?.price || 0}`, 380, currentY, { width: 70, align: "right" });
        
        const lineTotal = (item.quantity || 1) * (item.price || item.productId?.price || 0);
        doc.text(`₹${lineTotal}`, 470, currentY, { width: 70, align: "right" });

        currentY += 22;

        // Draw item divider
        doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).strokeColor(borderGray).stroke();
      });
    } else {
      // Fallback description when no actual order object is mapped to the transaction
      doc.fontSize(9).font("Helvetica").fillColor(lightText);
      doc.text("Shopping Purchase (Myntra Digital Transaction)", 60, currentY, { width: 250 });
      doc.text("1", 330, currentY, { width: 30, align: "center" });
      doc.text(`₹${transaction.amount}`, 380, currentY, { width: 70, align: "right" });
      doc.text(`₹${transaction.amount}`, 470, currentY, { width: 70, align: "right" });

      currentY += 22;
      doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).strokeColor(borderGray).stroke();
    }

    // ── TOTALS SECTION ──
    const summaryStartY = currentY + 15;
    
    // Status Accent Badge
    let statusBgColor = "#e6f4ea"; // Light green for success
    let statusTextColor = "#00b852";

    if (transaction.status === "failed") {
      statusBgColor = "#fde8e8"; // Light red
      statusTextColor = "#e02424";
    } else if (transaction.status === "pending") {
      statusBgColor = "#fef3c7"; // Light yellow
      statusTextColor = "#d97706";
    } else if (transaction.status === "refunded") {
      statusBgColor = "#eef2f6"; // Light gray
      statusTextColor = "#4b5563";
    }

    doc.rect(50, summaryStartY, 120, 22).fill(statusBgColor);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(statusTextColor);
    doc.text(`STATUS: ${transaction.status.toUpperCase()}`, 60, summaryStartY + 7);

    // Subtotal and Total text
    doc.fontSize(10).font("Helvetica").fillColor(lightText);
    doc.text("Total Paid:", 380, summaryStartY);
    doc.fontSize(14).font("Helvetica-Bold").fillColor(brandPink);
    doc.text(`₹${transaction.amount}`, 460, summaryStartY - 3, { width: 80, align: "right" });

    // ── FOOTER SIGN-OFF ──
    doc.moveTo(50, 480).lineTo(545, 480).strokeColor(borderGray).stroke();

    doc.fontSize(8).font("Helvetica").fillColor(lightText);
    doc.text("Thank you for shopping with Myntra!", 50, 500, { align: "center" });
    doc.text("This is a computer-generated tax invoice. No physical signature is required.", 50, 512, { align: "center" });
    doc.text("For any support queries, please reach out via the Help Center in the App.", 50, 524, { align: "center" });

    // End Document
    doc.end();

    // Create Audit Log entry asynchronously
    await AuditLog.create({
      transactionId: transaction._id,
      userId: transaction.userId?._id || transaction.userId,
      event: "receipt_downloaded",
      description: `PDF invoice receipt compiled and downloaded for Invoice ${transaction.invoiceId}`,
      metadata: { invoiceId: transaction.invoiceId },
    });
  } catch (error) {
    console.error("PDF Receipt generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate receipt PDF" });
    }
  }
});

module.exports = router;
