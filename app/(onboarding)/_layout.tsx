/*
 * ONBOARDING LAYOUT - Navigation Stack
 * 
 * This layout manages the onboarding flow navigation using Expo Router.
 * Provides a clean, focused experience for users completing onboarding.
 * 
 * Features:
 * - Stack navigation between onboarding screens
 * - Safe area handling for iOS
 * - Clean navigation without headers
 * - Proper gesture handling
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe back - onboarding should be forward-only
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="welcomeView" 
          options={{
            title: 'Welcome',
          }}
        />
        <Stack.Screen 
          name="paywallView" 
          options={{
            title: 'Premium Features',
          }}
        />
        <Stack.Screen 
          name="questionView" 
          options={{
            title: 'Quick Setup',
          }}
        />
      </Stack>
    </>
  );
}
