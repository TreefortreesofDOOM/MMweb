'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { DateRangePicker } from './calendar/date-picker';
import { ArtworkSelector } from './artwork-selector';
import { GalleryErrorBoundary } from './error-boundary';
import { createGalleryShow, updateGalleryShow } from '@/lib/actions/gallery';
import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes';
import { GalleryError } from '@/lib/utils/error/error-service-utils';
import type { GalleryShow, GalleryShowWithDetails } from '@/lib/types/gallery-types';
import type { DateRange } from 'react-day-picker';

const showFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  artworkIds: z.array(z.string()).min(1, 'At least one artwork is required')
});

type ShowFormValues = z.infer<typeof showFormSchema>;

interface GalleryShowFormProps {
  show?: GalleryShowWithDetails;
  onSuccess?: () => void;
}

export const GalleryShowForm = ({ show, onSuccess }: GalleryShowFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const form = useForm<ShowFormValues>({
    resolver: zodResolver(showFormSchema),
    defaultValues: {
      title: show?.title || '',
      startDate: show?.start_date ? format(new Date(show.start_date), 'yyyy-MM-dd') : '',
      endDate: show?.end_date ? format(new Date(show.end_date), 'yyyy-MM-dd') : '',
      artworkIds: show?.artworks?.map(({ artwork }) => artwork.id) || []
    }
  });

  const onSubmit = async (data: ShowFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (show?.id) {
        await updateGalleryShow(show.id, data as GalleryShow);
        toast.success('Gallery show updated successfully');
      } else {
        await createGalleryShow(data as GalleryShow);
        toast.success('Gallery show created successfully', {
          description: 'Your show has been submitted for approval.'
        });
        form.reset();
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/artist/gallery/shows?status=success');
      }
      
    } catch (error) {
      if (error instanceof GalleryError) {
        // Handle specific error codes
        switch (error.code) {
          case GALLERY_ERROR_CODES.VALIDATION.INVALID_DATES:
          case GALLERY_ERROR_CODES.VALIDATION.DATE_CONFLICT:
            form.setError('endDate', { message: error.message });
            break;
          case GALLERY_ERROR_CODES.VALIDATION.MISSING_ARTWORKS:
            form.setError('artworkIds', { message: error.message });
            break;
          case GALLERY_ERROR_CODES.VALIDATION.INVALID_TITLE:
            form.setError('title', { message: error.message });
            break;
          default:
            toast.error(error.message);
        }
      } else {
        toast.error(show?.id ? 'Failed to update show' : 'Failed to create show');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      form.setValue('startDate', format(range.from, 'yyyy-MM-dd'));
      form.setValue('endDate', format(range.to, 'yyyy-MM-dd'));
    } else {
      form.setValue('startDate', '');
      form.setValue('endDate', '');
    }
  };

  const startDate = form.getValues('startDate');
  const endDate = form.getValues('endDate');
  const initialDateRange: DateRange | undefined = startDate && endDate
    ? {
        from: new Date(startDate),
        to: new Date(endDate)
      }
    : undefined;

  return (
    <GalleryErrorBoundary>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter show title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Show Dates</FormLabel>
              <DateRangePicker
                onSelect={handleDateSelect}
                initialValue={initialDateRange}
                currentShowId={show?.id}
                isDisabled={show?.status === 'approved'}
              />
              <FormDescription>
                {show?.status === 'approved' 
                  ? 'Show dates cannot be modified after approval. Please contact admin for any date changes.'
                  : 'Select the start and end dates for your show'
                }
              </FormDescription>
              {(form.formState.errors.startDate || form.formState.errors.endDate) && (
                <FormMessage>
                  {form.formState.errors.startDate?.message || form.formState.errors.endDate?.message}
                </FormMessage>
              )}
            </div>

            <FormField
              control={form.control}
              name="artworkIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Artworks</FormLabel>
                  <FormControl>
                    <ArtworkSelector
                      selectedIds={field.value}
                      onSelect={(ids) => form.setValue('artworkIds', ids)}
                      showWallType
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (show?.id ? 'Updating Show...' : 'Creating Show...') : (show?.id ? 'Update Show' : 'Create Show')}
          </Button>
        </form>
      </Form>
    </GalleryErrorBoundary>
  );
}; 