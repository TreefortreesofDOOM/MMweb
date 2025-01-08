/**
 * Parameters used for image generation
 */
export interface ArtworkGenerationParameters {
  size?: '1024x1024' | '1024x1792' | '1792x1024'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  model?: 'dall-e-3' | 'dall-e-2'
  [key: string]: unknown // Allow for additional model-specific parameters
}

/**
 * Context information specific to artwork generation
 */
export interface ArtworkGenerationContext {
  model: string
  prompt: string
  parameters: ArtworkGenerationParameters
  negativePrompt?: string
  modelVersion?: string
  [key: string]: unknown // Allow for additional context fields
}

/**
 * Metadata specific to generated artwork
 */
export interface ArtworkGenerationMetadata {
  confidence: number
  model: string
  generation: {
    prompt: string
    parameters: ArtworkGenerationParameters
  }
  accessibility: {
    altText: string
    description: string
  }
  [key: string]: unknown // Allow for additional metadata
} 