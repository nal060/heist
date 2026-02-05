export const colors = {
  primary: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#D32F2F',
    600: '#C62828',
    700: '#B71C1C',
    800: '#8E1414',
    900: '#6D0F0F',
  },

  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
  },

  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    link: '#D32F2F',
  },

  badge: {
    popular: { bg: '#E8F5E9', text: '#2E7D32' },
    nuevo: { bg: '#E3F2FD', text: '#1565C0' },
    remaining: { bg: '#FFF8E1', text: '#F57F17' },
    soldOut: { bg: '#F5F5F5', text: '#9E9E9E' },
  },

  tabBar: {
    active: '#D32F2F',
    inactive: '#9E9E9E',
    bg: '#FFFFFF',
  },

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;
