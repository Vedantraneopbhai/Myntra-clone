const express = require("express");
const RecentlyViewed = require("../models/RecentlyViewed");
const router = express.Router();

/**
 * POST /recentlyviewed
 * Add or update a product view for a user
 * Body: { userId, productId }
 * Logic: 
 *   - If product already viewed by user, update viewedAt timestamp
 *   - If new product, add entry
 *   - If user has >20 items, remove oldest items until count is 20
 * Returns: Full sorted recently viewed list for the user
 */
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ 
        message: "userId and productId are required" 
      });
    }

    // Step 1: Try to update existing entry (move to top by updating timestamp)
    const existingEntry = await RecentlyViewed.findOne({ 
      userId, 
      productId 
    });

    if (existingEntry) {
      // Update existing: move to top with new timestamp
      existingEntry.viewedAt = new Date();
      await existingEntry.save();
    } else {
      // Step 2: Create new entry if not exists
      const newEntry = new RecentlyViewed({
        userId,
        productId,
        viewedAt: new Date()
      });
      await newEntry.save();
    }

    // Step 3: Check if user has more than 20 items
    const allViews = await RecentlyViewed.find({ userId })
      .sort({ viewedAt: -1 });

    if (allViews.length > 20) {
      // Remove oldest items beyond the 20 most recent
      const itemsToRemove = allViews.slice(20);
      const idsToRemove = itemsToRemove.map(item => item._id);
      
      await RecentlyViewed.deleteMany({ _id: { $in: idsToRemove } });
    }

    // Step 4: Fetch and return updated list (max 20, sorted newest first)
    const finalList = await RecentlyViewed.find({ userId })
      .populate("productId")
      .sort({ viewedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      recentlyViewed: finalList
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      message: "Error tracking product view",
      error: error.message 
    });
  }
});

/**
 * GET /recentlyviewed/:userid
 * Fetch user's recently viewed products
 * Returns: Array of recently viewed items sorted by viewedAt (newest first)
 */
router.get("/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ 
        message: "userid parameter is required" 
      });
    }

    const recentlyViewed = await RecentlyViewed.find({ userId: userid })
      .populate("productId")
      .sort({ viewedAt: -1 })
      .limit(20);

    res.status(200).json(recentlyViewed);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      message: "Error fetching recently viewed items",
      error: error.message 
    });
  }
});

/**
 * POST /recentlyviewed/merge
 * Merge anonymous (local) and authenticated (server) view histories
 * Body: { userId, anonymousViews: [{ productId, viewedAt }, ...] }
 * Logic:
 *   - Fetch existing server views for userId
 *   - Combine with anonymous views
 *   - Deduplicate by productId (keep entry with latest viewedAt)
 *   - Sort by viewedAt descending
 *   - Keep only top 20 most recent
 *   - Save all back to database
 * Returns: Merged recently viewed list
 */
router.post("/merge", async (req, res) => {
  try {
    const { userId, anonymousViews } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        message: "userId is required" 
      });
    }

    // Step 1: Fetch existing server views for this user
    const serverViews = await RecentlyViewed.find({ userId });

    // Step 2: Create a map of all views indexed by productId
    // This ensures deduplication with latest timestamp preserved
    const mergedMap = new Map();

    // Add server views
    serverViews.forEach(view => {
      const productIdStr = view.productId.toString();
      mergedMap.set(productIdStr, {
        userId,
        productId: view.productId,
        viewedAt: new Date(view.viewedAt)
      });
    });

    // Add anonymous views (may override if more recent)
    if (Array.isArray(anonymousViews)) {
      anonymousViews.forEach(view => {
        const productIdStr = view.productId.toString();
        const existingEntry = mergedMap.get(productIdStr);
        
        // Keep whichever is more recent
        if (!existingEntry || new Date(view.viewedAt) > new Date(existingEntry.viewedAt)) {
          mergedMap.set(productIdStr, {
            userId,
            productId: view.productId,
            viewedAt: new Date(view.viewedAt)
          });
        }
      });
    }

    // Step 3: Convert map to array and sort by viewedAt (newest first)
    const mergedArray = Array.from(mergedMap.values())
      .sort((a, b) => b.viewedAt - a.viewedAt);

    // Step 4: Keep only top 20
    const topItems = mergedArray.slice(0, 20);

    // Step 5: Clear old entries and save new merged list
    await RecentlyViewed.deleteMany({ userId });

    const savedEntries = await RecentlyViewed.insertMany(topItems);

    // Step 6: Fetch final list with populated product data
    const finalList = await RecentlyViewed.find({ userId })
      .populate("productId")
      .sort({ viewedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      merged: finalList,
      count: finalList.length
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      message: "Error merging view histories",
      error: error.message 
    });
  }
});

module.exports = router;
