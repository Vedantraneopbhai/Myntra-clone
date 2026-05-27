const Product = require('../models/Product');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const RecentlyViewed = require('../models/RecentlyViewed');

const getRecommendations = async (userId, productId) => {
    const [product, user, recentlyViewed, userWishlist] = await Promise.all([
        Product.findById(productId),
        User.findById(userId),
        RecentlyViewed.findOne({ user: userId }),
        Wishlist.findOne({ user: userId }).populate('products.product')
    ]);

    if (!product) {
        return [];
    }

    // --- Cold Start: Popular Products ---
    if (!user || (!recentlyViewed && !userWishlist)) {
        return Product.find({ 'category.level1': product.category.level1, _id: { $ne: productId } }).limit(10);
    }

    const recentlyViewedProducts = recentlyViewed ? recentlyViewed.products.map(p => p.product) : [];
    const wishlistProducts = userWishlist ? userWishlist.products.map(p => p.product._id) : [];

    // --- Recommendation Strategy ---
    let recommendedProductIds = [];

    // 1. Category Similarity
    const categorySimilar = await Product.find({
        'category.level1': product.category.level1,
        'category.level2': product.category.level2,
        _id: { $ne: productId, $nin: recentlyViewedProducts }
    }).limit(10).select('_id');
    recommendedProductIds.push(...categorySimilar.map(p => p._id));

    // 2. Wishlist Overlap
    if (wishlistProducts.length > 0) {
        const otherUsersWithSimilarWishlist = await Wishlist.find({
            'products.product': { $in: wishlistProducts },
            user: { $ne: userId }
        }).limit(50).select('products.product');

        const productsFromSimilarWishlists = otherUsersWithSimilarWishlist.flatMap(w => w.products.map(p => p.product));
        recommendedProductIds.push(...productsFromSimilarWishlists);
    }

    // 3. Browsing History
    if (recentlyViewedProducts.length > 0) {
        const productsFromHistory = await Product.find({
            _id: { $in: recentlyViewedProducts, $ne: productId }
        }).limit(10).select('_id');
        recommendedProductIds.push(...productsFromHistory.map(p => p._id));
    }

    // --- Fallback: Popular in Category ---
    if (recommendedProductIds.length < 10) {
        const popularInCategory = await Product.find({
            'category.level1': product.category.level1,
            _id: { $ne: productId, $nin: recommendedProductIds }
        }).sort({ 'ratings.count': -1, 'ratings.average': -1 }).limit(10 - recommendedProductIds.length).select('_id');
        recommendedProductIds.push(...popularInCategory.map(p => p._id));
    }

    // --- Final Selection ---
    const finalProductIds = [...new Set(recommendedProductIds.map(id => id.toString()))]
        .filter(id => id !== productId.toString())
        .slice(0, 10);

    return Product.find({ _id: { $in: finalProductIds } });
};

module.exports = {
    getRecommendations,
};
