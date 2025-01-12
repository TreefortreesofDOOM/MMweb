'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['collectors_wall', 'added_value_pedestal', 'featured_work', 'trust_wall']),
  price: z.number().min(0, 'Price must be 0 or greater'),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormValues) => Promise<void>;
  initialData?: ProductFormValues;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      type: 'collectors_wall',
      price: 0,
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  const selectedType = form.watch('type');
  const showPriceRange = selectedType === 'trust_wall';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="collectors_wall">Collector's Wall</SelectItem>
                  <SelectItem value="added_value_pedestal">Added Value Pedestal</SelectItem>
                  <SelectItem value="featured_work">Featured Work</SelectItem>
                  <SelectItem value="trust_wall">Trust Wall</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Different product types have different pricing models
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!showPriceRange && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showPriceRange && (
          <>
            <FormField
              control={form.control}
              name="minPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum price must be between $10 and $50
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit">Save Product</Button>
      </form>
    </Form>
  );
} 