import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getUserData, saveUserData, clearUserData } from "@/utils/storage";
import React from "react";
import axios from "axios";
import {
  getLocalRecentlyViewed,
  saveLocalRecentlyViewed,
  addLocalRecentlyViewed,
  mergeLocalAndServer,
  clearLocalRecentlyViewed,
  extractAnonymousViewsForMerge
} from "@/utils/recentlyViewed";
import {
  trackProductView,
  fetchRecentlyViewed,
  mergeHistories,
  formatProductForStorage
} from "@/utils/recentlyViewedAPI";
import { API_BASE_URL } from "@/constants/api";

type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  recentlyViewedList: any[];
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addToRecentlyViewed: (productId: string, productData: any) => Promise<void>;
  syncRecentlyViewed: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);
  const [recentlyViewedList, setRecentlyViewedList] = useState<any[]>([]);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // Initialize auth state on app load
  useEffect(() => {
    (async () => {
      const data = await getUserData();
      if (data._id && data.name && data.email) {
        setUser({ _id: data._id, name: data.name, email: data.email });
        setIsAuthenticated(true);
        // Fetch recently viewed from server
        try {
          const serverList = await fetchRecentlyViewed(data._id);
          setRecentlyViewedList(serverList);
        } catch (error) {
          console.error("Error fetching recently viewed on app init:", error);
          // Fall back to local storage
          const localList = await getLocalRecentlyViewed();
          setRecentlyViewedList(localList);
        }
      } else {
        // Not authenticated - load anonymous recently viewed from local storage
        try {
          const localList = await getLocalRecentlyViewed();
          setRecentlyViewedList(localList);
        } catch (error) {
          console.error("Error loading local recently viewed:", error);
        }
      }
    })();
  }, []);

  // Setup periodic sync interval when authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Start 30-second periodic sync
      syncIntervalRef.current = setInterval(() => {
        syncRecentlyViewed().catch(error =>
          console.error("Periodic sync error:", error)
        );
      }, 30000); // 30 seconds

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, user?._id]);

  /**
   * Add product to recently viewed
   * - If authenticated: sync to server via trackProductView
   * - If anonymous: save to local storage
   */
  const addToRecentlyViewed = async (
    productId: string,
    productData: any
  ): Promise<void> => {
    try {
      const formatted = formatProductForStorage(productData);

      if (isAuthenticated && user?._id) {
        // Authenticated: track on server (which returns updated list and auto-caps at 20)
        try {
          const response = await trackProductView(user._id, productId);
          if (response.recentlyViewed) {
            setRecentlyViewedList(response.recentlyViewed);
            // Also update local storage for fast access
            await saveLocalRecentlyViewed(response.recentlyViewed);
          }
        } catch (error) {
          console.error("Error tracking product view on server:", error);
          // Fallback to local storage
          const updated = await addLocalRecentlyViewed(
            productId,
            formatted
          );
          setRecentlyViewedList(updated);
        }
      } else {
        // Anonymous: add to local storage only
        const updated = await addLocalRecentlyViewed(productId, formatted);
        setRecentlyViewedList(updated);
      }
    } catch (error) {
      console.error("Error adding to recently viewed:", error);
    }
  };

  /**
   * Sync recently viewed list with server
   * Used for periodic sync to catch up on any changes
   */
  const syncRecentlyViewed = async (): Promise<void> => {
    if (!isAuthenticated || !user?._id) return;

    try {
      // Throttle syncs to avoid excessive requests
      const now = Date.now();
      if (now - lastSyncTimeRef.current < 5000) {
        return; // Skip if last sync was less than 5 seconds ago
      }

      lastSyncTimeRef.current = now;

      const serverList = await fetchRecentlyViewed(user._id);
      setRecentlyViewedList(serverList);
      // Update local storage cache
      await saveLocalRecentlyViewed(serverList);
    } catch (error) {
      console.error("Error syncing recently viewed:", error);
    }
  };

  /**
   * Merge anonymous history with authenticated history on login
   */
  const mergeHistoriesOnLogin = async (userId: string): Promise<void> => {
    try {
      // Get anonymous views from local storage
      const anonymousList = await getLocalRecentlyViewed();

      if (anonymousList.length > 0) {
        try {
          // Call merge endpoint on server
          const mergeData = extractAnonymousViewsForMerge(anonymousList);
          const response = await mergeHistories(userId, mergeData);

          if (response.merged) {
            setRecentlyViewedList(response.merged);
            // Clear anonymous local data and save merged data
            await clearLocalRecentlyViewed();
            await saveLocalRecentlyViewed(response.merged);
          }
        } catch (mergeError) {
          console.error("Error calling merge endpoint, trying fallback:", mergeError);
          // Fallback: just fetch existing user history
          try {
            const serverList = await fetchRecentlyViewed(userId);
            setRecentlyViewedList(serverList);
            await saveLocalRecentlyViewed(serverList);
          } catch (fetchError) {
            console.error("Fallback fetch failed:", fetchError);
          }
        }
      } else {
        // No anonymous history - just fetch existing user history
        try {
          const serverList = await fetchRecentlyViewed(userId);
          setRecentlyViewedList(serverList);
          await saveLocalRecentlyViewed(serverList);
        } catch (fetchError) {
          console.warn("Could not fetch recently viewed on login:", fetchError);
          // Don't throw - recently viewed is not critical for login
        }
      }
    } catch (error) {
      console.error("Error in mergeHistoriesOnLogin:", error);
      // Don't throw - recently viewed is not critical for login flow
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log(`🔐 Login attempt for ${email}`);
      console.log(`📡 API URL: ${API_BASE_URL}/user/login`);
      
      const res = await axios.post(`${API_BASE_URL}/user/login`, {
        email,
        password,
      });

      console.log(`✅ Login response:`, res.data);
      
      const data = res.data?.user;
      
      if (!data || !data._id) {
        const errorMsg = res.data?.message || "Invalid response from server";
        console.error(`❌ Login failed: ${errorMsg}`, res.data);
        throw new Error(errorMsg);
      }

      if (!data.fullName) {
        console.error(`❌ User data incomplete:`, data);
        throw new Error("User data incomplete - missing fullName");
      }

      console.log(`💾 Saving user data...`);
      await saveUserData(data._id, data.fullName, data.email);
      setUser({ _id: data._id, name: data.fullName, email: data.email });
      setIsAuthenticated(true);
      console.log(`✅ Login successful!`);

      // Merge recently viewed histories on login
      await mergeHistoriesOnLogin(data._id);
    } catch (error: any) {
      console.error("❌ Login error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        fullError: error
      });
      throw error;
    }
  };

  const Signup = async (fullName: string, email: string, password: string) => {
    try {
      console.log(`📝 Signup attempt for ${email}`);
      console.log(`📡 API URL: ${API_BASE_URL}/user/signup`);
      
      const res = await axios.post(`${API_BASE_URL}/user/signup`, {
        fullName,
        email,
        password,
      });

      console.log(`✅ Signup response:`, res.data);
      
      const data = res.data?.user;
      
      if (!data || !data._id) {
        const errorMsg = res.data?.message || "Invalid response from server";
        console.error(`❌ Signup failed: ${errorMsg}`, res.data);
        throw new Error(errorMsg);
      }

      if (!data.fullName) {
        console.error(`❌ User data incomplete:`, data);
        throw new Error("User data incomplete - missing fullName");
      }

      console.log(`💾 Saving user data...`);
      await saveUserData(data._id, data.fullName, data.email);
      setUser({ _id: data._id, name: data.fullName, email: data.email });
      setIsAuthenticated(true);
      console.log(`✅ Signup successful!`);

      // Merge recently viewed histories on signup (for anonymous -> authenticated transition)
      await mergeHistoriesOnLogin(data._id);
    } catch (error: any) {
      console.error("❌ Signup error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        fullError: error
      });
      throw error;
    }
  };

  const logout = async () => {
    // Stop periodic sync
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    await clearUserData();
    setUser(null);
    setIsAuthenticated(false);
    // Keep local recently viewed for anonymous browsing
    // Don't clear it - user may browse anonymously after logout
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        recentlyViewedList,
        Signup,
        login,
        logout,
        addToRecentlyViewed,
        syncRecentlyViewed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
