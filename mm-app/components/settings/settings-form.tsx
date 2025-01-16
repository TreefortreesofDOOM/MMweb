'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/use-auth';
import { UserSettings, userSettingsSchema } from '@/lib/types/settings-types';
import { defaultSettings, canUpdateRoleSettings } from '@/lib/utils/settings-utils';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Form } from '@/components/ui/form';
import { SettingsSection } from './settings-section';
import { NotificationToggles } from './notification-toggles';
import { useDebounce } from '@/hooks/use-debounce';
import { RetryClaimButton } from '@/components/patron/settings/retry-claim-button';
import { AiPersonalitySelector } from './ai-personality-selector';
import { ThemeSelector } from '@/components/settings/theme-selector';

interface SettingsFormProps {}

export const SettingsForm: FC<SettingsFormProps> = () => {
  const { settings, isLoading, error, updateSettings } = useSettings();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const handleSave = useCallback(async (values: UserSettings) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
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
          current: values.role.current,
          medium: values.role.medium
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
    } finally {
      setIsSaving(false);
    }
  }, [profile?.role, updateSettings, toast, isSaving]);

  // Debounced save function
  const debouncedSave = useDebounce(handleSave, 1000);

  // Watch for form changes in useEffect
  useEffect(() => {
    const subscription = form.watch((formData) => {
      if (formData && !isSaving) {
        debouncedSave(formData as UserSettings);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [form, debouncedSave, isSaving]);

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
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        <SettingsSection title="Preferences">
          <div className="space-y-6">
            <ThemeSelector />
            <AiPersonalitySelector />
          </div>
        </SettingsSection>

        <SettingsSection title="Notifications">
          <NotificationToggles />
        </SettingsSection>

        {profile?.role === 'patron' && (
          <SettingsSection title="Patron Settings">
            <RetryClaimButton />
          </SettingsSection>
        )}
      </form>
    </Form>
  );
}; 