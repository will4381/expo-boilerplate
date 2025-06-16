import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SuperwallService } from '@/utils/superwallService';
import { UserManager } from '@/utils/userManager';
import SplashView from './splashView';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'/(onboarding)/welcomeView' | '/(tabs)/mainView' | null>(null);

  const handleSplashComplete = async () => {
    try {
      // Configure Superwall with API key from environment variables
      const superwallApiKey = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY;
      if (superwallApiKey) {
        SuperwallService.shared.configure(superwallApiKey, __DEV__);
        console.log('✅ Superwall configured successfully');
      } else {
        console.warn('⚠️ Superwall API key not found in environment variables');
      }

      // Load user state while splash is completing
      await UserManager.shared.checkAuthenticationStatus();
      
      const needsOnboarding = !UserManager.shared.isOnboardingCompleted;
      
      // Determine initial route
      const route: '/(onboarding)/welcomeView' | '/(tabs)/mainView' = needsOnboarding ? '/(onboarding)/welcomeView' : '/(tabs)/mainView';
      setInitialRoute(route);
      
      // Hide splash
      setShowSplash(false);
    } catch (error) {
      console.error('Error during app initialization:', error);
      // Default to onboarding if there's an error
      setInitialRoute('/(onboarding)/welcomeView');
      setShowSplash(false);
    }
  };

  // Navigate to initial route once determined (after render)
  useEffect(() => {
    if (initialRoute) {
      router.replace(initialRoute);
      // Clear the route to prevent re-navigation
      setInitialRoute(null);
    }
  }, [initialRoute]);

  // Show splash screen while fonts are loading or splash animation is playing
  if (!loaded || showSplash) {
    return (
      <SplashView 
        onAnimationComplete={handleSplashComplete}
        appName="Expo Boilerplate"
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
