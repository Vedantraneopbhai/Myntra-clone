const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userrouter = require("./routes/Userroutes");
const categoryrouter = require("./routes/Categoryroutes");
const productrouter = require("./routes/Productroutes");
const Bagroutes = require("./routes/Bagroutes");
const Wishlistroutes = require("./routes/Wishlistroutes");
const OrderRoutes = require("./routes/OrderRoutes");
const RecentlyViewedroutes = require("./routes/RecentlyViewedroutes");
const NotificationRoutes = require("./routes/NotificationRoutes");
const TransactionRoutes = require("./routes/TransactionRoutes");
const { initWorkers } = require("./services/notificationWorker");
const cors = require('cors');
dotenv.config();
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(cors({
  origin: true, // This reflects the request origin, allowing any origin with credentials
  credentials: true, 
}));
app.get("/", (req, res) => {
  res.send("✅ Myntra backend in working");
});
app.use("/user", userrouter);
app.use("/category", categoryrouter);
app.use("/product", productrouter);
app.use("/bag", Bagroutes);
app.use("/wishlist", Wishlistroutes);
app.use("/Order", OrderRoutes);
app.use("/recentlyviewed", RecentlyViewedroutes);
app.use("/notifications", NotificationRoutes);
app.use("/transactions", TransactionRoutes);

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Set it in Render environment variables.");
  process.exit(1);
}

async function runMigration() {
  try {
    const Product = require("./models/Product");
    const products = await Product.find();
    let migratedCount = 0;
    
    for (let p of products) {
      let updated = false;
      
      if (!p.stock || p.stock.size === 0) {
        const stockMap = {};
        if (p.sizes && Array.isArray(p.sizes)) {
          p.sizes.forEach((sz) => {
            stockMap[sz] = Math.floor(Math.random() * 11) + 5;
          });
        }
        p.stock = stockMap;
        updated = true;
      }
      
      if (p.isDiscontinued === undefined) {
        p.isDiscontinued = p.brand === "Wrangler" && p.name.includes("Jeans");
        updated = true;
      }
      
      if (updated) {
        await p.save();
        migratedCount++;
      }
    }
    
    if (migratedCount > 0) {
      console.log(`✅ Migrated ${migratedCount} products with stock and discontinued statuses.`);
    } else {
      console.log("✅ Database schema is up to date. No migration needed.");
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongodb connected");
    runMigration();
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initWorkers(); // Start background notification workers
});
