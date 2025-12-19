/**
 * Single theme mode - optimized for red background
 * Professional color palette for football league management app
 */

import { Platform } from 'react-native';

export const Colors = {
  // ========== PRIMARY COLORS (Red Theme) ==========
  primary: '#DC2626',           // Main red - cho background headers, primary buttons
  primaryDark: '#B91C3C',       // Dark red - hover states, shadows
  primaryLight: '#EF4444',      // Light red - accents, highlights
  primarySoft: '#FEE2E2',       // Very light red - subtle backgrounds
  
  // ========== SECONDARY COLORS ==========
  secondary: '#059669',         // Green - cho success, "Đang diễn ra" status
  secondaryDark: '#047857',     // Dark green - hover states
  secondaryLight: '#10B981',    // Light green - subtle accents
  secondarySoft: '#D1FAE5',     // Very light green - backgrounds
  
  // ========== ACCENT COLORS ==========
  accent: '#F59E0B',            // Amber/Orange - cho warnings, "Sắp diễn ra" status
  accentDark: '#D97706',        // Dark amber
  accentLight: '#FBBF24',       // Light amber
  accentSoft: '#FEF3C7',        // Very light amber
  
  // ========== BACKGROUND & SURFACES ==========
  background: '#F8FAFC',        // Main app background - light gray-blue
  backgroundRed: '#DC2626',     // Red background cho headers
  
  card: '#FFFFFF',              // White cards - primary content containers
  cardElevated: '#FFFFFF',      // Cards with shadow
  cardSubtle: '#F1F5F9',        // Subtle background cards
  surface: '#FFFFFF',           // General surfaces
  surfaceHover: '#F8FAFC',      // Hover state for surfaces
  
  // ========== TEXT COLORS ==========
  textColorWhite: '#FFFFFF',
  text: '#0F172A',              // Primary text - dark slate
  textSecondary: '#475569',     // Secondary text - medium gray
  textTertiary: '#94A3B8',      // Tertiary text - light gray
  textOnPrimary: '#FFFFFF',     // Text on red background
  textOnSecondary: '#FFFFFF',   // Text on green background
  textOnAccent: '#FFFFFF',      // Text on amber background
  textMuted: '#CBD5E1',         // Very subtle text
  
  // Text colors for gradient zones
  textOnGradientTop: '#FFFFFF',     // White text on red gradient (top area)
  textOnGradientMid: '#1E293B',     // Dark text on pink gradient (middle)
  textOnGradientBottom: '#0F172A',  // Darkest text on white (bottom)
  textLabelOnGradient: 'rgba(255, 255, 255, 0.95)', // Labels on gradient
  
  // ========== BORDERS & DIVIDERS ==========
  border: '#E2E8F0',            // Default border
  borderLight: '#F1F5F9',       // Light border
  borderStrong: '#CBD5E1',      // Strong border for emphasis
  divider: '#E2E8F0',           // Divider lines
  
  // ========== STATUS COLORS ==========
  success: '#059669',           // Success green
  successLight: '#D1FAE5',      // Light success background
  
  warning: '#F59E0B',           // Warning amber
  warningLight: '#FEF3C7',      // Light warning background
  
  error: '#DC2626',             // Error red
  errorLight: '#FEE2E2',        // Light error background
  
  info: '#3B82F6',              // Info blue
  infoLight: '#DBEAFE',         // Light info background
  
  // ========== MATCH RESULT COLORS ==========
  win: '#059669',               // Win - green
  draw: '#F59E0B',              // Draw - amber
  lose: '#DC2626',              // Lose - red
  
  // ========== ICON COLORS ==========
  icon: '#64748B',              // Default icon color
  iconLight: '#94A3B8',         // Light icon
  iconOnPrimary: '#FFFFFF',     // Icon on red
  
  // ========== TAB BAR ==========
  tabIconDefault: '#94A3B8',    // Inactive tab
  tabIconSelected: '#DC2626',   // Active tab - red
  tabBackground: '#FFFFFF',     // Tab bar background
  
  // ========== SHADOWS & OVERLAYS ==========
  shadow: 'rgba(0, 0, 0, 0.08)',      // Subtle shadow
  shadowMedium: 'rgba(0, 0, 0, 0.12)', // Medium shadow
  shadowStrong: 'rgba(0, 0, 0, 0.16)', // Strong shadow
  overlay: 'rgba(0, 0, 0, 0.5)',       // Modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)',  // Light overlay
  
  // ========== GRADIENTS ==========
  gradient: {
    primary: ['#DC2626', '#EF4444'],           // Red gradient
    primaryReverse: ['#EF4444', '#DC2626'],    // Reverse red
    primaryDark: ['#B91C3C', '#DC2626'],       // Dark red gradient
    
    secondary: ['#059669', '#10B981'],         // Green gradient
    secondaryReverse: ['#10B981', '#059669'],  // Reverse green
    
    accent: ['#F59E0B', '#FBBF24'],            // Amber gradient
    accentReverse: ['#FBBF24', '#F59E0B'],     // Reverse amber
    
    surface: ['#FFFFFF', '#F8FAFC'],           // White to light blue
    surfaceReverse: ['#F8FAFC', '#FFFFFF'],    // Reverse
    
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'], // Fade to dark
  },
  
  // ========== TOURNAMENT STATUS ==========
  statusUpcoming: '#F59E0B',    // Sắp diễn ra - amber
  statusOngoing: '#059669',     // Đang diễn ra - green  
  statusCompleted: '#64748B',   // Đã kết thúc - gray
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
