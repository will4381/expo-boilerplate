/*
 * WELCOME VIEW - First screen in the onboarding flow
 * 
 * Minimal placeholder view to welcome users to the app.
 * This is the entry point of the onboarding experience.
 * 
 * Features:
 * - App introduction with icon and messaging
 * - Safe area handling for iOS
 * - Theme integration with consistent styling
 * - Smooth navigation to next step
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getButtonStyles } from '@/constants/ButtonStyles';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WelcomeView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fonts = Fonts;
  const buttonStyles = getButtonStyles(colorScheme);
  
  const handleContinue = async () => {
    // Add haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to paywall view
    router.push('/(onboarding)/paywallView');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.content}>
        
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name="sparkles" 
            size={80} 
            color={colors.primary}
          />
        </View>

        {/* Welcome Message */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }, fonts.displayLarge]}>
            Welcome to Your App
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }, fonts.bodyLarge]}>
            This is your welcome screen placeholder
          </Text>
        </View>

        {/* Button Area */}
        <View style={styles.buttonArea}>
          <TouchableOpacity 
            style={[styles.buttonContainer, buttonStyles.primary]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }, fonts.buttonLarge]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Replace with your background color
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000', // Replace with your text primary color
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666', // Replace with your text secondary color
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonArea: {
    width: '100%',
    paddingBottom: 40,
  },
  buttonContainer: {
    backgroundColor: '#007AFF', // Replace with your primary color
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
