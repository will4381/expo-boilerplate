/*
 * SUPERWALL SERVICE REFERENCE GUIDE
 * 
 * Features:
 * - Easy paywall presentation and management
 * - Placement registration (trigger events)
 * - User attribute tracking
 * - Analytics integration with existing API service
 * - Campaign and audience management
 * - Subscription status tracking
 * - Purchase restoration
 * - A/B testing support
 * - Revenue analytics
 * 
 * Usage Examples:
 * // Configure Superwall (one-time setup)
 * SuperwallService.shared.configure('pk_your_api_key_here');
 * 
 * // Register placement events
 * SuperwallService.shared.register('feature_gate');
 * SuperwallService.shared.register('premium_content', { content_id: '123' });
 * 
 * // Set user attributes
 * SuperwallService.shared.setUserAttributes({
 *   user_id: '12345',
 *   subscription_status: 'free',
 *   signup_date: '2024-01-01'
 * });
 * 
 * // Present paywalls manually
 * SuperwallService.shared.presentPaywall('premium_upgrade');
 * 
 * // Track custom events
 * SuperwallService.shared.trackEvent('custom_action', { action: 'button_tap' });
 * 
 * Integration:
 * - Add @superwall/react-native-superwall to your project
 * - Configure during app startup
 * - Use placement registration throughout your app
 * - Handle delegate events for analytics
 * 
 * Documentation Reference:
 * - Full Superwall documentation: https://superwall.com/docs/llms-full.txt
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SimpleEventEmitter } from './eventEmitter';

// MARK: - Superwall Error Types
export enum SuperwallErrorType {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  PRESENTATION_FAILED = 'PRESENTATION_FAILED',
  INVALID_PLACEMENT = 'INVALID_PLACEMENT',
  USER_NOT_ELIGIBLE = 'USER_NOT_ELIGIBLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class SuperwallError extends Error {
  public type: SuperwallErrorType;
  public originalError?: Error;

  constructor(type: SuperwallErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'SuperwallError';
    this.type = type;
    this.originalError = originalError;
  }

  static notConfigured(): SuperwallError {
    return new SuperwallError(SuperwallErrorType.NOT_CONFIGURED, 'Superwall not configured. Call configure() first.');
  }

  static invalidAPIKey(): SuperwallError {
    return new SuperwallError(SuperwallErrorType.INVALID_API_KEY, 'Invalid Superwall API key provided');
  }

  static presentationFailed(): SuperwallError {
    return new SuperwallError(SuperwallErrorType.PRESENTATION_FAILED, 'Failed to present paywall');
  }

  static invalidPlacement(): SuperwallError {
    return new SuperwallError(SuperwallErrorType.INVALID_PLACEMENT, 'Invalid placement name provided');
  }

  static userNotEligible(): SuperwallError {
    return new SuperwallError(SuperwallErrorType.USER_NOT_ELIGIBLE, 'User not eligible for this paywall');
  }

  static networkError(error: Error): SuperwallError {
    return new SuperwallError(SuperwallErrorType.NETWORK_ERROR, `Network error: ${error.message}`, error);
  }
}

// MARK: - Placement Result
export enum PlacementResult {
  PAYWALL_PRESENTED = 'paywall_presented',
  PAYWALL_NOT_PRESENTED = 'paywall_not_presented',
  USER_ALREADY_SUBSCRIBED = 'user_already_subscribed',
  PLACEMENT_NOT_FOUND = 'placement_not_found',
  ERROR = 'error',
}

// MARK: - Subscription Status
export enum SubscriptionStatus {
  FREE = 'free',
  TRIAL = 'trial',
  PREMIUM = 'premium',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

// Mock Superwall SDK interface (since react-native-superwall might not be available)
interface SuperwallSDK {
  configure(apiKey: string): void;
  register(placement: string, params?: Record<string, any>): Promise<void>;
  setUserAttributes(attributes: Record<string, any>): void;
  reset(): void;
}

// MARK: - Mock Superwall SDK
class MockSuperwallSDK implements SuperwallSDK {
  private isConfigured = false;
  private apiKey = '';

  configure(apiKey: string): void {
    this.apiKey = apiKey;
    this.isConfigured = true;
    console.log(`📱 Mock Superwall configured with key: ${apiKey.substring(0, 10)}...`);
  }

  async register(placement: string, params?: Record<string, any>): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Superwall not configured');
    }
    console.log(`🎯 Mock Superwall registered placement: ${placement}`, params);
  }

  setUserAttributes(attributes: Record<string, any>): void {
    if (!this.isConfigured) return;
    console.log('👤 Mock Superwall user attributes set:', attributes);
  }

  reset(): void {
    console.log('🔄 Mock Superwall reset');
  }
}

// MARK: - Superwall Service
export class SuperwallService extends SimpleEventEmitter {
  public static readonly shared = new SuperwallService();

  // MARK: - Properties
  private isConfigured = false;
  private apiKey?: string;
  private isDebugMode = false;
  private userAttributes: Record<string, any> = {};

  // Analytics integration
  private shouldTrackToAnalytics = true;

  // Storage keys for persistence
  private readonly userAttributesKey = 'superwall_user_attributes';
  private readonly subscriptionStatusKey = 'subscription_status';

  // Mock SDK instance (replace with actual Superwall SDK when available)
  private superwall: SuperwallSDK = new MockSuperwallSDK();

  private constructor() {
    super();
    this.loadPersistedUserAttributes();
  }

  // MARK: - Configuration

  /**
   * Configure Superwall with API key (call once during app startup)
   * @param apiKey Your Superwall API key
   * @param debugMode Enable debug logging (default: false)
   */
  configure(apiKey: string, debugMode: boolean = false): void {
    if (!apiKey.trim()) {
      console.log('❌ Superwall: Invalid API key provided');
      return;
    }

    this.apiKey = apiKey;
    this.isDebugMode = debugMode;

    try {
      // Configure Superwall SDK
      this.superwall.configure(apiKey);
      this.isConfigured = true;

      if (debugMode) {
        console.log(`✅ Superwall configured with API key: ${apiKey.substring(0, 10)}...`);
      }

      // Set initial user attributes
      this.refreshUserAttributes();
    } catch (error) {
      console.log(`❌ Superwall configuration failed: ${error}`);
    }
  }

  /**
   * Enable or disable analytics tracking integration
   * @param enabled Whether to send Superwall events to analytics
   */
  setAnalyticsTrackingEnabled(enabled: boolean): void {
    this.shouldTrackToAnalytics = enabled;
    console.log(`📊 Superwall analytics tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  // MARK: - Placement Registration

  /**
   * Register a placement event (this is what triggers paywalls)
   * @param placementName Name of the placement (e.g., "premium_feature", "feature_gate")
   * @param params Optional parameters to pass with the event
   * @returns Placement result
   */
  async register(placementName: string, params?: Record<string, any>): Promise<PlacementResult> {
    if (!this.isConfigured) {
      console.log('❌ Superwall not configured');
      return PlacementResult.ERROR;
    }

    if (!placementName.trim()) {
      console.log('❌ Invalid placement name');
      return PlacementResult.ERROR;
    }

    if (this.isDebugMode) {
      console.log(`🎯 Registering placement: ${placementName}`);
      if (params) {
        console.log('   Parameters:', params);
      }
    }

    try {
      await this.superwall.register(placementName, params);

      // Track to analytics if enabled
      if (this.shouldTrackToAnalytics) {
        this.trackToAnalytics('placement_registered', {
          placement_name: placementName,
          params: params || {},
        });
      }

      // Emit event
      this.emit('placementRegistered', { placementName, params });

      return PlacementResult.PAYWALL_NOT_PRESENTED;
    } catch (error) {
      console.log(`❌ Placement registration failed: ${error}`);
      return PlacementResult.ERROR;
    }
  }

  // MARK: - Manual Paywall Presentation

  /**
   * Present a paywall manually
   * @param identifier Paywall identifier from Superwall dashboard
   * @returns Whether paywall was presented
   */
  async presentPaywall(identifier: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('❌ Superwall not configured');
      return false;
    }

    if (this.isDebugMode) {
      console.log(`💳 Presenting paywall: ${identifier}`);
    }

    try {
      await this.superwall.register(identifier);

      // Track to analytics
      if (this.shouldTrackToAnalytics) {
        this.trackToAnalytics('paywall_presented_manually', {
          paywall_identifier: identifier,
        });
      }

      // Emit event
      this.emit('paywallPresented', { identifier });

      return true;
    } catch (error) {
      console.log(`❌ Paywall presentation failed: ${error}`);
      return false;
    }
  }

  // MARK: - User Attributes

  /**
   * Set user attributes for targeting and personalization
   * @param attributes Dictionary of user attributes
   */
  setUserAttributes(attributes: Record<string, any>): void {
    // Merge with existing attributes
    this.userAttributes = { ...this.userAttributes, ...attributes };

    // Save to AsyncStorage for persistence
    this.saveUserAttributes();

    // Set in Superwall SDK
    if (this.isConfigured) {
      this.superwall.setUserAttributes(attributes);
    }

    if (this.isDebugMode) {
      console.log('👤 User attributes updated:', attributes);
    }

    // Track to analytics
    if (this.shouldTrackToAnalytics) {
      this.trackToAnalytics('user_attributes_updated', attributes);
    }

    // Emit event
    this.emit('userAttributesUpdated', attributes);
  }

  /**
   * Set a single user attribute
   * @param value Attribute value
   * @param key Attribute key
   */
  setUserAttribute(value: any, key: string): void {
    this.setUserAttributes({ [key]: value });
  }

  /**
   * Get current user attributes
   * @returns Dictionary of current user attributes
   */
  getUserAttributes(): Record<string, any> {
    return { ...this.userAttributes };
  }

  /**
   * Set subscription status
   * @param status Current subscription status
   */
  async setSubscriptionStatus(status: SubscriptionStatus): Promise<void> {
    this.setUserAttribute(status, 'subscription_status');
    await AsyncStorage.setItem(this.subscriptionStatusKey, status);

    if (this.isDebugMode) {
      console.log(`💰 Subscription status updated: ${status}`);
    }

    // Emit event
    this.emit('subscriptionStatusChanged', status);
  }

  /**
   * Get current subscription status
   * @returns Current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const statusString = await AsyncStorage.getItem(this.subscriptionStatusKey);
      return (statusString as SubscriptionStatus) || SubscriptionStatus.FREE;
    } catch {
      return SubscriptionStatus.FREE;
    }
  }

  // MARK: - Custom Event Tracking

  /**
   * Track custom events for analytics and targeting
   * @param eventName Name of the event
   * @param params Optional event parameters
   */
  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (this.isDebugMode) {
      console.log(`📊 Tracking event: ${eventName}`);
      if (params) {
        console.log('   Parameters:', params);
      }
    }

    // Track to analytics if enabled
    if (this.shouldTrackToAnalytics) {
      this.trackToAnalytics(eventName, params || {});
    }

    // Emit event
    this.emit('eventTracked', { eventName, params });
  }

  // MARK: - Purchase Management

  /**
   * Handle successful purchase
   * @param productIdentifier Product ID that was purchased
   * @param price Price of the product
   * @param currency Currency code
   */
  async handleSuccessfulPurchase(
    productIdentifier: string,
    price?: number,
    currency?: string
  ): Promise<void> {
    const params: Record<string, any> = { product_id: productIdentifier };

    if (price !== undefined) {
      params.price = price;
    }

    if (currency) {
      params.currency = currency;
    }

    // Update subscription status if it's a subscription product
    if (productIdentifier.includes('premium') || productIdentifier.includes('pro')) {
      await this.setSubscriptionStatus(SubscriptionStatus.PREMIUM);
    }

    this.trackEvent('purchase_completed', params);

    if (this.isDebugMode) {
      console.log(`💰 Purchase completed: ${productIdentifier}`);
    }

    // Emit event
    this.emit('purchaseCompleted', { productIdentifier, price, currency });
  }

  /**
   * Handle purchase restoration
   */
  async handlePurchaseRestoration(): Promise<void> {
    await this.setSubscriptionStatus(SubscriptionStatus.PREMIUM);
    this.trackEvent('purchase_restored');

    if (this.isDebugMode) {
      console.log('🔄 Purchase restored');
    }

    // Emit event
    this.emit('purchaseRestored');
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCancellation(): Promise<void> {
    await this.setSubscriptionStatus(SubscriptionStatus.CANCELLED);
    this.trackEvent('subscription_cancelled');

    if (this.isDebugMode) {
      console.log('❌ Subscription cancelled');
    }

    // Emit event
    this.emit('subscriptionCancelled');
  }

  // MARK: - Utility Methods

  /**
   * Check if user has active subscription
   * @returns Whether user is subscribed
   */
  async isUserSubscribed(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    return status === SubscriptionStatus.PREMIUM || status === SubscriptionStatus.TRIAL;
  }

  /**
   * Reset user data (useful for logout)
   */
  resetUserData(): void {
    this.userAttributes = {};
    this.clearStoredData();

    // Reset in Superwall SDK
    if (this.isConfigured) {
      this.superwall.reset();
    }

    if (this.isDebugMode) {
      console.log('🔄 User data reset');
    }

    this.trackEvent('user_data_reset');

    // Emit event
    this.emit('userDataReset');
  }

  /**
   * Get paywall analytics summary
   * @returns Object with analytics data
   */
  async getAnalyticsSummary(): Promise<Record<string, any>> {
    const subscriptionStatus = await this.getSubscriptionStatus();
    const isSubscribed = await this.isUserSubscribed();

    return {
      is_configured: this.isConfigured,
      subscription_status: subscriptionStatus,
      user_attributes_count: Object.keys(this.userAttributes).length,
      is_subscribed: isSubscribed,
      debug_mode: this.isDebugMode,
      platform: Platform.OS,
    };
  }

  // MARK: - Private Methods

  private async loadPersistedUserAttributes(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.userAttributesKey);
      if (data) {
        this.userAttributes = JSON.parse(data);
      }
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error loading user attributes: ${error}`);
      }
    }
  }

  private async saveUserAttributes(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userAttributesKey, JSON.stringify(this.userAttributes));
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error saving user attributes: ${error}`);
      }
    }
  }

  private async clearStoredData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.userAttributesKey, this.subscriptionStatusKey]);
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error clearing stored data: ${error}`);
      }
    }
  }

  private refreshUserAttributes(): void {
    // Set common attributes
    const attributes: Record<string, any> = {
      platform: Platform.OS,
      app_version: '1.0.0', // You might want to get this from expo-constants
      device_model: Platform.OS === 'ios' ? 'iPhone' : 'Android',
      first_launch: false, // Will be set based on AsyncStorage check
    };

    // Check if this is first launch
    AsyncStorage.getItem('first_launch_date').then((date: string | null) => {
      if (!date) {
        const now = new Date();
        AsyncStorage.setItem('first_launch_date', now.toISOString());
        attributes.first_launch_date = now.toISOString();
        attributes.first_launch = true;
      }
      this.setUserAttributes(attributes);
    });
  }

  private trackToAnalytics(eventName: string, params: Record<string, any>): void {
    // Integration with our existing API service for analytics
    const analyticsParams = {
      ...params,
      source: 'superwall',
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    // You can send to your analytics service here
    // Example: APIService.shared.post('/analytics/events', { event: eventName, ...analyticsParams });

    if (this.isDebugMode) {
      console.log(`📈 Analytics tracked: ${eventName} with params:`, analyticsParams);
    }
  }
}

// MARK: - Convenience Extensions
export namespace SuperwallService {
  /**
   * Common placement names for easy reference
   */
  export const Placements = {
    FEATURE_GATE: 'feature_gate',
    PREMIUM_CONTENT: 'premium_content',
    SETTINGS_UPGRADE: 'settings_upgrade',
    ONBOARDING_UPSELL: 'onboarding_upsell',
    EXPORT_FEATURE: 'export_feature',
    CUSTOM_THEMES: 'custom_themes',
    UNLIMITED_USAGE: 'unlimited_usage',
    PREMIUM_SUPPORT: 'premium_support',
  } as const;

  /**
   * Quick access methods for common placements
   */
  export function registerFeatureGate(feature: string): Promise<PlacementResult> {
    return SuperwallService.shared.register(Placements.FEATURE_GATE, { feature });
  }

  export function registerPremiumContent(contentId: string, contentType: string): Promise<PlacementResult> {
    return SuperwallService.shared.register(Placements.PREMIUM_CONTENT, {
      content_id: contentId,
      content_type: contentType,
    });
  }

  export function registerOnboardingUpsell(step: string): Promise<PlacementResult> {
    return SuperwallService.shared.register(Placements.ONBOARDING_UPSELL, { onboarding_step: step });
  }
}
