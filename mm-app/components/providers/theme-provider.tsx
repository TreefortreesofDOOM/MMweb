'use client';

import * as React from 'react';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { getSettings } from '@/lib/actions/settings';

interface ThemeProviderProps {
  children: React.ReactNode;
}

function ThemeSync() {
  const { setTheme, theme: currentTheme } = useTheme();

  React.useEffect(() => {
    const initTheme = async () => {
      try {
        const settings = await getSettings();
        if (settings?.preferences?.theme && settings.preferences.theme !== currentTheme) {
          setTheme(settings.preferences.theme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    initTheme();
  }, [setTheme, currentTheme]);

  return null;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="mm-theme"
    >
      <ThemeSync />
      {children}
    </NextThemeProvider>
  );
} 