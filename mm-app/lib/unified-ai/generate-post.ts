import { UnifiedAIClient } from '@/lib/ai/unified-client'
import { env } from '@/lib/env'
import { postAsMMai } from './post-mm-ai'
import type { Result } from '@/lib/utils/result'
import { ANALYSIS_PROMPTS } from '@/lib/ai/instructions'
import { AI_TEMPERATURE } from '@/lib/ai/instructions'
import { createActionClient } from '@/lib/supabase/supabase-action-utils'

interface GeneratePostOptions {
  prompt: string
  additionalContext?: string
}

interface GeneratePostResult {
  id: string
  imageUrl: string
  title: string
  description: string
  tags: string[]
  status: {
    step: 'generating' | 'downloading' | 'uploading' | 'analyzing' | 'complete'
    progress?: number
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function uploadToStorage(imageBuffer: Buffer, fileName: string): Promise<string> {
  const supabase = await createActionClient()
  
  const { error: uploadError, data } = await supabase.storage
    .from('artwork-images')
    .upload(fileName, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  // Get the public URL using the getPublicUrl method
  const { data: { publicUrl } } = supabase.storage
    .from('artwork-images')
    .getPublicUrl(fileName)

  return publicUrl
}

/**
 * Generates and posts artwork using the unified AI system
 */
export async function generateAndPost({
  prompt,
  additionalContext = ''
}: GeneratePostOptions): Promise<Result<GeneratePostResult, Error>> {
  try {
    // Initialize AI client using our existing unified system
    const client = new UnifiedAIClient({
      primary: {
        provider: 'chatgpt',
        config: {
          apiKey: env.OPENAI_API_KEY,
          temperature: AI_TEMPERATURE.creative,
          maxTokens: 2048
        }
      }
    })

    // Generate image using DALL-E first
    console.log('Generating image with DALL-E...')
    const tempImageUrl = await client.generateImage(prompt, {
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      model: 'dall-e-3'
    })
    console.log('Image generated:', tempImageUrl)

    // Download the temporary image
    console.log('Downloading image...')
    const imageBuffer = await downloadImage(tempImageUrl)

    // Upload to permanent storage
    console.log('Uploading to permanent storage...')
    const fileName = `mm-ai/${Date.now()}_${prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '_')}.png`
    const permanentImageUrl = await uploadToStorage(imageBuffer, fileName)
    console.log('Permanent URL created:', permanentImageUrl)

    // Analyze the generated image
    console.log('Analyzing image...')
    const imageAnalysis = await client.analyzeImage({
      url: permanentImageUrl,
      mimeType: 'image/png'
    })
    
    // Extract actual content from the analysis
    const description = typeof imageAnalysis.description === 'string' && imageAnalysis.description.includes('```json')
      ? JSON.parse(imageAnalysis.description.split('```json')[1].split('```')[0]).description
      : imageAnalysis.description

    const tags = typeof imageAnalysis.description === 'string' && imageAnalysis.description.includes('```json')
      ? JSON.parse(imageAnalysis.description.split('```json')[1].split('```')[0]).tags
      : imageAnalysis.tags

    console.log('Analysis complete:', { description, tags })

    // Generate creative title based on analysis
    const titleResponse = await client.sendMessage(
      `Create a creative, engaging title for this artwork based on this description: ${description}
      Original prompt: "${prompt}"
      
      Respond with just the title, no additional text.`,
      {
        temperature: AI_TEMPERATURE.creative,
        systemInstruction: 'You are an expert art curator. Create a title that captures the essence of the artwork while being engaging and memorable.'
      }
    )

    // Extract key information
    const title = titleResponse.content.trim()

    // Post the artwork using our existing MM AI posting system
    const postResult = await postAsMMai({
      title,
      description,
      imageUrl: permanentImageUrl,
      prompt,
      tags
    })

    if (!postResult.ok) {
      throw postResult.error
    }

    return {
      ok: true,
      value: {
        id: postResult.value.id,
        imageUrl: permanentImageUrl,
        title,
        description,
        tags,
        status: {
          step: 'complete' as const,
          progress: 100
        }
      }
    }
  } catch (error) {
    console.error('Failed to generate and post artwork:', error)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Failed to generate and post artwork')
    }
  }
} 