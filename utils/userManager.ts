/*
 * USER MANAGER REFERENCE GUIDE
 * 
 * Features:
 * - User authentication state management
 * - Onboarding completion tracking
 * - User profile data management
 * - Flexible storage backends (AsyncStorage, SecureStore, etc.)
 * - Integration with existing utilities (Superwall, Notifications, API)
 * - Session management and persistence
 * - User preferences and settings
 * - Easy logout and data cleanup
 * 
 * Usage Examples:
 * // Check user state
 * const isSignedIn = UserManager.shared.isSignedIn;
 * const needsOnboarding = !UserManager.shared.isOnboardingCompleted;
 * 
 * // Sign in user
 * await UserManager.shared.signIn('123', 'user@example.com');
 * 
 * // Complete onboarding
 * UserManager.shared.completeOnboarding();
 * 
 * // Update user data
 * UserManager.shared.updateUserData({ name: 'John Doe', plan: 'premium' });
 * 
 * // Sign out
 * await UserManager.shared.signOut();
 * 
 * Configuration:
 * - Set storage backend: UserManager.shared.setStorageBackend(new SecureStorageBackend())
 * - Configure auto-sync: UserManager.shared.setAutoSyncEnabled(true)
 * - Set debug mode: UserManager.shared.setDebugMode(true)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIService } from './apiService';
import { SimpleEventEmitter } from './eventEmitter';

// MARK: - User Manager Error Types
export enum UserManagerErrorType {
  NOT_SIGNED_IN = 'NOT_SIGNED_IN',
  INVALID_USER_DATA = 'INVALID_USER_DATA',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DATA_CORRUPTED = 'DATA_CORRUPTED',
}

export class UserManagerError extends Error {
  public type: UserManagerErrorType;
  public originalError?: Error;

  constructor(type: UserManagerErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'UserManagerError';
    this.type = type;
    this.originalError = originalError;
  }

  static notSignedIn(): UserManagerError {
    return new UserManagerError(UserManagerErrorType.NOT_SIGNED_IN, 'User is not signed in');
  }

  static invalidUserData(): UserManagerError {
    return new UserManagerError(UserManagerErrorType.INVALID_USER_DATA, 'Invalid user data provided');
  }

  static storageError(error: Error): UserManagerError {
    return new UserManagerError(UserManagerErrorType.STORAGE_ERROR, `Storage error: ${error.message}`, error);
  }

  static networkError(error: Error): UserManagerError {
    return new UserManagerError(UserManagerErrorType.NETWORK_ERROR, `Network error: ${error.message}`, error);
  }

  static authenticationFailed(): UserManagerError {
    return new UserManagerError(UserManagerErrorType.AUTHENTICATION_FAILED, 'Authentication failed');
  }

  static userNotFound(): UserManagerError {
    return new UserManagerError(UserManagerErrorType.USER_NOT_FOUND, 'User not found');
  }

  static dataCorrupted(): UserManagerError {
    return new UserManagerError(UserManagerErrorType.DATA_CORRUPTED, 'User data is corrupted');
  }
}

// MARK: - User Model
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: Record<string, any>;
  customData: Record<string, any>;
}

// MARK: - Storage Backend Protocol
export interface UserStorageBackend {
  saveUser(user: User): Promise<void>;
  loadUser(): Promise<User | null>;
  deleteUser(): Promise<void>;
  saveOnboardingStatus(completed: boolean): Promise<void>;
  loadOnboardingStatus(): Promise<boolean>;
  saveUserData(data: Record<string, any>): Promise<void>;
  loadUserData(): Promise<Record<string, any>>;
}

// MARK: - AsyncStorage Backend
export class AsyncStorageBackend implements UserStorageBackend {
  private readonly userKey = 'saved_user';
  private readonly onboardingKey = 'onboarding_completed';
  private readonly userDataKey = 'user_data';

  async saveUser(user: User): Promise<void> {
    try {
      const userData = {
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString(),
      };
      await AsyncStorage.setItem(this.userKey, JSON.stringify(userData));
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  async loadUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(this.userKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastLoginAt: new Date(parsed.lastLoginAt),
        preferences: parsed.preferences || {},
        customData: parsed.customData || {},
      };
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  async deleteUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.userKey);
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  async saveOnboardingStatus(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.onboardingKey, JSON.stringify(completed));
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  async loadOnboardingStatus(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.onboardingKey);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  async saveUserData(data: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userDataKey, JSON.stringify(data));
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  async loadUserData(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(this.userDataKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }
}

// MARK: - User Manager
export class UserManager extends SimpleEventEmitter {
  public static readonly shared = new UserManager();

  // MARK: - Properties
  private _currentUser: User | null = null;
  private _isSignedIn: boolean = false;
  private _isOnboardingCompleted: boolean = false;
  private _userData: Record<string, any> = {};

  private storageBackend: UserStorageBackend;
  private isDebugMode = false;
  private autoSyncEnabled = true;

  // Storage keys for local state
  private readonly lastSyncKey = 'last_sync_date';
  private readonly sessionTokenKey = 'session_token';

  private constructor() {
    super();
    // Default to AsyncStorage backend
    this.storageBackend = new AsyncStorageBackend();
    
    // Load initial state
    this.loadInitialState();
  }

  // MARK: - Getters
  get currentUser(): User | null {
    return this._currentUser;
  }

  get isSignedIn(): boolean {
    return this._isSignedIn;
  }

  get isOnboardingCompleted(): boolean {
    return this._isOnboardingCompleted;
  }

  get userData(): Record<string, any> {
    return { ...this._userData };
  }

  // MARK: - Configuration

  /**
   * Set the storage backend (AsyncStorage, SecureStore, etc.)
   * @param backend Storage backend implementation
   */
  setStorageBackend(backend: UserStorageBackend): void {
    this.storageBackend = backend;
    
    // Reload state with new backend
    this.loadInitialState();
    
    if (this.isDebugMode) {
      console.log('👤 User storage backend updated');
    }
  }

  /**
   * Enable or disable debug logging
   * @param enabled Whether debug mode is enabled
   */
  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
    console.log(`🐛 UserManager debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable or disable automatic data syncing
   * @param enabled Whether auto-sync is enabled
   */
  setAutoSyncEnabled(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
    
    if (this.isDebugMode) {
      console.log(`🔄 Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  // MARK: - Authentication

  /**
   * Sign in a user
   * @param userId Unique user identifier
   * @param email User's email (optional)
   * @param name User's name (optional)
   * @param avatarURL User's avatar URL (optional)
   */
  async signIn(userId: string, email?: string, name?: string, avatarURL?: string): Promise<void> {
    if (!userId.trim()) {
      throw UserManagerError.invalidUserData();
    }

    const user: User = {
      id: userId,
      email,
      name,
      avatarURL,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {},
      customData: {},
    };

    try {
      await this.storageBackend.saveUser(user);
      
      this._currentUser = user;
      this._isSignedIn = true;
      
      // Emit event
      this.emit('userSignedIn', user);
      
      // Integrate with other services
      await this.setupUserServices(user);
      
      if (this.isDebugMode) {
        console.log(`✅ User signed in: ${userId}`);
      }
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      // Clean up storage
      await this.storageBackend.deleteUser();
      
      // Clean up session
      await AsyncStorage.removeItem(this.sessionTokenKey);
      
      this._currentUser = null;
      this._isSignedIn = false;
      this._userData = {};
      
      // Emit event
      this.emit('userSignedOut');
      
      // Clean up other services
      await this.cleanupUserServices();
      
      if (this.isDebugMode) {
        console.log('👋 User signed out');
      }
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error during sign out: ${error}`);
      }
    }
  }

  /**
   * Check if user is currently signed in
   * @returns Whether user is signed in
   */
  async checkAuthenticationStatus(): Promise<boolean> {
    try {
      const user = await this.storageBackend.loadUser();
      
      this._currentUser = user;
      this._isSignedIn = user !== null;
      
      return user !== null;
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error checking auth status: ${error}`);
      }
      return false;
    }
  }

  // MARK: - Onboarding

  /**
   * Mark onboarding as completed
   */
  completeOnboarding(): void {
    this.updateOnboardingStatus(true);
  }

  /**
   * Reset onboarding status (useful for testing)
   */
  resetOnboarding(): void {
    this.updateOnboardingStatus(false);
  }

  private async updateOnboardingStatus(completed: boolean): Promise<void> {
    try {
      await this.storageBackend.saveOnboardingStatus(completed);
      
      this._isOnboardingCompleted = completed;
      
      // Emit event
      this.emit('onboardingStatusChanged', completed);
      
      if (this.isDebugMode) {
        console.log(`🎉 Onboarding ${completed ? 'completed' : 'reset'}`);
      }
      
      // Start engagement campaigns if user is signed in and onboarding completed
      if (completed && this._isSignedIn) {
        // Dynamic import to avoid circular dependency
        const { NotificationManager } = await import('./notificationManager');
        NotificationManager.shared.startEngagementCampaign();
      }
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error saving onboarding status: ${error}`);
      }
    }
  }

  // MARK: - User Data Management

  /**
   * Update user data
   * @param data Dictionary of user data to update
   */
  updateUserData(data: Record<string, any>): void {
    // Don't await this to keep it synchronous like the Swift version
    this.updateUserDataAsync(data);
  }

  private async updateUserDataAsync(data: Record<string, any>): Promise<void> {
    try {
      // Merge with existing data
      const updatedData = { ...this._userData, ...data };
      
      await this.storageBackend.saveUserData(updatedData);
      
      this._userData = updatedData;
      
      // Emit event
      this.emit('userDataUpdated', data);
      
      if (this.isDebugMode) {
        console.log(`📝 User data updated: ${Object.keys(data)}`);
      }
      
      // Update Superwall attributes if user is signed in
      if (this._isSignedIn) {
        await this.updateSuperwallAttributes();
      }
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error updating user data: ${error}`);
      }
    }
  }

  /**
   * Get specific user data value
   * @param key Data key
   * @returns Value for the key
   */
  getUserData(key: string): any {
    return this._userData[key];
  }

  /**
   * Remove specific user data
   * @param key Key to remove
   */
  removeUserData(key: string): void {
    const updatedData = { ...this._userData };
    delete updatedData[key];
    this.updateUserData(updatedData);
  }

  /**
   * Update user profile
   * @param name User's name
   * @param email User's email
   * @param avatarURL User's avatar URL
   */
  async updateProfile(name?: string, email?: string, avatarURL?: string): Promise<void> {
    if (!this._currentUser) {
      throw UserManagerError.notSignedIn();
    }

    // Update user object
    const updatedUser: User = {
      ...this._currentUser,
      name: name ?? this._currentUser.name,
      email: email ?? this._currentUser.email,
      avatarURL: avatarURL ?? this._currentUser.avatarURL,
    };

    try {
      await this.storageBackend.saveUser(updatedUser);
      
      this._currentUser = updatedUser;
      
      // Emit event
      this.emit('userProfileUpdated', updatedUser);
      
      if (this.isDebugMode) {
        console.log('👤 User profile updated');
      }
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  // MARK: - Session Management

  /**
   * Set session token
   * @param token Session token
   */
  async setSessionToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.sessionTokenKey, token);
      
      if (this.isDebugMode) {
        console.log('🔑 Session token updated');
      }
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  /**
   * Get current session token
   * @returns Session token if available
   */
  async getSessionToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.sessionTokenKey);
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  /**
   * Clear session token
   */
  async clearSessionToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.sessionTokenKey);
      
      if (this.isDebugMode) {
        console.log('🗑️ Session token cleared');
      }
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  // MARK: - Utility Methods

  /**
   * Force sync user data with backend
   */
  async syncUserData(): Promise<void> {
    if (!this._isSignedIn) {
      throw UserManagerError.notSignedIn();
    }

    try {
      // Load fresh data from backend
      const user = await this.storageBackend.loadUser();
      const onboardingStatus = await this.storageBackend.loadOnboardingStatus();
      const userData = await this.storageBackend.loadUserData();
      
      this._currentUser = user;
      this._isOnboardingCompleted = onboardingStatus;
      this._userData = userData;
      
      // Update last sync time
      await AsyncStorage.setItem(this.lastSyncKey, new Date().toISOString());
      
      if (this.isDebugMode) {
        console.log('🔄 User data synced');
      }
    } catch (error) {
      throw UserManagerError.storageError(error as Error);
    }
  }

  /**
   * Get user analytics summary
   * @returns Object with user analytics data
   */
  getAnalyticsSummary(): Record<string, any> {
    return {
      is_signed_in: this._isSignedIn,
      user_id: this._currentUser?.id ?? 'anonymous',
      onboarding_completed: this._isOnboardingCompleted,
      user_data_count: Object.keys(this._userData).length,
      last_login: this._currentUser?.lastLoginAt.getTime() ?? 0,
      account_age_days: this._currentUser 
        ? Math.floor((Date.now() - this._currentUser.createdAt.getTime()) / (24 * 60 * 60 * 1000))
        : 0,
      has_session_token: false, // Will be updated async
    };
  }

  /**
   * Reset all user data (useful for logout or testing)
   */
  async resetAllUserData(): Promise<void> {
    try {
      await this.storageBackend.deleteUser();
      await this.storageBackend.saveOnboardingStatus(false);
      await this.storageBackend.saveUserData({});
      
      await AsyncStorage.removeItem(this.sessionTokenKey);
      await AsyncStorage.removeItem(this.lastSyncKey);
      
      this._currentUser = null;
      this._isSignedIn = false;
      this._isOnboardingCompleted = false;
      this._userData = {};
      
      // Emit event
      this.emit('userDataReset');
      
      await this.cleanupUserServices();
      
      if (this.isDebugMode) {
        console.log('🔄 All user data reset');
      }
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error resetting user data: ${error}`);
      }
    }
  }

  // MARK: - Private Methods

  private async loadInitialState(): Promise<void> {
    try {
      const user = await this.storageBackend.loadUser();
      const onboardingStatus = await this.storageBackend.loadOnboardingStatus();
      const userData = await this.storageBackend.loadUserData();
      
      this._currentUser = user;
      this._isSignedIn = user !== null;
      this._isOnboardingCompleted = onboardingStatus;
      this._userData = userData;
      
      if (user) {
        await this.setupUserServices(user);
      }
      
      if (this.isDebugMode) {
        console.log(`📱 User state loaded - Signed in: ${user !== null}, Onboarding: ${onboardingStatus}`);
      }
    } catch (error) {
      if (this.isDebugMode) {
        console.log(`❌ Error loading initial state: ${error}`);
      }
    }
  }

  private async setupUserServices(user: User): Promise<void> {
    // Update Superwall attributes
    await this.updateSuperwallAttributes();
    
    // Set API authentication if available
    try {
      const token = await this.getSessionToken();
      if (token) {
        APIService.shared.setBearerToken(token);
      }
    } catch {
      // Silent fail for session token
    }
    
    if (this.isDebugMode) {
      console.log(`🔗 User services configured for: ${user.id}`);
    }
  }

  private async cleanupUserServices(): Promise<void> {
    // Reset Superwall user data
    try {
      const { SuperwallService } = await import('./superwallService');
      SuperwallService.shared.resetUserData();
    } catch {
      // Superwall service might not be available
    }
    
    // Clear API authentication
    APIService.shared.setBearerToken(undefined);
    
    // Stop notification campaigns
    try {
      const { NotificationManager } = await import('./notificationManager');
      NotificationManager.shared.stopEngagementCampaign();
    } catch {
      // Notification manager might not be available
    }
    
    if (this.isDebugMode) {
      console.log('🧹 User services cleaned up');
    }
  }

  private async updateSuperwallAttributes(): Promise<void> {
    if (!this._currentUser) return;
    
    try {
      const { SuperwallService } = await import('./superwallService');
      
      const attributes: Record<string, any> = {
        user_id: this._currentUser.id,
        onboarding_completed: this._isOnboardingCompleted,
        account_age_days: Math.floor(
          (Date.now() - this._currentUser.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        ),
      };
      
      if (this._currentUser.email) {
        attributes.email = this._currentUser.email;
      }
      
      if (this._currentUser.name) {
        attributes.name = this._currentUser.name;
      }
      
      // Add custom user data
      Object.assign(attributes, this._userData);
      
      SuperwallService.shared.setUserAttributes(attributes);
    } catch {
      // Superwall service might not be available
    }
  }
}

// MARK: - Convenience Extensions
export namespace UserManager {
  /**
   * Quick check if user needs onboarding
   */
  export function needsOnboarding(userManager: UserManager): boolean {
    return !userManager.isOnboardingCompleted;
  }

  /**
   * Quick check if user is authenticated and onboarded
   */
  export function isFullySetup(userManager: UserManager): boolean {
    return userManager.isSignedIn && userManager.isOnboardingCompleted;
  }

  /**
   * Get user's display name (name or email or "User")
   */
  export function getUserDisplayName(userManager: UserManager): string {
    const user = userManager.currentUser;
    return user?.name ?? user?.email ?? 'User';
  }

  /**
   * Get user's initials for avatar
   */
  export function getUserInitials(userManager: UserManager): string {
    const name = getUserDisplayName(userManager);
    const components = name.split(' ');
    if (components.length >= 2) {
      return (components[0].charAt(0) + components[1].charAt(0)).toUpperCase();
    } else {
      return name.substring(0, 2).toUpperCase();
    }
  }
}
