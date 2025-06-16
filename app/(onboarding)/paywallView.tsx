/*
 * PAYWALL VIEW - SUPERWALL INTEGRATION
 * 
 * This view integrates with Superwall to show actual paywalls.
 * 
 * Features:
 * - Real Superwall paywall integration
 * - Placement registration and handling
 * - Loading states and error handling
 * - Proper navigation flow based on paywall results
 * 
 * Configuration:
 * 1. Set up your Superwall dashboard and configure paywalls
 * 2. Create a placement named 'onboarding_paywall' (or customize below)
 * 3. Design your paywall template in the Superwall dashboard
 * 4. Configure audience targeting and pricing
 */

import { getButtonStyles } from '@/constants/ButtonStyles';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PlacementResult, SuperwallService } from '@/utils/superwallService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaywallView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fonts = Fonts;
  const buttonStyles = getButtonStyles(colorScheme);
  
  const [isLoading, setIsLoading] = useState(true);
  const [paywallResult, setPaywallResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The placement name - this should match what you configure in Superwall dashboard
  const PLACEMENT_NAME = 'onboarding_paywall';

  useEffect(() => {
    registerPaywallPlacement();
  }, []);

  const registerPaywallPlacement = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Register the placement with Superwall
      const result = await SuperwallService.shared.register(PLACEMENT_NAME, {
        source: 'onboarding',
        step: 'paywall_view',
        user_journey: 'first_launch'
      });

      setPaywallResult(result);

      // Handle the result
      switch (result) {
        case PlacementResult.PAYWALL_PRESENTED:
          console.log('✅ Superwall paywall was presented');
          // The paywall will show automatically, we just wait for user action
          break;
          
        case PlacementResult.PAYWALL_NOT_PRESENTED:
          console.log('ℹ️ Superwall paywall not presented (user may not be eligible)');
          // Continue to next step since no paywall was shown
          setTimeout(() => {
            router.push('/(onboarding)/questionView');
          }, 1000);
          break;
          
        case PlacementResult.USER_ALREADY_SUBSCRIBED:
          console.log('💰 User is already subscribed');
          // Skip paywall and continue
          setTimeout(() => {
            router.push('/(onboarding)/questionView');
          }, 1000);
          break;
          
        case PlacementResult.PLACEMENT_NOT_FOUND:
          console.log('❌ Placement not found in Superwall dashboard');
          setError('Paywall configuration not found. Please check your Superwall dashboard.');
          break;
          
        case PlacementResult.ERROR:
          console.log('❌ Error presenting paywall');
          setError('Unable to load paywall. Please try again.');
          break;
      }
    } catch (error) {
      console.error('Error registering paywall placement:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/questionView');
  };

  const handleRetry = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    registerPaywallPlacement();
  };

  // Listen for Superwall events
  useEffect(() => {
    const handlePaywallEvent = (eventData: any) => {
      console.log('Superwall event:', eventData);
      
      // Handle subscription success
      if (eventData.type === 'subscriptionStart' || eventData.type === 'transactionComplete') {
        console.log('🎉 User subscribed successfully!');
        // Navigate to next step after successful subscription
        router.push('/(onboarding)/questionView');
      }
      
      // Handle paywall dismissed/closed
      if (eventData.type === 'paywallClose' || eventData.type === 'paywallDecline') {
        console.log('Paywall was dismissed');
        // User can still continue to next step
      }
    };

    // Add event listener
    SuperwallService.shared.on('placementRegistered', handlePaywallEvent);
    SuperwallService.shared.on('paywallPresented', handlePaywallEvent);
    SuperwallService.shared.on('subscriptionStatusChanged', handlePaywallEvent);

    return () => {
      // Clean up event listeners
      SuperwallService.shared.off('placementRegistered', handlePaywallEvent);
      SuperwallService.shared.off('paywallPresented', handlePaywallEvent);
      SuperwallService.shared.off('subscriptionStatusChanged', handlePaywallEvent);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }, fonts.bodyLarge]}>
            Loading paywall...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="alert-circle" 
              size={80} 
              color={colors.error || '#FF3B30'}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }, fonts.displayMedium]}>
              Oops!
            </Text>
            
            <Text style={[styles.subtitle, { color: colors.textSecondary }, fonts.bodyLarge]}>
              {error}
            </Text>
          </View>

          <View style={styles.buttonArea}>
            <TouchableOpacity 
              style={[styles.primaryButton, buttonStyles.primary]}
              onPress={handleRetry}
            >
              <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }, fonts.buttonLarge]}>
                Try Again
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

  // Success state - when paywall is not shown but placement was successful
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="checkmark-circle" 
            size={80} 
            color={colors.success || '#34C759'}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }, fonts.displayMedium]}>
            Ready to Continue
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }, fonts.bodyLarge]}>
            {paywallResult === PlacementResult.USER_ALREADY_SUBSCRIBED 
              ? "You're already subscribed!" 
              : "Let's keep setting up your account"}
          </Text>
        </View>

        <View style={styles.buttonArea}>
          <TouchableOpacity 
            style={[styles.primaryButton, buttonStyles.primary]}
            onPress={handleSkip}
          >
            <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }, fonts.buttonLarge]}>
              Continue
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
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
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
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  buttonArea: {
    width: '100%',
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
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
    fontSize: 16,
    fontWeight: '500',
  },
});
