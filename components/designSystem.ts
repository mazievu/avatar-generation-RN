import { TextStyle } from 'react-native';

/**
 * ============================================================================
 *  COLOR PALETTE
 *  Định nghĩa bảng màu trung tâm cho ứng dụng.
 * ============================================================================
 */
export const colors = {
  // Primary & Accent
  primary: '#FF6B6B', // Vibrant Coral
  primaryDark: '#E65A5A', // Darker Coral
  accent: '#4ECDC4', // Bright Teal
  accentDark: '#45B8AF', // Darker Teal
  
  // Neutral Backgrounds & Text
  neutral900: '#3D405B', // Dark Slate Blue (For main headers)
  neutral800: '#4A4E6D', // Slightly lighter slate blue
  neutral700: '#6D6F81', // Mid-range slate blue (Good for sub-headings)
  neutral600: '#9A9CAA', // Lighter gray for secondary text, notes
  neutral300: '#D8DDE2', // Light gray for borders, disabled elements
  neutral200: '#E8F0F2', // Light Blue Gray (For panels, secondary backgrounds)
  neutral100: '#F5F7F8', // Very light gray for element backgrounds
  neutral50: '#FAF8F2',  // Light Cream (For main page background)

  // Semantic Colors
  success: '#52C41A',      // Playful Green
  successDark: '#40A916',  // Darker Green
  error: '#FF4D4F',        // Pinkish Red
  errorDark: '#E64446',    // Darker Red
  warning: '#FADB5F',      // Sunny Yellow

  // Text Colors
  textPrimary: '#3D405B',    // Dark Slate Blue
  textSecondary: '#6D6F81', // Mid-range slate blue
  textDisabled: '#BDBEC6',   // Light gray for disabled text
  textLight: '#ffffff',

  // Common Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

/**
 * ============================================================================
 *  SPACING
 *  Định nghĩa các giá trị khoảng cách (margin, padding) tiêu chuẩn.
 * ============================================================================
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * ============================================================================
 *  TYPOGRAPHY
 *  Định nghĩa các kiểu chữ cho tiêu đề, văn bản, nút, v.v.
 * ============================================================================
 */

export const typography = {
  // Headings
  h1: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900' as const,
  },
  h2: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h3: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  // Body Text
  body: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  bodyBold: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
  },
};