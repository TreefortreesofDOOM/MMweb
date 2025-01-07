import type { FC } from 'react'
import { createCollection } from '@/lib/actions/patron/collection-actions'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import type { Collection } from '@/lib/types/patron-types'

const formSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  isPrivate: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

export const NewCollectionForm: FC = () => {
  const router = useRouter()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
    },
  })

  const onSubmit = async (values: FormData): Promise<void> => {
    try {
      await createCollection({
        name: values.name,
        description: values.description,
        isPrivate: values.isPrivate,
      })
      router.push('/patron/collections')
      router.refresh()
    } catch (error) {
      console.error('Failed to create collection:', error)
      form.setError('root', {
        message: 'Failed to create collection. Please try again.',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Art Collection" 
                  {...field}
                  aria-label="Collection name"
                />
              </FormControl>
              <FormDescription>
                Give your collection a memorable name.
              </FormDescription>
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
                <Textarea
                  placeholder="Describe what makes this collection special..."
                  {...field}
                  aria-label="Collection description"
                />
              </FormControl>
              <FormDescription>
                Optional: Add details about your collection.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Private Collection</FormLabel>
                <FormDescription>
                  Only you can see private collections.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Make collection private"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          aria-label="Create collection"
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Collection'}
        </Button>
      </form>
    </Form>
  )
} 