import { z } from 'zod'

export const aiProviderSchema = z.enum(['chatgpt', 'gemini'])

export const aiSettingsSchema = z.object({
  id: z.string().uuid(),
  primary_provider: aiProviderSchema,
  fallback_provider: aiProviderSchema.nullable(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date())
})

export type AIProvider = z.infer<typeof aiProviderSchema>
export type AISettings = z.infer<typeof aiSettingsSchema> 