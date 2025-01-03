/// <reference types="node" />
import { z } from 'zod'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RESEND_API_KEY: string
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      OPENAI_API_KEY: string
      GOOGLE_AI_API_KEY: string
      GEMINI_TEXT_MODEL: string
      GEMINI_VISION_MODEL: string
    }
  }
}

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  GOOGLE_AI_API_KEY: z.string().min(1),
  GEMINI_TEXT_MODEL: z.string().min(1),
  GEMINI_VISION_MODEL: z.string().min(1),
})

export const env = envSchema.parse(process.env) 