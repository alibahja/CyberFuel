/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    // Primary colors
    primary: '#8A2BE2',      // Purple accent
    primaryLight: '#A855F7', // Lighter purple
    secondary: '#00D4FF',    // Cyan/Blue
    accent: '#3B82F6',       // Additional blue

    // Backgrounds
    background: '#FFFFFF',   // White background
    surface: '#F5F5F5',      // Light surface
    surfaceDark: '#EBEBEB',  // Slightly darker surface

    // Text colors
    text: '#000000',         // Primary text (black)
    textSecondary: '#666666', // Secondary text (gray)
    textTertiary: '#999999', // Tertiary text (light gray)
    textInverse: '#FFFFFF',  // Inverse text (white on dark)

    // UI Elements
    border: '#E0E0E0',       // Border color
    borderLight: '#F0F0F0',  // Light border
    divider: '#D0D0D0',      // Divider color
    shadow: 'rgba(0,0,0,0.1)', // Shadow

    // Status colors
    success: '#10B981',      // Green
    error: '#EF4444',        // Red
    warning: '#F59E0B',      // Orange
    info: '#3B82F6',         // Blue

    // Component specific
    buttonText: '#000000',
    inputBackground: '#FFFFFF',
    inputBorder: '#E0E0E0',
    chipBackground: '#F5F5F5',
    chipBackgroundSelected: 'rgba(138, 43, 226, 0.1)',
    chipBorder: '#E0E0E0',
    chipBorderSelected: '#8A2BE2',

    tint: tintColorLight,
    icon: '#666666',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Primary colors
    primary: '#8A2BE2',      // Purple accent
    primaryLight: '#A855F7', // Lighter purple
    secondary: '#00D4FF',    // Cyan/Blue
    accent: '#60A5FA',       // Additional blue

    // Backgrounds
    background: '#050508',   // Almost black
    surface: '#0F0F1E',      // Dark navy
    surfaceDark: '#0A0A12',  // Darker navy

    // Text colors
    text: '#FFFFFF',         // Primary text (white)
    textSecondary: '#A0A0A0', // Secondary text (gray)
    textTertiary: '#666666', // Tertiary text (darker gray)
    textInverse: '#000000',  // Inverse text (black on light)

    // UI Elements
    border: '#1A1A2E',       // Border color
    borderLight: '#2A2A3E',  // Light border
    divider: '#1A1A2E',      // Divider color
    shadow: 'rgba(0,0,0,0.4)', // Shadow

    // Status colors
    success: '#10B981',      // Green
    error: '#EF4444',        // Red
    warning: '#F59E0B',      // Orange
    info: '#60A5FA',         // Blue

    // Component specific
    buttonText: '#000000',
    inputBackground: '#0F0F1E',
    inputBorder: '#1A1A2E',
    chipBackground: '#0F0F1E',
    chipBackgroundSelected: 'rgba(0, 212, 255, 0.1)',
    chipBorder: '#1A1A2E',
    chipBorderSelected: '#00D4FF',

    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
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
