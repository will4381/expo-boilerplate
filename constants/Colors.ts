/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/*
 * COLORS - EXPO BOILERPLATE THEME SYSTEM
 * 
 * This document outlines all the available theme colors in the Expo Boilerplate project.
 * Colors support both light and dark mode automatically.
 * 
 * How It Works:
 * - Each color has semantic meaning rather than literal color names
 * - Supports both light and dark mode variations
 * - Uses consistent naming convention with Swift boilerplate
 * - Easy to customize and maintain
 * 
 * Usage Examples:
 * Text styling:
 * <Text style={{ color: Colors.light.textPrimary }}>Welcome!</Text>
 * 
 * Background styling:
 * <View style={{ backgroundColor: Colors.light.backgroundPrimary }}>
 * 
 * With useColorScheme:
 * const colorScheme = useColorScheme();
 * <Text style={{ color: Colors[colorScheme ?? 'light'].textPrimary }}>
 */

const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    // Accent Colors
    accentColor: '#007AFF',
    
    // Background Colors
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',
    
    // UI Elements
    border: '#C6C6C8',
    divider: '#E5E5E7',
    shadow: '#000000',
    
    // Status Colors
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    
    // Primary Colors
    primary: '#007AFF',
    primaryVariant: '#0051D0',
    
    // Text Colors
    textPrimary: '#000000',
    textSecondary: '#666666',
    
    // Legacy support for existing components
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Accent Colors
    accentColor: '#0A84FF',
    
    // Background Colors
    backgroundPrimary: '#000000',
    backgroundSecondary: '#1C1C1E',
    
    // UI Elements
    border: '#38383A',
    divider: '#2C2C2E',
    shadow: '#000000',
    
    // Status Colors
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
    
    // Primary Colors
    primary: '#0A84FF',
    primaryVariant: '#409CFF',
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#AEAEB2',
    
    // Legacy support for existing components
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Helper function to get colors based on color scheme
export const getColors = (colorScheme: 'light' | 'dark' | null | undefined) => {
  return Colors[colorScheme ?? 'light'];
};

// Export individual color categories for easier imports
export const LightColors = Colors.light;
export const DarkColors = Colors.dark;
