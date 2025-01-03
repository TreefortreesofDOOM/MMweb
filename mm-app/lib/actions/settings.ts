'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { userSettingsSchema, type UserSettings } from '@/lib/types/settings-types';

export const getSettings = async () => {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('get_user_settings', {
      p_user_id: user.id
    });
  
  if (error) throw error;
  
  // Validate response
  const parsed = userSettingsSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid settings data:', parsed.error);
    throw new Error('Invalid settings data');
  }
  
  return parsed.data;
};

export const updatePreferences = async (
  preferences: Partial<UserSettings['preferences']>
) => {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .rpc('upsert_user_preferences', {
      p_user_id: user.id,
      p_theme: preferences.theme,
      p_ai_personality: preferences.aiPersonality
    });
  
  if (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
  
  return { success: true };
};

export const updateNotifications = async (
  notifications: Partial<UserSettings['notifications']>
) => {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  // Batch update notifications
  const settings = Object.entries(notifications).map(([type, enabled]) => ({
    user_id: user.id,
    notification_type: type,
    enabled,
    updated_at: new Date().toISOString(),
  }));
  
  const { error } = await supabase
    .from('notification_settings')
    .upsert(settings, {
      onConflict: 'user_id,notification_type'
    });
  
  if (error) throw error;
  return { success: true };
};

export const updateRoleSettings = async (
  roleSettings: Partial<UserSettings['role']>
) => {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  // Update profile with role settings
  const { error } = await supabase
    .from('profiles')
    .update({
      medium: roleSettings.medium,
      artist_type: roleSettings.artist_type,
      artist_status: roleSettings.artist_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) throw error;
  return { success: true };
}; 