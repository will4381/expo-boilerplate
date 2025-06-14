/*
 * FONTS - EXPO BOILERPLATE THEME SYSTEM
 * 
 * This document outlines all the available theme fonts in the Expo Boilerplate project.
 * Matches the Swift boilerplate font system with comprehensive hierarchy.
 * 
 * Available Font Categories:
 * 
 * Display Fonts (36-28pt) - Large titles
 * Title Fonts (24-20pt) - Section headers
 * Headline Fonts (18-16pt) - Subsection headers
 * Body Fonts (17-15pt) - Main content
 * Label Fonts (14-12pt) - Form labels and UI
 * Caption Fonts (12-10pt) - Supplementary info
 * Button Fonts (18-14pt) - Interactive elements
 * Specialized Fonts
 * Monospaced Fonts (16-12pt) - Code and numbers
 * Rounded Fonts (18-14pt) - Friendly UI
 * 
 * Usage Examples:
 * <Text style={Fonts.displayLarge}>Welcome</Text>
 * <Text style={Fonts.bodyMedium}>Body content</Text>
 * <Text style={[Fonts.titleMedium, { color: Colors.light.textPrimary }]}>Section Title</Text>
 */

import { Platform, TextStyle } from 'react-native';

// Font weights
export const FontWeights = {
  ultraLight: '100' as const,
  thin: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

// Base font families
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const monospaceFontFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const Fonts = {
  // MARK: - Display Fonts (36-28pt) - Large titles
  displayLarge: {
    fontFamily,
    fontSize: 36,
    fontWeight: FontWeights.bold,
    lineHeight: 44,
  } as TextStyle,
  
  displayMedium: {
    fontFamily,
    fontSize: 32,
    fontWeight: FontWeights.bold,
    lineHeight: 40,
  } as TextStyle,
  
  displaySmall: {
    fontFamily,
    fontSize: 28,
    fontWeight: FontWeights.bold,
    lineHeight: 36,
  } as TextStyle,

  // MARK: - Title Fonts (24-20pt) - Section headers
  titleLarge: {
    fontFamily,
    fontSize: 24,
    fontWeight: FontWeights.bold,
    lineHeight: 32,
  } as TextStyle,
  
  titleMedium: {
    fontFamily,
    fontSize: 22,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
  } as TextStyle,
  
  titleSmall: {
    fontFamily,
    fontSize: 20,
    fontWeight: FontWeights.semibold,
    lineHeight: 26,
  } as TextStyle,

  // MARK: - Headline Fonts (18-16pt) - Subsection headers
  headlineLarge: {
    fontFamily,
    fontSize: 18,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  } as TextStyle,
  
  headlineMedium: {
    fontFamily,
    fontSize: 17,
    fontWeight: FontWeights.semibold,
    lineHeight: 23,
  } as TextStyle,
  
  headlineSmall: {
    fontFamily,
    fontSize: 16,
    fontWeight: FontWeights.medium,
    lineHeight: 22,
  } as TextStyle,

  // MARK: - Body Fonts (17-15pt) - Main content
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    fontWeight: FontWeights.regular,
    lineHeight: 24,
  } as TextStyle,
  
  bodyMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: FontWeights.regular,
    lineHeight: 22,
  } as TextStyle,
  
  bodySmall: {
    fontFamily,
    fontSize: 15,
    fontWeight: FontWeights.regular,
    lineHeight: 21,
  } as TextStyle,

  // MARK: - Label Fonts (14-12pt) - Form labels and UI
  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  } as TextStyle,
  
  labelMedium: {
    fontFamily,
    fontSize: 13,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
  } as TextStyle,
  
  labelSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: FontWeights.medium,
    lineHeight: 16,
  } as TextStyle,

  // MARK: - Caption Fonts (12-10pt) - Supplementary info
  captionLarge: {
    fontFamily,
    fontSize: 12,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
  } as TextStyle,
  
  captionMedium: {
    fontFamily,
    fontSize: 11,
    fontWeight: FontWeights.regular,
    lineHeight: 15,
  } as TextStyle,
  
  captionSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: FontWeights.regular,
    lineHeight: 14,
  } as TextStyle,

  // MARK: - Button Fonts (18-14pt) - Interactive elements
  buttonLarge: {
    fontFamily,
    fontSize: 18,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  } as TextStyle,
  
  buttonMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: FontWeights.medium,
    lineHeight: 22,
  } as TextStyle,
  
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  } as TextStyle,

  // MARK: - Specialized Fonts
  navigationTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: FontWeights.semibold,
    lineHeight: 26,
  } as TextStyle,
  
  tabBarItem: {
    fontFamily,
    fontSize: 12,
    fontWeight: FontWeights.medium,
    lineHeight: 16,
  } as TextStyle,
  
  footnote: {
    fontFamily,
    fontSize: 11,
    fontWeight: FontWeights.regular,
    lineHeight: 15,
  } as TextStyle,
  
  overline: {
    fontFamily,
    fontSize: 10,
    fontWeight: FontWeights.medium,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  // MARK: - Monospaced Fonts (16-12pt) - Code and numbers
  codeLarge: {
    fontFamily: monospaceFontFamily,
    fontSize: 16,
    fontWeight: FontWeights.regular,
    lineHeight: 22,
  } as TextStyle,
  
  codeMedium: {
    fontFamily: monospaceFontFamily,
    fontSize: 14,
    fontWeight: FontWeights.regular,
    lineHeight: 20,
  } as TextStyle,
  
  codeSmall: {
    fontFamily: monospaceFontFamily,
    fontSize: 12,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
  } as TextStyle,

  // MARK: - Rounded Fonts (18-14pt) - Friendly UI
  roundedLarge: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontSize: 18,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  } as TextStyle,
  
  roundedMedium: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontSize: 16,
    fontWeight: FontWeights.medium,
    lineHeight: 22,
  } as TextStyle,
  
  roundedSmall: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontSize: 14,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  } as TextStyle,
};

// Export font categories for easier imports
export const DisplayFonts = {
  large: Fonts.displayLarge,
  medium: Fonts.displayMedium,
  small: Fonts.displaySmall,
};

export const TitleFonts = {
  large: Fonts.titleLarge,
  medium: Fonts.titleMedium,
  small: Fonts.titleSmall,
};

export const BodyFonts = {
  large: Fonts.bodyLarge,
  medium: Fonts.bodyMedium,
  small: Fonts.bodySmall,
};

export const ButtonFonts = {
  large: Fonts.buttonLarge,
  medium: Fonts.buttonMedium,
  small: Fonts.buttonSmall,
};
