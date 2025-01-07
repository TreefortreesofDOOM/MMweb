"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { CollectionWithItems } from '@/lib/types/patron-types'
import { updateCollectionAction } from '@/lib/actions/patron/collection-form-actions'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
})

interface EditCollectionFormProps {
  collection: CollectionWithItems
}

export function EditCollectionForm({ collection }: EditCollectionFormProps) {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || '',
      isPrivate: collection.is_private || false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateCollectionAction({
        id: collection.id,
        ...values,
      })
      router.push(`/patron/collections/${collection.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to update collection:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Private Collection</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
} 