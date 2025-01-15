'use client';

import { useSettings } from '@/hooks/use-settings';
import { AI_PERSONALITIES } from '@/lib/utils/settings-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

export const AiPersonalitySelector = () => {
  const { updateAiPersonality } = useSettings();
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="preferences.aiPersonality"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Personality</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value: "HAL9000" | "GLADOS" | "JARVIS") => {
                field.onChange(value);
                updateAiPersonality(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a personality" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AI_PERSONALITIES).map(([key, { name, description }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{name}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            Choose the personality of your AI assistant
          </FormDescription>
        </FormItem>
      )}
    />
  );
}; 