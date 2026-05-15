/**
 * Recently Viewed Local Storage Utility
 * 
 * Provides functions to manage recently viewed products in local persistent storage.
 * Handles both native (iOS/Android) via expo-secure-store and web (localStorage).
 * 
 * Data Structure:
 * {
 *   items: [
 *     { productId: string, name: string, brand: string, price: number, image: string, viewedAt: timestamp },
 *     ...
 *   ],
 *   lastSync: timestamp
 * }
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STORAGE_KEY = "recentlyViewed";
const MAX_LOCAL_ITEMS = 20;

/**
 * Get platform-appropriate storage methods
 */
const getStorage = () => {
  if (Platform.OS === "web") {
    return {
      async getItem(key: string) {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error("Web storage getItem error:", error);
          return null;
        }
      },
      async setItem(key: string, value: string) {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error("Web storage setItem error:", error);
        }
      },
      async removeItem(key: string) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Web storage removeItem error:", error);
        }
      }
    };
  } else {
    // Native (iOS/Android)
    return {
      async getItem(key: string) {
        try {
          return await SecureStore.getItemAsync(key);
        } catch (error) {
          console.error("SecureStore getItem error:", error);
          return null;
        }
      },
      async setItem(key: string, value: string) {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (error) {
          console.error("SecureStore setItem error:", error);
        }
      },
      async removeItem(key: string) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.error("SecureStore removeItem error:", error);
        }
      }
    };
  }
};

const storage = getStorage();

/**
 * Get local recently viewed list
 * Returns: Array of recently viewed items or empty array if none found
 */
export async function getLocalRecentlyViewed(): Promise<any[]> {
  try {
    const data = await storage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.items || [];
  } catch (error) {
    console.error("Error getting local recently viewed:", error);
    return [];
  }
}

/**
 * Save recently viewed list to local storage
 * Overwrites entire list
 */
export async function saveLocalRecentlyViewed(items: any[]): Promise<void> {
  try {
    const data = {
      items,
      lastSync: Date.now()
    };
    await storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving local recently viewed:", error);
  }
}

/**
 * Add or update a product in local recently viewed list
 * - If product already exists, move to top (update timestamp)
 * - If new product, add to top
 * - Auto-cap at MAX_LOCAL_ITEMS (20)
 * Returns: Updated list
 */
export async function addLocalRecentlyViewed(
  productId: string,
  productData: {
    name: string;
    brand: string;
    price: number;
    image?: string;
    [key: string]: any;
  },
  timestamp?: number
): Promise<any[]> {
  try {
    let items = await getLocalRecentlyViewed();

    // Check if product already in list
    const existingIndex = items.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      // Move to top by removing and re-adding with new timestamp
      const item = items.splice(existingIndex, 1)[0];
      item.viewedAt = timestamp || Date.now();
      items.unshift(item);
    } else {
      // Add new item to top
      items.unshift({
        productId,
        name: productData.name,
        brand: productData.brand,
        price: productData.price,
        image: productData.image || "",
        viewedAt: timestamp || Date.now()
      });
    }

    // Cap at MAX_LOCAL_ITEMS
    if (items.length > MAX_LOCAL_ITEMS) {
      items = items.slice(0, MAX_LOCAL_ITEMS);
    }

    // Save back to storage
    await saveLocalRecentlyViewed(items);

    return items;
  } catch (error) {
    console.error("Error adding to local recently viewed:", error);
    return [];
  }
}

/**
 * Clear all local recently viewed data
 */
export async function clearLocalRecentlyViewed(): Promise<void> {
  try {
    await storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing local recently viewed:", error);
  }
}

/**
 * Merge local (anonymous) and server (authenticated) view histories
 * - Combine both lists
 * - Deduplicate by productId (keep entry with latest timestamp)
 * - Sort by timestamp descending (newest first)
 * - Cap at MAX_LOCAL_ITEMS (20)
 * 
 * Returns: Merged list
 */
export async function mergeLocalAndServer(
  serverList: any[],
  anonymousList: any[]
): Promise<any[]> {
  try {
    // Create map indexed by productId to deduplicate
    const mergedMap = new Map<string, any>();

    // Add server list items
    serverList.forEach(item => {
      mergedMap.set(item.productId || item.productId._id, {
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || item.name || "",
        brand: item.productId?.brand || item.brand || "",
        price: item.productId?.price || item.price || 0,
        image: item.productId?.images?.[0] || item.image || "",
        viewedAt: new Date(item.viewedAt).getTime()
      });
    });

    // Add anonymous list items (may override if more recent)
    anonymousList.forEach(item => {
      const existing = mergedMap.get(item.productId);
      const itemTime = new Date(item.viewedAt).getTime();

      if (!existing || itemTime > existing.viewedAt) {
        mergedMap.set(item.productId, item);
      }
    });

    // Convert to array, sort by timestamp (newest first), cap at 20
    const merged = Array.from(mergedMap.values())
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, MAX_LOCAL_ITEMS);

    return merged;
  } catch (error) {
    console.error("Error merging local and server recently viewed:", error);
    return [];
  }
}

/**
 * Extract minimal view data for server merge operation
 * Converts local format to format expected by server merge endpoint
 */
export function extractAnonymousViewsForMerge(items: any[]): Array<{ productId: string; viewedAt: number }> {
  return items.map(item => ({
    productId: item.productId,
    viewedAt: item.viewedAt
  }));
}
