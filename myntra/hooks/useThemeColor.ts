import { useTheme } from '@/context/ThemeContext';
import { ThemeColors } from '@/constants/Theme';

/**
 * Returns a single color token from the active theme.
 * Optionally accepts per-prop overrides for light/dark.
 *
 * Usage:
 *   const color = useThemeColor({}, 'primary');
 *   const color = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
): string {
  const { theme, themeMode } = useTheme();
  const colorFromProps = props[themeMode];

  if (colorFromProps) {
    return colorFromProps;
  }

  const value = theme[colorName];
  // statusBar is a non-color string — guard against it
  if (typeof value === 'string' && value !== 'light' && value !== 'dark') {
    return value;
  }
  return theme.text;
}
