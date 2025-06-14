/*
 * SETTINGS VIEW - SIMPLIFIED APP PREFERENCES
 * 
 * This view provides users with essential settings and configuration options.
 * 
 * Features:
 * - App preferences (notifications)
 * - Support options (contact, rate app)
 * - Legal information (terms, privacy)
 * - About section (app version, build info)
 * - Developer tools (DEBUG only)
 * - User management (sign out)
 * 
 * Current Sections:
 * 1. App Preferences - Notifications
 * 2. Support - Contact founder and rate app
 * 3. Legal - Terms and privacy policy
 * 4. About - App version information
 * 5. Developer (DEBUG only) - Development and testing tools
 * 
 * To Customize:
 * 1. Add new sections by creating new SettingRow components
 * 2. Modify existing settings to match your app's needs
 * 3. Update contact information and URLs
 * 4. Update the developer section with your testing needs
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Linking,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { UserManager } from '../../utils/userManager';
import { SuperwallService } from '../../utils/superwallService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Setting row component
const SettingRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
  colors?: any;
}> = ({ icon, title, subtitle, onPress, destructive = false, colors }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <View style={styles.settingRowContent}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={destructive ? (colors?.error || '#FF3B30') : (colors?.accentColor || '#007AFF')} 
        style={styles.settingIcon} 
      />
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: destructive ? (colors?.error || '#FF3B30') : (colors?.textPrimary || '#000000') }]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors?.textSecondary || '#8E8E93' }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={16} 
        color={colors?.textSecondary || '#C7C7CC'} 
        style={styles.chevron} 
      />
    </View>
  </TouchableOpacity>
);

// About row component
const AboutRow: React.FC<{
  title: string;
  value: string;
  colors?: any;
}> = ({ title, value, colors }) => (
  <View style={styles.aboutRow}>
    <Text style={[styles.aboutTitle, { color: colors?.textPrimary || '#000000' }]}>{title}</Text>
    <Text style={[styles.aboutValue, { color: colors?.textSecondary || '#8E8E93' }]}>{value}</Text>
  </View>
);

// Section header component
const SectionHeader: React.FC<{ title: string; colors: any }> = ({ title, colors }) => (
  <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>
);

// Developer section component (only in development)
const DeveloperSection: React.FC<{ colors?: any }> = ({ colors }) => {
  const handleStartOnboarding = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to onboarding flow
    router.push('/(onboarding)/welcomeView');
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will reset all app data including user preferences, onboarding status, and cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await resetAllAppData();
          }
        }
      ]
    );
  };

  const resetAllAppData = async () => {
    try {
      // Reset UserManager
      await UserManager.shared.resetAllUserData();
      
      // Reset Superwall
      SuperwallService.shared.resetUserData();
      
      console.log('🔄 All app data reset from developer tools');
      
      Alert.alert('Success', 'All app data has been reset.');
    } catch (error) {
      console.error('Error resetting app data:', error);
      Alert.alert('Error', 'Failed to reset app data.');
    }
  };

  const isSimulator = () => {
    return Platform.OS === 'ios' && !Constants.isDevice;
  };

  return (
    <View style={styles.developerSection}>
      <SettingRow
        icon="refresh-circle"
        title="Start Onboarding"
        subtitle="Reset and show onboarding flow"
        onPress={handleStartOnboarding}
        colors={colors}
      />
      
      <View style={[styles.divider, { backgroundColor: colors?.divider || '#C6C6C8' }]} />
      
      <SettingRow
        icon="trash"
        title="Reset All Data"
        subtitle="Clear all app data and preferences"
        onPress={handleResetAllData}
        destructive
        colors={colors}
      />
      
      <View style={[styles.divider, { backgroundColor: colors?.divider || '#C6C6C8' }]} />
      
      {/* Debug Information */}
      <View style={styles.debugInfo}>
        <Text style={[styles.debugTitle, { color: colors?.textPrimary || '#000000' }]}>Debug Information</Text>
        
        <AboutRow title="User Manager" value={UserManager.shared.isSignedIn ? 'Signed In' : 'Not Signed In'} colors={colors} />
        <AboutRow title="Onboarding" value={UserManager.shared.isOnboardingCompleted ? 'Completed' : 'Not Completed'} colors={colors} />
        <AboutRow title="Build Config" value={__DEV__ ? 'DEBUG' : 'RELEASE'} colors={colors} />
        <AboutRow title="Simulator" value={isSimulator() ? 'Yes' : 'No'} colors={colors} />
      </View>
    </View>
  );
};

export default function SettingsView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Get initial state
    setIsSignedIn(UserManager.shared.isSignedIn);

    // Listen for user state changes
    const handleUserSignedIn = () => setIsSignedIn(true);
    const handleUserSignedOut = () => setIsSignedIn(false);

    UserManager.shared.on('userSignedIn', handleUserSignedIn);
    UserManager.shared.on('userSignedOut', handleUserSignedOut);

    return () => {
      UserManager.shared.off('userSignedIn', handleUserSignedIn);
      UserManager.shared.off('userSignedOut', handleUserSignedOut);
    };
  }, []);

  // Handler functions
  const handleNotifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openSettings();
  };

  const handleContactFounder = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const email = 'founder@yourapp.com'; // Replace with your email
    const subject = 'App Feedback';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open email client.');
    }
  };

  const handleRateApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const appStoreId = '123456789'; // Replace with your App Store ID
    const url = `https://apps.apple.com/app/id${appStoreId}?action=write-review`;
    
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open App Store.');
    }
  };

  const handleTerms = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = 'https://yourapp.com/terms'; // Replace with your terms URL
    
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open terms of service.');
    }
  };

  const handlePrivacy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = 'https://yourapp.com/privacy'; // Replace with your privacy URL
    
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open privacy policy.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await UserManager.shared.signOut();
          }
        }
      ]
    );
  };

  const getAppVersion = (): string => {
    return Constants.expoConfig?.version || '1.0.0';
  };

  const getBuildNumber = (): string => {
    return Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || '1';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* App Preferences Section */}
        <SectionHeader title="App Preferences" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.backgroundPrimary }]}>
          <SettingRow
            icon="notifications"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={handleNotifications}
            colors={colors}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.backgroundPrimary }]}>
          <SettingRow
            icon="mail"
            title="Contact Founder"
            subtitle="Get in touch with the founder"
            onPress={handleContactFounder}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="star"
            title="Rate App"
            subtitle="Leave a review on the App Store"
            onPress={handleRateApp}
            colors={colors}
          />
        </View>

        {/* Legal Section */}
        <SectionHeader title="Legal" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.backgroundPrimary }]}>
          <SettingRow
            icon="document-text"
            title="Terms of Service"
            subtitle="Read our terms of service"
            onPress={handleTerms}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={handlePrivacy}
            colors={colors}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.backgroundPrimary }]}>
          <AboutRow title="Version" value={getAppVersion()} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <AboutRow title="Build" value={getBuildNumber()} colors={colors} />
        </View>

        {/* Developer Section (DEBUG only) */}
        {__DEV__ && (
          <>
            <SectionHeader title="Developer Tools" colors={colors} />
            <View style={[styles.section, { backgroundColor: colors.backgroundPrimary }]}>
              <DeveloperSection colors={colors} />
            </View>
            <Text style={[styles.devFooter, { color: colors.textSecondary }]}>
              This section is only visible in development builds and will not appear in the App Store version.
            </Text>
          </>
        )}

        {/* Sign Out Section */}
        {isSignedIn && (
          <>
            <SectionHeader title="" colors={colors} />
            <View style={[styles.section, { backgroundColor: colors.backgroundPrimary }]}>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D70',
    textTransform: 'uppercase',
    marginTop: 32,
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingRow: {
    backgroundColor: '#FFFFFF',
  },
  settingRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  settingIcon: {
    width: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  chevron: {
    marginLeft: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 56,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  aboutValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  developerSection: {
    // No extra styling needed
  },
  debugInfo: {
    paddingTop: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  signOutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FF3B30',
  },
  devFooter: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 32,
  },
});
