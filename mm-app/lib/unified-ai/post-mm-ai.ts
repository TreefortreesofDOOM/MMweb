import { postUnifiedAIArtwork } from './post-artwork'
import type { Result } from '@/lib/utils/result'
import type { MMAIError } from '@/lib/types/admin/mm-ai-types'

/**
 * Simple interface for posting MM AI content
 */
interface SimpleMMPost {
  title: string
  description: string
  imageUrl: string
  prompt: string
  tags?: string[]
}

/**
 * Simplified function to post as MM AI
 */
export async function postAsMMai({
  title,
  description,
  imageUrl,
  prompt,
  tags = []
}: SimpleMMPost): Promise<Result<{ id: string }, MMAIError>> {
  return postUnifiedAIArtwork({
    title,
    description,
    images: [{
      url: imageUrl,
      alt: description
    }],
    tags: [...tags, 'meaning-machine'],
    aiContext: {
      model: 'dall-e-3',
      prompt,
      parameters: {
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      }
    },
    metadata: {
      confidence: 0.95,
      model: 'dall-e-3',
      generation: {
        prompt,
        parameters: {
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }
      },
      accessibility: {
        altText: description,
        description
      }
    }
  })
} 