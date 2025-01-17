'use client';

import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { type UserSettings, type NotificationSettings } from '@/lib/types/settings-types';
import { NOTIFICATION_TYPES, getNotificationSettingsWithDefaults } from '@/lib/utils/user/settings-utils';

type NotificationKey = keyof NotificationSettings;

export const NotificationToggles: FC = () => {
  const { control, getValues } = useFormContext<UserSettings>();
  const notifications = getNotificationSettingsWithDefaults(getValues('notifications'));

  return (
    <div className="space-y-4">
      {(Object.entries(NOTIFICATION_TYPES) as [NotificationKey, { label: string; description: string }][]).map(([key, { label, description }]) => (
        <FormField
          key={key}
          control={control}
          name={`notifications.${key}` as const}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{label}</FormLabel>
                <FormDescription>{description}</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? notifications[key]}
                  onCheckedChange={field.onChange}
                  aria-label={`Toggle ${label}`}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}; 