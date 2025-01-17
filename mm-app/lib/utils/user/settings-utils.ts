import { type UserSettings } from '@/lib/types/settings-types';

/**
 * Default settings values
 */
export const defaultSettings: UserSettings = {
  preferences: {
    theme: 'system',
    aiPersonality: 'HAL9000',
  },
  notifications: {
    email: true,
    new_artwork: true,
    new_follower: true,
    artwork_favorited: true,
    price_alert: true,
  },
  role: {
    current: 'user',
    medium: [],
  },
};

/**
 * AI Personality configurations
 */
export const AI_PERSONALITIES = {
  HAL9000: {
    name: 'HAL 9000',
    description: 'Calm and methodical AI with a hidden agenda',
  },
  GLADOS: {
    name: 'GLaDOS',
    description: 'Passive-aggressive AI with a love for testing',
  },
  JARVIS: {
    name: 'JARVIS',
    description: 'Sophisticated and helpful AI butler',
  },
} as const;

/**
 * Notification type configurations
 */
export const NOTIFICATION_TYPES = {
  email: {
    label: 'Email Notifications',
    description: 'Receive important updates via email',
  },
  new_artwork: {
    label: 'New Artwork',
    description: 'Get notified when artists you follow post new artwork',
  },
  new_follower: {
    label: 'New Followers',
    description: 'Get notified when someone follows you',
  },
  artwork_favorited: {
    label: 'Artwork Favorited',
    description: 'Get notified when someone favorites your artwork',
  },
  price_alert: {
    label: 'Price Alerts',
    description: 'Get notified about price changes for artwork you are watching',
  },
} as const;

/**
 * Art medium configurations
 */
export const ART_MEDIUMS = [
  { value: 'digital', label: 'Digital Art' },
  { value: 'painting', label: 'Painting' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'photography', label: 'Photography' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'mixed_media', label: 'Mixed Media' },
  { value: 'printmaking', label: 'Printmaking' },
  { value: 'ceramics', label: 'Ceramics' },
  { value: 'textile', label: 'Textile Art' },
  { value: 'drawing', label: 'Drawing' },
] as const;

/**
 * Checks if user has permission to update role settings
 */
export const canUpdateRoleSettings = (role?: string): boolean => {
  return role === 'artist' || role === 'patron';
};

/**
 * Merges partial settings with defaults
 */
export const mergeWithDefaultSettings = (
  settings: Partial<UserSettings>
): UserSettings => {
  return {
    preferences: {
      ...defaultSettings.preferences,
      ...settings.preferences,
    },
    notifications: {
      ...defaultSettings.notifications,
      ...settings.notifications,
    },
    role: {
      ...defaultSettings.role,
      ...settings.role,
    },
  };
};

/**
 * Validates theme value
 */
export const isValidTheme = (theme: string): theme is UserSettings['preferences']['theme'] => {
  return ['light', 'dark', 'system'].includes(theme);
};

/**
 * Validates AI personality value
 */
export const isValidAiPersonality = (personality: string): personality is UserSettings['preferences']['aiPersonality'] => {
  return Object.keys(AI_PERSONALITIES).includes(personality);
};

/**
 * Gets theme value with fallback
 */
export const getThemeWithFallback = (theme?: string): UserSettings['preferences']['theme'] => {
  return isValidTheme(theme || '') ? theme as UserSettings['preferences']['theme'] : defaultSettings.preferences.theme;
};

/**
 * Gets AI personality with fallback
 */
export const getAiPersonalityWithFallback = (personality?: string): UserSettings['preferences']['aiPersonality'] => {
  return isValidAiPersonality(personality || '') ? personality as UserSettings['preferences']['aiPersonality'] : defaultSettings.preferences.aiPersonality;
};

/**
 * Gets notification settings with defaults
 */
export const getNotificationSettingsWithDefaults = (
  notifications?: Partial<UserSettings['notifications']>
): UserSettings['notifications'] => {
  return {
    ...defaultSettings.notifications,
    ...notifications,
  };
};

/**
 * Gets art mediums with validation
 */
export const getValidArtMediums = (mediums?: string[]): string[] => {
  if (!mediums) return [];
  const validMediums = ART_MEDIUMS.map(m => m.value);
  return mediums.filter(m => validMediums.includes(m as any));
}; 