/**
 * BustSystem Theme Configuration
 * A clean, professional color palette for school transportation management
 */

import { Platform } from 'react-native';

// Primary brand colors
const primaryBlue = '#1E88E5';
const primaryBlueDark = '#1565C0';
const primaryBlueLight = '#42A5F5';

// Status colors
const successGreen = '#43A047';
const warningOrange = '#FB8C00';
const errorRed = '#E53935';
const infoBlue = '#039BE5';

// Neutral colors
const white = '#FFFFFF';
const black = '#000000';
const gray50 = '#FAFAFA';
const gray100 = '#F5F5F5';
const gray200 = '#EEEEEE';
const gray300 = '#E0E0E0';
const gray400 = '#BDBDBD';
const gray500 = '#9E9E9E';
const gray600 = '#757575';
const gray700 = '#616161';
const gray800 = '#424242';
const gray900 = '#212121';

export const Colors = {
  light: {
    // Base colors
    text: gray900,
    textSecondary: gray600,
    textMuted: gray500,
    background: white,
    backgroundSecondary: gray50,
    card: white,
    border: gray200,
    
    // Brand
    primary: primaryBlue,
    primaryDark: primaryBlueDark,
    primaryLight: primaryBlueLight,
    tint: primaryBlue,
    
    // Status
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    info: infoBlue,
    
    // Icons
    icon: gray600,
    tabIconDefault: gray400,
    tabIconSelected: primaryBlue,
    
    // Student status colors
    statusHome: gray500,
    statusPickedUp: primaryBlue,
    statusInTransit: warningOrange,
    statusAtSchool: successGreen,
    statusReturning: primaryBlue,
    statusDelivered: successGreen,
  },
  dark: {
    // Base colors
    text: gray100,
    textSecondary: gray400,
    textMuted: gray500,
    background: gray900,
    backgroundSecondary: gray800,
    card: gray800,
    border: gray700,
    
    // Brand
    primary: primaryBlueLight,
    primaryDark: primaryBlue,
    primaryLight: '#64B5F6',
    tint: primaryBlueLight,
    
    // Status
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#29B6F6',
    
    // Icons
    icon: gray400,
    tabIconDefault: gray500,
    tabIconSelected: primaryBlueLight,
    
    // Student status colors
    statusHome: gray500,
    statusPickedUp: primaryBlueLight,
    statusInTransit: '#FFA726',
    statusAtSchool: '#66BB6A',
    statusReturning: primaryBlueLight,
    statusDelivered: '#66BB6A',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Shadow = {
  light: {
    shadowColor: black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  heavy: {
    shadowColor: black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Helper to get status color based on student status
export const getStatusColor = (status: string, isDark: boolean = false): string => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  switch (status) {
    case 'home':
      return colors.statusHome;
    case 'picked_up':
      return colors.statusPickedUp;
    case 'in_transit':
      return colors.statusInTransit;
    case 'at_school':
      return colors.statusAtSchool;
    case 'returning':
      return colors.statusReturning;
    case 'delivered':
      return colors.statusDelivered;
    default:
      return colors.textMuted;
  }
};

// Helper to get human-readable status label
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'home':
      return 'At Home';
    case 'picked_up':
      return 'Picked Up';
    case 'in_transit':
      return 'In Transit';
    case 'at_school':
      return 'At School';
    case 'returning':
      return 'Returning Home';
    case 'delivered':
      return 'Delivered';
    default:
      return status;
  }
};
