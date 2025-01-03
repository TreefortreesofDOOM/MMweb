'use client';

import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type UserSettings } from '@/lib/types/settings-types';
import { ART_MEDIUMS, getValidArtMediums } from '@/lib/utils/settings-utils';

export const MediumSelector: FC = () => {
  const { control, watch } = useFormContext<UserSettings>();
  const selectedMediums = getValidArtMediums(watch('role.medium'));

  return (
    <FormField
      control={control}
      name="role.medium"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Preferred Art Mediums</FormLabel>
          <FormControl>
            <Command className="overflow-visible bg-transparent">
              <CommandInput placeholder="Search art mediums..." />
              <CommandEmpty>No art medium found.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-auto">
                {ART_MEDIUMS.map(({ value, label }) => (
                  <CommandItem
                    key={value}
                    onSelect={() => {
                      if (selectedMediums.includes(value)) {
                        field.onChange(selectedMediums.filter(medium => medium !== value));
                      } else {
                        field.onChange([...selectedMediums, value]);
                      }
                    }}
                    className={cn(
                      'cursor-pointer',
                      selectedMediums.includes(value) && 'bg-accent'
                    )}
                  >
                    {label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </FormControl>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedMediums.map((medium) => {
              const mediumInfo = ART_MEDIUMS.find(m => m.value === medium);
              if (!mediumInfo) return null;
              
              return (
                <Badge
                  key={medium}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {mediumInfo.label}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => {
                      field.onChange(selectedMediums.filter(m => m !== medium));
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {mediumInfo.label}</span>
                  </button>
                </Badge>
              );
            })}
          </div>
          <FormDescription>
            Select the art mediums you are interested in or specialize in.
          </FormDescription>
        </FormItem>
      )}
    />
  );
}; 