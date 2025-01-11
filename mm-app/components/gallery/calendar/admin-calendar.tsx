'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { GalleryDate } from '@/lib/types/gallery-types';
import { addDays, format, parseISO, eachDayOfInterval } from 'date-fns';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Database } from '@/lib/types/database.types';
import type { DayProps } from 'react-day-picker';

type GalleryDateRow = Database['public']['Tables']['gallery_dates']['Row'];

const toLocalDate = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
};

export const AdminCalendar = () => {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ date: Date; isAvailable: boolean }[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const { data: availableDates } = useQuery({
    queryKey: ['gallery-dates'],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('gallery_dates')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date');
      return (data || []).map((d: GalleryDateRow) => ({
        date: d.date,
        isAvailable: d.is_available,
        updatedAt: d.updated_at,
        updatedBy: d.updated_by
      })) as GalleryDate[];
    }
  });

  const { mutate: saveChanges, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gallery/dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dates: pendingChanges.map(({ date, isAvailable }) => ({
            date: format(toLocalDate(date), 'yyyy-MM-dd'),
            is_available: isAvailable
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update dates');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Calendar updated successfully');
      setPendingChanges([]);
      queryClient.invalidateQueries({ queryKey: ['gallery-dates'] });
    },
    onError: () => {
      toast.error('Failed to update calendar');
    }
  });

  const handleDateClick = (date: Date) => {
    const dateStr = format(toLocalDate(date), 'yyyy-MM-dd');
    const existingDate = availableDates?.find(d => 
      format(toLocalDate(d.date), 'yyyy-MM-dd') === dateStr
    );
    const isAvailable = existingDate ? !existingDate.isAvailable : true;
    
    setPendingChanges(prev => {
      // Remove any existing changes for this date
      const filtered = prev.filter(p => 
        format(toLocalDate(p.date), 'yyyy-MM-dd') !== dateStr
      );
      // Add the new change
      return [...filtered, { date, isAvailable }];
    });
  };

  const handleDragStart = (date: Date) => {
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleDragMove = (date: Date) => {
    if (isDragging) {
      setDragEnd(date);
    }
  };

  const handleDragEnd = () => {
    if (isDragging && dragStart && dragEnd) {
      const start = dragStart < dragEnd ? dragStart : dragEnd;
      const end = dragStart < dragEnd ? dragEnd : dragStart;
      
      const datesToUpdate = eachDayOfInterval({ start, end });
      
      // Get the state of the first selected date to determine the toggle direction
      const firstDateStr = format(toLocalDate(dragStart), 'yyyy-MM-dd');
      const firstDateInDB = availableDates?.find(d => 
        format(toLocalDate(d.date), 'yyyy-MM-dd') === firstDateStr
      );
      const firstDateInChanges = pendingChanges.find(p => 
        format(toLocalDate(p.date), 'yyyy-MM-dd') === firstDateStr
      );
      
      // If the first date is available (either in DB or pending changes), we'll make all unavailable
      const isFirstDateAvailable = firstDateInChanges 
        ? firstDateInChanges.isAvailable
        : (firstDateInDB?.isAvailable ?? false);

      setPendingChanges(prev => {
        // Remove any existing changes for these dates
        const filtered = prev.filter(p => !datesToUpdate.some(d => 
          format(toLocalDate(d), 'yyyy-MM-dd') === format(toLocalDate(p.date), 'yyyy-MM-dd')
        ));
        // Add the new changes
        const newChanges = datesToUpdate.map(date => ({
          date,
          isAvailable: !isFirstDateAvailable // Toggle based on first date's state
        }));
        return [...filtered, ...newChanges];
      });
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Combine database dates with pending changes
  const effectiveDates = [...(availableDates || [])].map(d => ({
    ...d,
    date: toLocalDate(d.date)
  }));
  
  // Apply pending changes
  pendingChanges.forEach(change => {
    const dateStr = format(toLocalDate(change.date), 'yyyy-MM-dd');
    const index = effectiveDates.findIndex(d => 
      format(toLocalDate(d.date), 'yyyy-MM-dd') === dateStr
    );
    if (index >= 0) {
      effectiveDates[index] = {
        ...effectiveDates[index],
        isAvailable: change.isAvailable
      };
    } else {
      effectiveDates.push({
        date: change.date,
        isAvailable: change.isAvailable,
        updatedAt: new Date().toISOString(),
        updatedBy: null
      });
    }
  });

  const selectedDates = effectiveDates
    .filter(d => d.isAvailable)
    .map(d => toLocalDate(d.date));

  // Calculate preview dates for drag selection
  const previewDates = isDragging && dragStart && dragEnd
    ? eachDayOfInterval({
        start: dragStart < dragEnd ? dragStart : dragEnd,
        end: dragStart < dragEnd ? dragEnd : dragStart
      })
    : [];

  return (
    <div 
      className="space-y-4"
      ref={calendarRef}
      onMouseUp={() => handleDragEnd()}
      onMouseLeave={() => handleDragEnd()}
    >
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={(_, date) => handleDateClick(date)}
        className="rounded-md border"
        disabled={(date) => date < new Date()}
        numberOfMonths={2}
        modifiers={{
          preview: previewDates,
          selected: selectedDates
        }}
        modifiersStyles={{
          preview: { backgroundColor: 'rgba(var(--primary), 0.1)' },
          selected: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
        }}
        components={{
          Day: (props: DayProps) => {
            const isSelected = selectedDates.some(d => 
              format(d, 'yyyy-MM-dd') === format(props.date, 'yyyy-MM-dd')
            );
            return (
              <button
                type="button"
                aria-label={format(props.date, 'PPP')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleDragStart(props.date);
                }}
                onMouseEnter={() => handleDragMove(props.date)}
                className={`h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md ${
                  isSelected ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {props.date.getDate()}
              </button>
            );
          }
        }}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Click a date to toggle its availability, or click and drag to select multiple dates at once.
        </p>
        <div className="flex items-center gap-4">
          {pendingChanges.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {pendingChanges.length} unsaved {pendingChanges.length === 1 ? 'change' : 'changes'}
            </p>
          )}
          <Button 
            onClick={() => saveChanges()} 
            disabled={pendingChanges.length === 0 || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 