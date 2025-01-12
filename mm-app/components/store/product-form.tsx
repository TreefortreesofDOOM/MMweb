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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/supabase-client';

const productSchema = z.object({
  is_variable_price: z.boolean().default(false),
  min_price: z.number().min(10, 'Minimum price must be at least $10').optional(),
  price: z.number().min(0, 'Price must be 0 or greater').optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  inventory_type: z.enum(['unlimited', 'finite']).default('finite'),
  inventory_quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  artwork: {
    id: string;
    title: string;
    description?: string | null;
    images: { url: string }[];
  };
  product?: {
    id: string;
    is_variable_price: boolean;
    min_price: number | null;
    price: number | null;
    status: string;
    stripe_product_metadata?: {
      inventory?: string;
      inventory_status?: string;
    } | null;
  } | null;
  mode: 'create' | 'edit';
}

export function ProductForm({ artwork, product, mode }: ProductFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_variable_price: product?.is_variable_price || false,
      min_price: product?.min_price || undefined,
      price: product?.price || undefined,
      status: (product?.status as 'draft' | 'published') || 'draft',
      inventory_type: product?.stripe_product_metadata?.inventory ? 'finite' : 'finite',
      inventory_quantity: product?.stripe_product_metadata?.inventory 
        ? parseInt(product.stripe_product_metadata.inventory)
        : 1,
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      if (mode === 'create') {
        const { error } = await supabase
          .from('store_products')
          .insert({
            profile_id: (await supabase.auth.getUser()).data.user?.id,
            artwork_id: artwork.id,
            is_variable_price: data.is_variable_price,
            min_price: data.min_price,
            price: data.price,
            status: data.status,
            stripe_product_metadata: data.inventory_type === 'finite' ? {
              limited_edition: true,
              inventory: data.inventory_quantity?.toString(),
              inventory_status: 'in_stock'
            } : null
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_products')
          .update({
            is_variable_price: data.is_variable_price,
            min_price: data.min_price,
            price: data.price,
            status: data.status,
            stripe_product_metadata: data.inventory_type === 'finite' ? {
              limited_edition: true,
              inventory: data.inventory_quantity?.toString(),
              inventory_status: 'in_stock'
            } : null
          })
          .eq('id', product?.id);

        if (error) throw error;
      }

      router.push('/artist/store');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const isVariablePrice = form.watch('is_variable_price');
  const inventoryType = form.watch('inventory_type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Artwork Details</h3>
          <p className="text-sm text-muted-foreground">
            {artwork.title}
          </p>
          {artwork.description && (
            <p className="text-sm text-muted-foreground">
              {artwork.description}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="is_variable_price"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Variable Price
                </FormLabel>
                <FormDescription>
                  Allow customers to choose their own price above a minimum
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isVariablePrice ? (
          <FormField
            control={form.control}
            name="min_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Minimum price must be at least $10
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="inventory_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="finite">Limited Edition</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose if this is a limited edition with fixed quantity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {inventoryType === 'finite' && (
          <FormField
            control={form.control}
            name="inventory_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Set the total number of editions available
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Draft products are not visible in the store
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
      </form>
    </Form>
  );
} 