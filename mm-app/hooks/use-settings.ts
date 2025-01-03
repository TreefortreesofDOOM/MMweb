'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { 
  type UserSettings,
  type SettingsUpdate,
  type SettingsUpdateType,
} from '@/lib/types/settings-types';
import { 
  getSettings,
  updatePreferences,
  updateNotifications,
  updateRoleSettings,
} from '@/lib/actions/settings';

export const useSettings = () => {
  const { 
    data: settings, 
    error, 
    mutate,
    isLoading 
  } = useSWR<UserSettings>('user-settings', getSettings);

  const updateSettings = useCallback(async <T extends SettingsUpdateType>(
    type: T,
    values: SettingsUpdate<T>
  ) => {
    try {
      switch (type) {
        case 'preferences':
          await updatePreferences(values as SettingsUpdate<'preferences'>);
          break;
        case 'notifications':
          await updateNotifications(values as SettingsUpdate<'notifications'>);
          break;
        case 'role':
          await updateRoleSettings(values as SettingsUpdate<'role'>);
          break;
        default:
          throw new Error(`Invalid settings type: ${type}`);
      }
      await mutate();
      return { success: true as const };
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      return { 
        success: false as const, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [mutate]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}; 