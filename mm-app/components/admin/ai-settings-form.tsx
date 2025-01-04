'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { updateAISettings } from '@/lib/actions/ai-settings-actions'
import { AIProvider, AISettings, aiProviderSchema } from '@/lib/types/ai-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  primary_provider: aiProviderSchema,
  fallback_provider: aiProviderSchema.nullable(),
})

type FormSchema = z.infer<typeof formSchema>

interface AISettingsFormProps {
  settings: AISettings | null
}

export function AISettingsForm({ settings }: AISettingsFormProps) {
  const { toast } = useToast()
  
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primary_provider: settings?.primary_provider ?? 'chatgpt',
      fallback_provider: settings?.fallback_provider ?? null,
    },
  })

  const handleSubmit = async (values: FormSchema) => {
    try {
      const result = await updateAISettings({
        ...values,
        id: settings?.id,
      })

      if (result.success) {
        toast({
          title: 'Settings updated',
          description: 'AI provider settings have been updated successfully.',
        })
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI provider settings.',
        variant: 'destructive',
      })
    }
  }

  const providers: AIProvider[] = ['chatgpt', 'gemini']

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="primary_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Provider</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select primary provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fallback_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fallback Provider (Optional)</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select fallback provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
} 