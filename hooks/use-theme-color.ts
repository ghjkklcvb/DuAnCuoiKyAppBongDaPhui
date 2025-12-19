/**
 * Single theme mode - no light/dark toggle
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // In single theme mode, we ignore light/dark props
  // Just return the color from Colors directly
  const color = Colors[colorName];
  return typeof color === 'string' ? color : Colors.text;
}
