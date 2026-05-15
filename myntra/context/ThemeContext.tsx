/**
 * Theme Context
 *
 * Provides centralized theme state to the entire app.
 *
 * Behaviour:
 *  1. On first launch, reads device colorScheme (light/dark)
 *  2. If user has manually set a preference, that overrides device setting
 *  3. Preference is persisted using expo-secure-store (native) / localStorage (web)
 *  4. useSystemTheme() resets to device-driven automatic mode
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ThemeColors, ThemeMode, themes } from '@/constants/Theme';

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers (mirrors pattern in utils/recentlyViewed.ts)
// ─────────────────────────────────────────────────────────────────────────────
const THEME_KEY = 'app_theme_preference';

const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      // Silently fail — theme preference is non-critical
    }
  },
  async remove(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      // no-op
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────────────────────────────────────
type ThemeContextType = {
  /** Resolved color tokens for the active theme */
  theme: ThemeColors;
  /** Active theme mode: 'light' | 'dark' */
  themeMode: ThemeMode;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Set theme explicitly */
  setTheme: (mode: ThemeMode) => void;
  /** True when following device setting (no manual override) */
  isSystemTheme: boolean;
  /** Reset to device-driven automatic mode */
  useSystemTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceScheme = useColorScheme() ?? 'light';
  const [themeMode, setThemeMode] = useState<ThemeMode>(deviceScheme);
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // On mount: load persisted preference
  useEffect(() => {
    (async () => {
      const saved = await storage.get(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        setThemeMode(saved);
        setIsSystemTheme(false);
      } else {
        // No saved preference → follow device
        setThemeMode(deviceScheme);
        setIsSystemTheme(true);
      }
      setIsReady(true);
    })();
  }, []);

  // When device scheme changes and user hasn't overridden, follow it
  useEffect(() => {
    if (isSystemTheme && isReady) {
      setThemeMode(deviceScheme);
    }
  }, [deviceScheme, isSystemTheme, isReady]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    setIsSystemTheme(false);
    storage.set(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      setIsSystemTheme(false);
      storage.set(THEME_KEY, next);
      return next;
    });
  }, []);

  const useSystemTheme = useCallback(() => {
    setIsSystemTheme(true);
    setThemeMode(deviceScheme);
    storage.remove(THEME_KEY);
  }, [deviceScheme]);

  // Don't render children until theme is resolved to prevent flash
  if (!isReady) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[themeMode],
        themeMode,
        toggleTheme,
        setTheme,
        isSystemTheme,
        useSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
