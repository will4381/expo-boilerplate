 /*
 * BUTTON STYLES - EXPO BOILERPLATE THEME SYSTEM
 * 
 * This document outlines all the available button styles in the Expo Boilerplate project.
 * Matches the Swift boilerplate button system with comprehensive options.
 * 
 * Available Button Styles:
 * 
 * Primary Styles:
 * - primary: Main action buttons with accent color background
 * - secondary: Outline style for secondary actions
 * - large: Bigger buttons for important actions
 * - small: Compact buttons for tight spaces
 * 
 * Icon Buttons:
 * - icon: Standard 44pt circular button (perfect touch target)
 * - iconSmall: 32pt for compact areas
 * - iconLarge: 56pt for prominent actions
 * 
 * Specialized Styles:
 * - destructive: Red buttons for delete/warning actions
 * - ghost: Minimal style with no background
 * 
 * Features:
 * - Scale animations on press (0.95x for regular, 0.9x for icons)
 * - Smooth easeInOut transitions
 * - Uses theme color and font systems
 * - Consistent padding and corner radius
 * - Accessibility-compliant touch targets
 * 
 * Usage Examples:
 * <TouchableOpacity style={ButtonStyles.primary}>
 *   <Text style={ButtonStyles.primaryText}>Save Changes</Text>
 * </TouchableOpacity>
 * 
 * <TouchableOpacity style={ButtonStyles.iconSmall}>
 *   <Ionicons name="heart-outline" size={20} color="#007AFF" />
 * </TouchableOpacity>
 */

import { ViewStyle, TextStyle } from 'react-native';
import { Colors } from './Colors';
import { Fonts } from './Fonts';

// Base button dimensions
const BUTTON_HEIGHT = 50;
const BUTTON_HEIGHT_LARGE = 56;
const BUTTON_HEIGHT_SMALL = 40;
const ICON_BUTTON_SIZE = 44;
const ICON_BUTTON_SIZE_SMALL = 32;
const ICON_BUTTON_SIZE_LARGE = 56;
const BORDER_RADIUS = 12;
const ICON_BORDER_RADIUS = 22; // Half of icon button size for perfect circle

export const ButtonStyles = {
  // MARK: - Primary Button Styles
  primary: {
    height: BUTTON_HEIGHT,
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  } as ViewStyle,

  primaryText: {
    ...Fonts.buttonMedium,
    color: '#FFFFFF',
  } as TextStyle,

  primaryDark: {
    height: BUTTON_HEIGHT,
    backgroundColor: Colors.dark.primary,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.dark.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  primaryTextDark: {
    ...Fonts.buttonMedium,
    color: '#FFFFFF',
  } as TextStyle,

  // MARK: - Secondary Button Styles
  secondary: {
    height: BUTTON_HEIGHT,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,

  secondaryText: {
    ...Fonts.buttonMedium,
    color: Colors.light.primary,
  } as TextStyle,

  secondaryDark: {
    height: BUTTON_HEIGHT,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,

  secondaryTextDark: {
    ...Fonts.buttonMedium,
    color: Colors.dark.primary,
  } as TextStyle,

  // MARK: - Large Button Styles
  large: {
    height: BUTTON_HEIGHT_LARGE,
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  largeText: {
    ...Fonts.buttonLarge,
    color: '#FFFFFF',
  } as TextStyle,

  largeDark: {
    height: BUTTON_HEIGHT_LARGE,
    backgroundColor: Colors.dark.primary,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    shadowColor: Colors.dark.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  largeTextDark: {
    ...Fonts.buttonLarge,
    color: '#FFFFFF',
  } as TextStyle,

  // MARK: - Small Button Styles
  small: {
    height: BUTTON_HEIGHT_SMALL,
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS - 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  } as ViewStyle,

  smallText: {
    ...Fonts.buttonSmall,
    color: '#FFFFFF',
  } as TextStyle,

  smallDark: {
    height: BUTTON_HEIGHT_SMALL,
    backgroundColor: Colors.dark.primary,
    borderRadius: BORDER_RADIUS - 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  } as ViewStyle,

  smallTextDark: {
    ...Fonts.buttonSmall,
    color: '#FFFFFF',
  } as TextStyle,

  // MARK: - Icon Button Styles
  icon: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BORDER_RADIUS,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  iconDark: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BORDER_RADIUS,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  iconSmall: {
    width: ICON_BUTTON_SIZE_SMALL,
    height: ICON_BUTTON_SIZE_SMALL,
    borderRadius: ICON_BUTTON_SIZE_SMALL / 2,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  iconSmallDark: {
    width: ICON_BUTTON_SIZE_SMALL,
    height: ICON_BUTTON_SIZE_SMALL,
    borderRadius: ICON_BUTTON_SIZE_SMALL / 2,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  iconLarge: {
    width: ICON_BUTTON_SIZE_LARGE,
    height: ICON_BUTTON_SIZE_LARGE,
    borderRadius: ICON_BUTTON_SIZE_LARGE / 2,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  iconLargeDark: {
    width: ICON_BUTTON_SIZE_LARGE,
    height: ICON_BUTTON_SIZE_LARGE,
    borderRadius: ICON_BUTTON_SIZE_LARGE / 2,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  // MARK: - Destructive Button Styles
  destructive: {
    height: BUTTON_HEIGHT,
    backgroundColor: Colors.light.error,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  destructiveText: {
    ...Fonts.buttonMedium,
    color: '#FFFFFF',
  } as TextStyle,

  destructiveDark: {
    height: BUTTON_HEIGHT,
    backgroundColor: Colors.dark.error,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.dark.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  destructiveTextDark: {
    ...Fonts.buttonMedium,
    color: '#FFFFFF',
  } as TextStyle,

  // MARK: - Ghost Button Styles
  ghost: {
    height: BUTTON_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,

  ghostText: {
    ...Fonts.buttonMedium,
    color: Colors.light.textSecondary,
  } as TextStyle,

  ghostDark: {
    height: BUTTON_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,

  ghostTextDark: {
    ...Fonts.buttonMedium,
    color: Colors.dark.textSecondary,
  } as TextStyle,
};

// Helper function to get button styles based on color scheme
export const getButtonStyles = (colorScheme: 'light' | 'dark' | null | undefined) => {
  const isDark = colorScheme === 'dark';
  
  return {
    primary: isDark ? ButtonStyles.primaryDark : ButtonStyles.primary,
    primaryText: isDark ? ButtonStyles.primaryTextDark : ButtonStyles.primaryText,
    secondary: isDark ? ButtonStyles.secondaryDark : ButtonStyles.secondary,
    secondaryText: isDark ? ButtonStyles.secondaryTextDark : ButtonStyles.secondaryText,
    large: isDark ? ButtonStyles.largeDark : ButtonStyles.large,
    largeText: isDark ? ButtonStyles.largeTextDark : ButtonStyles.largeText,
    small: isDark ? ButtonStyles.smallDark : ButtonStyles.small,
    smallText: isDark ? ButtonStyles.smallTextDark : ButtonStyles.smallText,
    icon: isDark ? ButtonStyles.iconDark : ButtonStyles.icon,
    iconSmall: isDark ? ButtonStyles.iconSmallDark : ButtonStyles.iconSmall,
    iconLarge: isDark ? ButtonStyles.iconLargeDark : ButtonStyles.iconLarge,
    destructive: isDark ? ButtonStyles.destructiveDark : ButtonStyles.destructive,
    destructiveText: isDark ? ButtonStyles.destructiveTextDark : ButtonStyles.destructiveText,
    ghost: isDark ? ButtonStyles.ghostDark : ButtonStyles.ghost,
    ghostText: isDark ? ButtonStyles.ghostTextDark : ButtonStyles.ghostText,
  };
};

// Export button categories for easier imports
export const PrimaryButtons = {
  style: ButtonStyles.primary,
  text: ButtonStyles.primaryText,
  styleDark: ButtonStyles.primaryDark,
  textDark: ButtonStyles.primaryTextDark,
};

export const IconButtons = {
  style: ButtonStyles.icon,
  small: ButtonStyles.iconSmall,
  large: ButtonStyles.iconLarge,
  styleDark: ButtonStyles.iconDark,
  smallDark: ButtonStyles.iconSmallDark,
  largeDark: ButtonStyles.iconLargeDark,
};