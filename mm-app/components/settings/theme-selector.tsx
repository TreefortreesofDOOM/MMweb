'use client';

import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type UserSettings } from '@/lib/types/settings-types';
import { getThemeWithFallback } from '@/lib/utils/settings-utils';

export const ThemeSelector: FC = () => {
  const { control } = useFormContext<UserSettings>();

  return (
    <FormField
      control={control}
      name="preferences.theme"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Theme</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={getThemeWithFallback(field.value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Choose your preferred theme appearance.
          </FormDescription>
        </FormItem>
      )}
    />
  );
}; 