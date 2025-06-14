/*
 * SPLASH VIEW - APP LOADING SCREEN
 * 
 * This is the app splash screen shown during initialization and loading.
 * Matches the Swift boilerplate splash screen with animations and branding.
 * 
 * Features:
 * - Animated app icon with scale and opacity effects
 * - App name display
 * - Loading indicator
 * - Spring entrance animations
 * - Subtle pulse animation
 * - Theme system integration
 * 
 * Usage:
 * - Shown during app startup while loading resources
 * - Can be used during authentication checks
 * - Provides smooth transition to main app
 * 
 * Customization:
 * 1. Replace app icon with your actual app icon
 * 2. Update app name text
 * 3. Modify animation timing and effects
 * 4. Customize colors and styling
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SplashViewProps {
  onAnimationComplete?: () => void;
  appName?: string;
}

export default function SplashView({ 
  onAnimationComplete,
  appName = "Expo Boilerplate"
}: SplashViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAnimations = () => {
    // Entrance animation - scale and opacity
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1.0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start pulse animation after entrance
      startPulseAnimation();
      
      // Show splash for a proper duration (2 seconds total)
      setTimeout(() => {
        onAnimationComplete?.();
      }, 2000);
    });
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

    return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.content}>
        
        {/* App Icon with Animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) }
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* App Icon - Replace with your actual app icon */}
          <View style={[styles.iconBackground, { backgroundColor: colors.primary }]}>
            <Ionicons 
              name="apps" 
              size={80} 
              color="#FFFFFF" 
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            {appName}
          </Text>
        </Animated.View>

        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10, // Android shadow
  },
  textContainer: {
    marginBottom: 20,
  },
  appName: {
    ...Fonts.titleMedium,
    textAlign: 'center',
  },
}); 