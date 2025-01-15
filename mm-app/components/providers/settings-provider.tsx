'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { getSettings, updatePreferences } from '@/lib/actions/settings';
import type { UserSettings } from '@/lib/types/settings-types';
import { useAuth } from '@/hooks/use-auth';

interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateTheme: (theme: UserSettings['preferences']['theme']) => Promise<void>;
  updateAiPersonality: (personality: UserSettings['preferences']['aiPersonality']) => Promise<void>;
  updateSettings: <T extends keyof UserSettings>(
    type: T,
    values: Partial<UserSettings[T]>
  ) => Promise<{ success: boolean; error?: string }>;
}

export const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = React.useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const { setTheme } = useTheme();
  const { user } = useAuth();

  React.useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getSettings();
        setSettings(data);
        if (data?.preferences?.theme) {
          setTheme(data.preferences.theme);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load settings'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [setTheme, user]);

  const updateTheme = React.useCallback(async (theme: UserSettings['preferences']['theme']) => {
    if (!user) return;
    
    try {
      await updatePreferences({ theme });
      setTheme(theme);
      setSettings(prev => prev ? {
        ...prev,
        preferences: {
          ...prev.preferences,
          theme
        }
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update theme'));
      throw err;
    }
  }, [setTheme, user]);

  const updateAiPersonality = React.useCallback(async (aiPersonality: UserSettings['preferences']['aiPersonality']) => {
    if (!user) return;
    
    try {
      await updatePreferences({ aiPersonality });
      setSettings(prev => prev ? {
        ...prev,
        preferences: {
          ...prev.preferences,
          aiPersonality
        }
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update AI personality'));
      throw err;
    }
  }, [user]);

  const updateSettings = React.useCallback(async <T extends keyof UserSettings>(
    type: T,
    values: Partial<UserSettings[T]>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await updatePreferences(values);
      setSettings(prev => prev ? {
        ...prev,
        [type]: {
          ...prev[type],
          ...values
        }
      } : null);
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update settings';
      setError(new Error(error));
      return { success: false, error };
    }
  }, [user]);

  const value = React.useMemo(() => ({
    settings,
    isLoading,
    error,
    updateTheme,
    updateAiPersonality,
    updateSettings,
  }), [settings, isLoading, error, updateTheme, updateAiPersonality, updateSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
} 