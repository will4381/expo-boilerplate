/*
 * NOTIFICATION MANAGER REFERENCE GUIDE
 * 
 * Features:
 * - Permission request handling
 * - Immediate local notifications
 * - Engagement campaigns with timed schedules
 * - Badge number management
 * - Rich notifications with images/actions
 * - Sound and vibration control
 * - Notification categories and actions
 * - Campaign analytics tracking
 * 
 * Usage Examples:
 * // Request permissions
 * await NotificationManager.shared.requestPermissions();
 * 
 * // Send immediate notification
 * NotificationManager.shared.sendNotification(
 *   'Welcome!',
 *   'Thanks for joining our app'
 * );
 * 
 * // Start engagement campaign
 * NotificationManager.shared.startEngagementCampaign();
 * 
 * // Send scheduled notification
 * NotificationManager.shared.scheduleNotification(
 *   'Don\'t forget!',
 *   'Complete your daily tasks',
 *   3600 // 1 hour from now
 * );
 * 
 * Configuration:
 * - Set app badge: NotificationManager.shared.setBadgeCount(5)
 * - Enable/disable campaigns: NotificationManager.shared.setCampaignsEnabled(true)
 * - Configure campaign schedule: customize campaigns in the campaigns array
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimpleEventEmitter } from './eventEmitter';

// MARK: - Notification Error Types
export enum NotificationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_ALLOWED = 'NOT_ALLOWED',
  SCHEDULING_FAILED = 'SCHEDULING_FAILED',
  INVALID_DELAY = 'INVALID_DELAY',
  CAMPAIGN_ALREADY_RUNNING = 'CAMPAIGN_ALREADY_RUNNING',
}

export class NotificationError extends Error {
  public type: NotificationErrorType;

  constructor(type: NotificationErrorType, message: string) {
    super(message);
    this.name = 'NotificationError';
    this.type = type;
  }

  static permissionDenied(): NotificationError {
    return new NotificationError(NotificationErrorType.PERMISSION_DENIED, 'Notification permission was denied');
  }

  static notificationNotAllowed(): NotificationError {
    return new NotificationError(NotificationErrorType.NOT_ALLOWED, 'Notifications are not allowed');
  }

  static schedulingFailed(): NotificationError {
    return new NotificationError(NotificationErrorType.SCHEDULING_FAILED, 'Failed to schedule notification');
  }

  static invalidDelay(): NotificationError {
    return new NotificationError(NotificationErrorType.INVALID_DELAY, 'Invalid delay time for notification');
  }

  static campaignAlreadyRunning(): NotificationError {
    return new NotificationError(NotificationErrorType.CAMPAIGN_ALREADY_RUNNING, 'Engagement campaign is already running');
  }
}

// MARK: - Notification Types
export enum NotificationType {
  IMMEDIATE = 'immediate',
  CAMPAIGN = 'campaign',
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  WELCOME = 'welcome',
}

// MARK: - Campaign Notification
export interface CampaignNotification {
  id: string;
  title: string;
  body: string;
  delayHours: number;
  type: NotificationType;
  badge?: number;
}

// MARK: - Notification Manager
export class NotificationManager extends SimpleEventEmitter {
  public static readonly shared = new NotificationManager();

  // MARK: - Properties
  private isInitialized = false;
  private campaignsEnabled = true;

  // Keys for AsyncStorage
  private readonly campaignStartedKey = 'notification_campaign_started';
  private readonly campaignsEnabledKey = 'notification_campaigns_enabled';
  private readonly lastNotificationDateKey = 'last_notification_date';

  // MARK: - Default Campaign Schedule
  private readonly defaultCampaigns: CampaignNotification[] = [
    // Welcome series
    {
      id: 'welcome_1',
      title: 'Welcome aboard! 🎉',
      body: 'Thanks for joining us! Explore the app to get started.',
      delayHours: 0.5, // 30 minutes
      type: NotificationType.WELCOME,
      badge: 1,
    },
    {
      id: 'engagement_1',
      title: 'Don\'t miss out! 📱',
      body: 'Complete your profile to unlock all features.',
      delayHours: 24, // 1 day
      type: NotificationType.CAMPAIGN,
      badge: 2,
    },
    {
      id: 'engagement_2',
      title: 'We miss you! 💙',
      body: 'Come back and see what\'s new in the app.',
      delayHours: 72, // 3 days
      type: NotificationType.CAMPAIGN,
      badge: 3,
    },
    {
      id: 'engagement_3',
      title: 'Special features await! ⭐',
      body: 'Discover advanced features you haven\'t tried yet.',
      delayHours: 168, // 1 week
      type: NotificationType.CAMPAIGN,
      badge: 4,
    },
    {
      id: 'retention_1',
      title: 'You\'re making progress! 🚀',
      body: 'Keep up the momentum and achieve your goals.',
      delayHours: 336, // 2 weeks
      type: NotificationType.CAMPAIGN,
      badge: 5,
    },
    {
      id: 'retention_2',
      title: 'Monthly check-in 📊',
      body: 'See how much you\'ve accomplished this month!',
      delayHours: 720, // 30 days
      type: NotificationType.CAMPAIGN,
      badge: 6,
    },
  ];

  private constructor() {
    super();
    this.setupNotificationHandler();
  }

  // MARK: - Setup Methods

  private setupNotificationHandler(): void {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Set up notification received listener
    Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      this.emit('notificationReceived', notification);
    });

    // Set up notification response listener
    Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      this.handleNotificationResponse(response);
    });

    this.isInitialized = true;
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const userInfo = response.notification.request.content.data;
    
    // Handle different actions
    switch (response.actionIdentifier) {
      case Notifications.DEFAULT_ACTION_IDENTIFIER:
        console.log('📱 User tapped notification');
        break;
      default:
        break;
    }

    // Log analytics
    if (userInfo.type) {
      console.log(`📊 Notification interaction: ${userInfo.type}`);
    }

    this.emit('notificationResponse', response);
  }

  // MARK: - Permission Management

  /**
   * Request notification permissions from user
   * @returns Boolean indicating if permission was granted
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw NotificationError.permissionDenied();
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  /**
   * Check current authorization status
   * @returns Current authorization status
   */
  async checkAuthorizationStatus(): Promise<string> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  /**
   * Check if notifications are enabled
   * @returns Boolean indicating if notifications are allowed
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const status = await this.checkAuthorizationStatus();
    return status === 'granted';
  }

  // MARK: - Immediate Notifications

  /**
   * Send an immediate local notification
   * @param title Notification title
   * @param body Notification body
   * @param badge Badge number (optional)
   * @param data Additional data (optional)
   */
  async sendNotification(
    title: string,
    body: string,
    badge?: number,
    data: Record<string, any> = {}
  ): Promise<void> {
    if (!(await this.areNotificationsEnabled())) {
      console.log('❌ Notifications not enabled');
      return;
    }

    const content: Notifications.NotificationContentInput = {
      title,
      body,
      badge,
      data: {
        ...data,
        type: NotificationType.IMMEDIATE,
        timestamp: Date.now(),
      },
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // Immediate delivery
      });

      console.log(`✅ Immediate notification sent: ${title}`);
      await AsyncStorage.setItem(this.lastNotificationDateKey, new Date().toISOString());
    } catch (error) {
      console.log(`❌ Failed to send notification: ${error}`);
    }
  }

  // MARK: - Scheduled Notifications

  /**
   * Schedule a notification for later delivery
   * @param title Notification title
   * @param body Notification body
   * @param delaySeconds Delay in seconds from now
   * @param badge Badge number
   * @param data Additional data
   * @returns Notification identifier
   */
  async scheduleNotification(
    title: string,
    body: string,
    delaySeconds: number,
    badge?: number,
    data: Record<string, any> = {}
  ): Promise<string> {
    if (delaySeconds <= 0) {
      throw NotificationError.invalidDelay();
    }

    if (!(await this.areNotificationsEnabled())) {
      throw NotificationError.notificationNotAllowed();
    }

    const content: Notifications.NotificationContentInput = {
      title,
      body,
      badge,
      data: {
        ...data,
        type: NotificationType.REMINDER,
        scheduledFor: Date.now() + delaySeconds * 1000,
      },
    };

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
      });

      console.log(`✅ Notification scheduled for ${delaySeconds} seconds: ${title}`);
      return identifier;
    } catch (error) {
      console.log(`❌ Failed to schedule notification: ${error}`);
      throw NotificationError.schedulingFailed();
    }
  }

  // MARK: - Campaign Management

  /**
   * Start the engagement campaign with predefined notifications
   */
  async startEngagementCampaign(): Promise<void> {
    if (await this.isCampaignRunning()) {
      console.log('⚠️ Campaign already running');
      return;
    }

    if (!this.campaignsEnabled) {
      console.log('⚠️ Campaigns are disabled');
      return;
    }

    if (!(await this.areNotificationsEnabled())) {
      console.log('❌ Cannot start campaign: notifications not enabled');
      return;
    }

    // Mark campaign as started
    await AsyncStorage.setItem(this.campaignStartedKey, new Date().toISOString());

    // Schedule all campaign notifications
    for (const campaign of this.defaultCampaigns) {
      await this.scheduleCampaignNotification(campaign);
    }

    console.log(`🚀 Engagement campaign started with ${this.defaultCampaigns.length} notifications`);
  }

  /**
   * Schedule a single campaign notification
   * @param campaign Campaign notification to schedule
   */
  private async scheduleCampaignNotification(campaign: CampaignNotification): Promise<void> {
    const delaySeconds = campaign.delayHours * 3600; // Convert hours to seconds

    const content: Notifications.NotificationContentInput = {
      title: campaign.title,
      body: campaign.body,
      badge: campaign.badge,
      data: {
        type: campaign.type,
        campaignId: campaign.id,
        delayHours: campaign.delayHours,
        scheduledFor: Date.now() + delaySeconds * 1000,
      },
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
        identifier: `campaign_${campaign.id}`,
      });

      console.log(`📅 Campaign notification scheduled: ${campaign.id} in ${campaign.delayHours}h`);
    } catch (error) {
      console.log(`❌ Failed to schedule campaign notification ${campaign.id}: ${error}`);
    }
  }

  /**
   * Stop the current engagement campaign
   */
  async stopEngagementCampaign(): Promise<void> {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter campaign notifications
    const campaignNotifications = scheduledNotifications.filter(
      (notification: Notifications.NotificationRequest) => notification.identifier.startsWith('campaign_')
    );

    // Cancel campaign notifications
    for (const notification of campaignNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    console.log(`🛑 Stopped campaign: removed ${campaignNotifications.length} notifications`);

    // Clear campaign started flag
    await AsyncStorage.removeItem(this.campaignStartedKey);
  }

  /**
   * Check if a campaign is currently running
   * @returns Boolean indicating if campaign is active
   */
  async isCampaignRunning(): Promise<boolean> {
    const campaignStarted = await AsyncStorage.getItem(this.campaignStartedKey);
    return campaignStarted !== null;
  }

  /**
   * Enable or disable campaigns
   * @param enabled Whether campaigns should be enabled
   */
  async setCampaignsEnabled(enabled: boolean): Promise<void> {
    this.campaignsEnabled = enabled;
    await AsyncStorage.setItem(this.campaignsEnabledKey, JSON.stringify(enabled));

    if (!enabled) {
      await this.stopEngagementCampaign();
    }

    console.log(`📢 Campaigns ${enabled ? 'enabled' : 'disabled'}`);
  }

  // MARK: - Badge Management

  /**
   * Set the app badge count
   * @param count Badge count (0 to clear)
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
    console.log(`🔢 Badge count set to: ${count}`);
  }

  /**
   * Clear the app badge
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Increment badge count
   * @param amount Amount to increment (default: 1)
   */
  async incrementBadge(amount: number = 1): Promise<void> {
    const currentBadge = await Notifications.getBadgeCountAsync();
    await this.setBadgeCount(currentBadge + amount);
  }

  // MARK: - Utility Methods

  /**
   * Get all pending notifications
   * @returns Array of pending notification requests
   */
  async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Cancel a specific notification
   * @param identifier Notification identifier to cancel
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`🗑️ Cancelled notification: ${identifier}`);
  }

  /**
   * Cancel all pending notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await this.stopEngagementCampaign();
    console.log('🗑️ Cancelled all notifications');
  }

  /**
   * Get notification statistics
   * @returns Object with notification stats
   */
  async getNotificationStats(): Promise<Record<string, any>> {
    const pending = await this.getPendingNotifications();
    const campaignNotifications = pending.filter((notification) =>
      notification.identifier.startsWith('campaign_')
    );

    const lastNotificationDate = await AsyncStorage.getItem(this.lastNotificationDateKey);
    const badgeCount = await Notifications.getBadgeCountAsync();

    return {
      totalPending: pending.length,
      campaignPending: campaignNotifications.length,
      campaignRunning: await this.isCampaignRunning(),
      campaignsEnabled: this.campaignsEnabled,
      lastNotificationDate: lastNotificationDate ? new Date(lastNotificationDate) : 'Never',
      badgeCount,
    };
  }
}
