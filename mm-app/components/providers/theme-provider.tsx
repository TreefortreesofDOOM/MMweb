'use client';

import * as React from 'react';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { getSettings } from '@/lib/actions/settings';

interface ThemeProviderProps {
  children: React.ReactNode;
}

function ThemeSync() {
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const initTheme = async () => {
      try {
        const settings = await getSettings();
        if (settings?.preferences?.theme) {
          setTheme(settings.preferences.theme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    initTheme();
  }, [setTheme]);

  return null;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeSync />
      {children}
    </NextThemeProvider>
  );
} 