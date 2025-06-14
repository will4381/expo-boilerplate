/*
 * MAIN VIEW - HOME TAB CONTENT
 * 
 * This is the main home view that users see after completing onboarding.
 * Currently shows placeholder content - replace with your app's main functionality.
 * 
 * Features:
 * - Clean, centered layout with placeholder content
 * - Safe area handling for iOS
 * - Integration with UserManager for state management
 * - Ready for your main app content
 * 
 * To Customize:
 * 1. Replace placeholder text with your actual app content
 * 2. Add your main app functionality (dashboard, content feed, etc.)
 * 3. Integrate with your app's data sources
 * 4. Add navigation to other screens as needed
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserManager } from '../../utils/userManager';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MainView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('User');

  useEffect(() => {
    // Get initial user state
    setIsSignedIn(UserManager.shared.isSignedIn);
    setUserDisplayName(UserManager.getUserDisplayName(UserManager.shared));

    // Listen for user state changes
    const handleUserSignedIn = () => {
      setIsSignedIn(true);
      setUserDisplayName(UserManager.getUserDisplayName(UserManager.shared));
    };

    const handleUserSignedOut = () => {
      setIsSignedIn(false);
      setUserDisplayName('User');
    };

    UserManager.shared.on('userSignedIn', handleUserSignedIn);
    UserManager.shared.on('userSignedOut', handleUserSignedOut);

    // Cleanup listeners
    return () => {
      UserManager.shared.off('userSignedIn', handleUserSignedIn);
      UserManager.shared.off('userSignedOut', handleUserSignedOut);
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
              Welcome{isSignedIn ? `, ${userDisplayName}` : ''}!
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              This is where your main app content goes
            </Text>
          </View>

          {/* Placeholder Content */}
          <View style={[styles.placeholderSection, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
              Main App Content
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Replace this placeholder with your app&apos;s main functionality:
            </Text>
            
            <View style={styles.featureList}>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Dashboard with user data</Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Content feed or main interface</Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Navigation to key features</Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Interactive components</Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Real-time updates</Text>
            </View>
          </View>

          {/* Status Information */}
          <View style={[styles.statusSection, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>App Status</Text>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>User Status:</Text>
              <Text style={[styles.statusValue, { color: isSignedIn ? colors.success : colors.warning }]}>
                {isSignedIn ? 'Signed In' : 'Not Signed In'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Onboarding:</Text>
              <Text style={[styles.statusValue, { color: UserManager.shared.isOnboardingCompleted ? colors.success : colors.warning }]}>
                {UserManager.shared.isOnboardingCompleted ? 'Completed' : 'Not Completed'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeTitle: {
    ...Fonts.displayMedium,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    ...Fonts.headlineMedium,
    textAlign: 'center',
  },
  placeholderSection: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
  },
  placeholderTitle: {
    ...Fonts.titleSmall,
    marginBottom: 12,
  },
  placeholderText: {
    ...Fonts.bodyMedium,
    marginBottom: 16,
  },
  featureList: {
    paddingLeft: 8,
  },
  featureItem: {
    ...Fonts.bodySmall,
    marginBottom: 4,
  },
  statusSection: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  statusTitle: {
    ...Fonts.headlineLarge,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    ...Fonts.bodyMedium,
  },
  statusValue: {
    ...Fonts.bodyMedium,
    fontWeight: '500',
  },
});
