// Palette alignée avec frontend/tailwind.config.js
// primary.500 = #00A550 ; secondary = palette slate
export const colors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#00A550',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Tokens sémantiques utiles
  bgBase: '#f8fafc', // secondary.50
  textBase: '#1e293b', // secondary.800
  white: '#ffffff',
  danger: '#dc2626',
  warning: '#f59e0b',
  success: '#10b981',
};

export type AppColors = typeof colors;

