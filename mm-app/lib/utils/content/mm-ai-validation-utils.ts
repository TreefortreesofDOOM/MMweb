import { ok, err, type Result } from '@/lib/utils/core/result-utils'
import type { MMAIError, PostArtworkParams } from '@/lib/types/mm-ai-types'

const MAX_TITLE_LENGTH = 500
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_TAG_LENGTH = 50
const MAX_TAGS = 20
const MAX_IMAGES = 10
const MAX_IMAGE_SIZE = 10_000_000 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const validateTitle = (title: string): Result<string, MMAIError> => {
  if (!title.trim()) {
    return err({
      code: 'INVALID_INPUT',
      message: 'Title is required',
      details: { field: 'title' }
    })
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return err({
      code: 'INVALID_INPUT',
      message: `Title must be less than ${MAX_TITLE_LENGTH} characters`,
      details: { field: 'title', maxLength: MAX_TITLE_LENGTH }
    })
  }

  return ok(title.trim())
}

export const validateDescription = (description?: string): Result<string | undefined, MMAIError> => {
  if (!description) return ok(undefined)

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return err({
      code: 'INVALID_INPUT',
      message: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`,
      details: { field: 'description', maxLength: MAX_DESCRIPTION_LENGTH }
    })
  }

  return ok(description.trim())
}

export const validateTags = (tags?: string[]): Result<string[] | undefined, MMAIError> => {
  if (!tags?.length) return ok(undefined)

  if (tags.length > MAX_TAGS) {
    return err({
      code: 'INVALID_INPUT',
      message: `Maximum ${MAX_TAGS} tags allowed`,
      details: { field: 'tags', maxTags: MAX_TAGS }
    })
  }

  const validatedTags = tags.map(tag => tag.trim()).filter(Boolean)
  const invalidTags = validatedTags.filter(tag => tag.length > MAX_TAG_LENGTH)

  if (invalidTags.length) {
    return err({
      code: 'INVALID_INPUT',
      message: `Tags must be less than ${MAX_TAG_LENGTH} characters`,
      details: { field: 'tags', invalidTags, maxLength: MAX_TAG_LENGTH }
    })
  }

  return ok(validatedTags)
}

export const validateImages = async (
  images: PostArtworkParams['images']
): Promise<Result<PostArtworkParams['images'], MMAIError>> => {
  if (!images?.length) {
    return err({
      code: 'INVALID_INPUT',
      message: 'At least one image is required',
      details: { field: 'images' }
    })
  }

  if (images.length > MAX_IMAGES) {
    return err({
      code: 'INVALID_INPUT',
      message: `Maximum ${MAX_IMAGES} images allowed`,
      details: { field: 'images', maxImages: MAX_IMAGES }
    })
  }

  // Validate each image
  for (const image of images) {
    if (!image.alt?.trim()) {
      return err({
        code: 'ACCESSIBILITY_ERROR',
        message: 'Alt text is required for all images',
        details: { field: 'images', image }
      })
    }

    try {
      const response = await fetch(image.url, { method: 'HEAD' })
      
      if (!response.ok) {
        return err({
          code: 'INVALID_INPUT',
          message: 'Image URL is invalid or inaccessible',
          details: { field: 'images', url: image.url }
        })
      }

      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')

      if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
        return err({
          code: 'INVALID_INPUT',
          message: `Image type must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          details: { field: 'images', contentType, url: image.url }
        })
      }

      if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
        return err({
          code: 'INVALID_INPUT',
          message: `Image must be less than ${MAX_IMAGE_SIZE / 1_000_000}MB`,
          details: { field: 'images', size: contentLength, url: image.url }
        })
      }
    } catch (error) {
      return err({
        code: 'IMAGE_PROCESSING_ERROR',
        message: 'Failed to validate image',
        details: { field: 'images', url: image.url, error }
      })
    }
  }

  return ok(images)
}

export const validateParams = async (
  params: PostArtworkParams
): Promise<Result<PostArtworkParams, MMAIError>> => {
  // Early returns for each validation
  const titleResult = validateTitle(params.title)
  if (!titleResult.ok) return titleResult

  const descriptionResult = await validateDescription(params.description)
  if (!descriptionResult.ok) return descriptionResult

  const tagsResult = await validateTags(params.tags)
  if (!tagsResult.ok) return tagsResult

  const imagesResult = await validateImages(params.images)
  if (!imagesResult.ok) return imagesResult

  return ok({
    ...params,
    title: titleResult.value,
    description: descriptionResult.value,
    tags: tagsResult.value,
    images: imagesResult.value
  })
} 