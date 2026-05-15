import { useTheme } from '@/context/ThemeContext';

/**
 * Returns the current theme mode ('light' | 'dark').
 * Reads from ThemeContext so it respects user's manual override,
 * not just the device system setting.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { themeMode } = useTheme();
  return themeMode;
}
