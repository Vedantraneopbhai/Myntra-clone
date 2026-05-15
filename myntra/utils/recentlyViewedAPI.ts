/**
 * Recently Viewed API Service
 * 
 * Handles all HTTP communication with the backend for recently viewed products.
 * Endpoints:
 * - POST /recentlyviewed - Track a product view
 * - GET /recentlyviewed/:userid - Fetch user's recently viewed list
 * - POST /recentlyviewed/merge - Merge anonymous and authenticated histories
 */

import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000";

/**
 * Track a product view on the server
 * 
 * @param userId - User ID (from auth context)
 * @param productId - Product ID being viewed
 * @returns Recently viewed list from server (max 20, sorted newest first)
 */
export async function trackProductView(
  userId: string,
  productId: string
): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/recentlyviewed`, {
      userId,
      productId
    });

    return response.data;
  } catch (error) {
    console.error("Error tracking product view:", error);
    throw error;
  }
}

/**
 * Fetch recently viewed list for a user
 * 
 * @param userId - User ID
 * @returns Array of recently viewed items with populated product data
 */
export async function fetchRecentlyViewed(userId: string): Promise<any[]> {
  try {
    const response = await axios.get(`${BASE_URL}/recentlyviewed/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recently viewed list:", error);
    throw error;
  }
}

/**
 * Merge anonymous view history with authenticated user's server history
 * Called on login to combine local anonymous views with server views
 * 
 * @param userId - User ID (newly authenticated)
 * @param anonymousViews - Array of views from anonymous browsing
 *        Format: [{ productId: string, viewedAt: timestamp }, ...]
 * @returns Merged recently viewed list (max 20, sorted newest first)
 */
export async function mergeHistories(
  userId: string,
  anonymousViews: Array<{ productId: string; viewedAt: number }>
): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/recentlyviewed/merge`, {
      userId,
      anonymousViews
    });

    return response.data;
  } catch (error) {
    console.error("Error merging histories:", error);
    throw error;
  }
}

/**
 * Format product data for local storage
 * Extracts necessary fields from product object
 */
export function formatProductForStorage(product: any) {
  return {
    productId: product._id || product.id,
    name: product.name || "Unknown",
    brand: product.brand || "",
    price: product.price || 0,
    image: Array.isArray(product.images) ? product.images[0] : product.image || ""
  };
}
