import { z } from 'zod';

// Enums
export const themeSchema = z.enum(['light', 'dark', 'system']);
export const aiPersonalitySchema = z.enum(['HAL9000', 'GLADOS', 'JARVIS']);
export const notificationTypeSchema = z.enum([
  'email',
  'new_artwork',
  'new_follower',
  'artwork_favorited',
  'price_alert'
]);
export const userRoleSchema = z.enum([
  'user',
  'patron',
  'artist',
  'admin',
  'emerging_artist',
  'verified_artist'
]);
export const artistStatusSchema = z.enum(['draft', 'pending', 'approved', 'rejected']);

// Preferences
export const userPreferencesSchema = z.object({
  theme: themeSchema,
  aiPersonality: aiPersonalitySchema,
});

// Notifications
export const notificationSettingsSchema = z.record(
  notificationTypeSchema,
  z.boolean()
);

// Role
export const userRoleSettingsSchema = z.object({
  current: userRoleSchema,
  medium: z.array(z.string()).optional(),
  artist_type: z.string().optional(),
  artist_status: artistStatusSchema.optional(),
});

// Combined settings
export const userSettingsSchema = z.object({
  preferences: userPreferencesSchema,
  notifications: notificationSettingsSchema,
  role: userRoleSettingsSchema,
});

// Infer types
export type Theme = z.infer<typeof themeSchema>;
export type AiPersonality = z.infer<typeof aiPersonalitySchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type ArtistStatus = z.infer<typeof artistStatusSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type UserRoleSettings = z.infer<typeof userRoleSettingsSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;

// Update types
export type SettingsUpdateType = 'preferences' | 'notifications' | 'role';
export type SettingsUpdate<T extends SettingsUpdateType> = T extends 'preferences'
  ? Partial<UserPreferences>
  : T extends 'notifications'
  ? Partial<NotificationSettings>
  : T extends 'role'
  ? Partial<UserRoleSettings>
  : never; 