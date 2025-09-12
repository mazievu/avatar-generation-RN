import { TextStyle } from 'react-native';

/**
 * ============================================================================
 *  COLOR PALETTE
 *  Định nghĩa bảng màu trung tâm cho ứng dụng.
 * ============================================================================
 */
export const colors = {
  // Primary & Accent
  primary: '#60a5fa', // blue-400
  primaryDark: '#3b82f6', // blue-500
  accent: '#facc15', // yellow-400
  accentDark: '#f59e0b', // amber-500
  
  // Neutral (Grays/Slates)
  // Tên màu được đặt theo độ sáng, 900 là tối nhất, 50 là sáng nhất
  neutral900: '#1e293b', // slate-800 (Dùng cho tiêu đề chính)
  neutral800: '#334155', // slate-700 (Dùng cho văn bản đậm)
  neutral700: '#475569', // slate-600 (Dùng cho văn bản thường, độ tương phản tốt)
  neutral600: '#64748b', // slate-500 (Dùng cho văn bản phụ, ghi chú)
  neutral300: '#cbd5e1', // slate-300 (Dùng cho đường viền, nền vô hiệu hóa)
  neutral200: '#e2e8f0', // slate-200 (Dùng cho đường viền, nền)
  neutral100: '#f1f5f9', // slate-100 (Dùng cho nền nút, nền phần tử)
  neutral50: '#f8fafc',  // slate-50  (Dùng cho nền trang)

  // Semantic Colors (Màu theo ngữ nghĩa)
  success: '#22c55e',      // green-500
  successDark: '#16a34a',  // green-600
  error: '#ef4444',        // red-500
  errorDark: '#dc2626',    // red-600
  warning: '#f59e0b',      // amber-500

  // Text Colors
  textPrimary: '#1e293b',    // slate-800
  textSecondary: '#475569', // slate-600
  textDisabled: '#94a3b8',   // slate-400
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