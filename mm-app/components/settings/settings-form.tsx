'use client';

import { FC, useCallback } from 'react';
import { useForm, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/use-auth';
import { UserSettings, userSettingsSchema } from '@/lib/types/settings-types';
import { defaultSettings, canUpdateRoleSettings } from '@/lib/utils/settings-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { SettingsSection } from './settings-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AiPersonalitySelector } from './ai-personality-selector';
import { NotificationToggles } from './notification-toggles';
import { MediumSelector } from './medium-selector';
import { useDebounce } from '@/hooks/use-debounce';
import { Sun, Moon, Laptop } from 'lucide-react';

interface SettingsFormProps {}

export const SettingsForm: FC<SettingsFormProps> = () => {
  const { settings, isLoading, error, updateSettings } = useSettings();
  const { profile } = useAuth();
  const { toast } = useToast();

  const form = useForm<UserSettings>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: settings || {
      ...defaultSettings,
      role: {
        ...defaultSettings.role,
        current: profile?.role || defaultSettings.role.current,
      },
    },
  });

  const handleSave = useCallback(async (values: UserSettings) => {
    try {
      // Update preferences
      const preferencesResult = await updateSettings('preferences', values.preferences);
      if (!preferencesResult.success) {
        throw new Error(preferencesResult.error);
      }

      // Update notifications
      const notificationsResult = await updateSettings('notifications', values.notifications);
      if (!notificationsResult.success) {
        throw new Error(notificationsResult.error);
      }

      // Update role settings if user is artist or patron
      const userRole = profile?.role || defaultSettings.role.current;
      if (canUpdateRoleSettings(userRole)) {
        const roleResult = await updateSettings('role', {
          medium: values.role.medium,
          artist_type: values.role.artist_type,
          artist_status: values.role.artist_status,
        });
        if (!roleResult.success) {
          throw new Error(roleResult.error);
        }
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
      });
    }
  }, [profile?.role, updateSettings, toast]);

  // Debounced save function
  const debouncedSave = useDebounce(handleSave, 1000);

  // Watch for form changes and trigger autosave
  form.watch((data) => {
    debouncedSave(data as UserSettings);
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const userRole = profile?.role || defaultSettings.role.current;
  const showMediumSelector = canUpdateRoleSettings(userRole);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <SettingsSection 
          title="Appearance"
          description="Customize how the application looks and feels."
        >
          <FormField
            control={form.control}
            name="preferences.theme"
            render={({ field }: { field: ControllerRenderProps<UserSettings, 'preferences.theme'> }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <div className="relative w-[1.2rem] h-[1.2rem]">
                          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute top-0 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </div>
                        <SelectValue placeholder="Select a theme" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose your preferred theme for the application.
                </FormDescription>
              </FormItem>
            )}
          />
          <AiPersonalitySelector />
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="Manage your notification preferences."
        >
          <NotificationToggles />
        </SettingsSection>

        {showMediumSelector && (
          <SettingsSection
            title="Art Preferences"
            description="Select your preferred art mediums."
          >
            <MediumSelector />
          </SettingsSection>
        )}
      </form>
    </Form>
  );
}; 