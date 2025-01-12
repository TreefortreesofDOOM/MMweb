'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import type { GalleryDate } from '@/lib/types/gallery-types';

interface DateRangePickerProps {
  onSelect?: (range: DateRange | undefined) => void;
  initialValue?: DateRange;
  currentShowId?: string;
  isDisabled?: boolean;
}

export const DateRangePicker = ({ 
  onSelect, 
  initialValue,
  currentShowId,
  isDisabled 
}: DateRangePickerProps) => {
  const [date, setDate] = React.useState<DateRange | undefined>(initialValue);

  const { data: availableDates } = useQuery({
    queryKey: ['gallery-dates'],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('gallery_dates')
        .select('*')
        .eq('is_available', true)
        .gte('date', new Date().toISOString())
        .order('date');
      return data as GalleryDate[];
    }
  });

  const handleSelect = (range: DateRange | undefined) => {
    if (isDisabled) return;
    setDate(range);
    onSelect?.(range);
  };

  return (
    <Calendar
      mode="range"
      selected={date}
      onSelect={handleSelect}
      disabled={(date) => {
        // If component is disabled, disable all dates
        if (isDisabled) return true;

        if (!availableDates?.length) return false;

        const dateStr = date.toISOString().split('T')[0];

        if (currentShowId && date) {
          const isCurrentSelection = 
            initialValue?.from && 
            initialValue?.to && 
            date >= initialValue.from && 
            date <= initialValue.to;
          
          if (isCurrentSelection) return false;
        }

        return !availableDates.some(d => d.date === dateStr);
      }}
      numberOfMonths={2}
      className="rounded-md border"
    />
  );
}; 