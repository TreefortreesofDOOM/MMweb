'use client';

import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type UserSettings } from '@/lib/types/settings-types';
import { AI_PERSONALITIES, getAiPersonalityWithFallback } from '@/lib/utils/settings-utils';

export const AiPersonalitySelector: FC = () => {
  const { control } = useFormContext<UserSettings>();

  return (
    <FormField
      control={control}
      name="preferences.aiPersonality"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Assistant Personality</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={getAiPersonalityWithFallback(field.value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an AI personality" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(AI_PERSONALITIES).map(([value, { name, description }]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex flex-col">
                    <span>{name}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Choose the personality of your AI assistant.
          </FormDescription>
        </FormItem>
      )}
    />
  );
}; 