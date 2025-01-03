'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { getSettings, updatePreferences } from '@/lib/actions/settings';
import type { UserSettings } from '@/lib/types/settings-types';

interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateTheme: (theme: UserSettings['preferences']['theme']) => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

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

  React.useEffect(() => {
    const loadSettings = async () => {
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
  }, [setTheme]);

  const updateTheme = React.useCallback(async (theme: UserSettings['preferences']['theme']) => {
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
  }, [setTheme]);

  const value = React.useMemo(() => ({
    settings,
    isLoading,
    error,
    updateTheme,
  }), [settings, isLoading, error, updateTheme]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
} 