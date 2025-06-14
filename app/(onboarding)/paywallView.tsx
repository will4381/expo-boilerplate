/*
 * PAYWALL VIEW - SUPERWALL PLACEHOLDER
 * 
 * This is a placeholder for where your Superwall paywall will be displayed.
 * 
 * Features:
 * - Placeholder for Superwall integration
 * - Continue and skip options for user flow
 * - Safe area handling for iOS
 * - Theme integration with consistent styling
 * 
 * To Implement Real Paywall:
 * 1. Set up your Superwall dashboard and configure paywalls
 * 2. Replace this placeholder with Superwall's PaywallView
 * 3. Handle subscription success/failure callbacks
 * 4. Add analytics tracking for conversion optimization
 * 
 * Superwall Integration:
 * - Use SuperwallService.shared.register() to trigger paywalls
 * - Configure your paywall templates in the Superwall dashboard
 * - Handle purchase events and subscription status
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

export default function PaywallView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fonts = Fonts;
  const buttonStyles = getButtonStyles(colorScheme);
  
  const handleContinue = async () => {
    // Add haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In a real implementation, this would handle subscription success
    // For now, just navigate to next step
    router.push('/(onboarding)/questionView');
  };

  const handleSkip = async () => {
    // Add haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to next step
    router.push('/(onboarding)/questionView');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.content}>
        
        {/* Superwall Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name="diamond" 
            size={80} 
            color={colors.primary}
          />
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }, fonts.displayMedium]}>
            Superwall Paywall
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }, fonts.bodyLarge]}>
            This is where your Superwall paywall will show
          </Text>
          
          <Text style={[styles.description, { color: colors.textSecondary }, fonts.captionLarge]}>
            Replace this placeholder with your actual Superwall integration
          </Text>
        </View>

        {/* Button Area */}
        <View style={styles.buttonArea}>
          <TouchableOpacity 
            style={[styles.primaryButton, buttonStyles.primary]}
            onPress={handleContinue}
          >
            <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }, fonts.buttonLarge]}>
              Continue with Premium
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, buttonStyles.secondary]}
            onPress={handleSkip}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }, fonts.buttonMedium]}>
              Skip for Now
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
    fontSize: 32,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    color: '#666666', // Replace with your text secondary color
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonArea: {
    width: '100%',
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF', // Replace with your primary color
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666666', // Replace with your text secondary color
    fontSize: 16,
    fontWeight: '500',
  },
});
