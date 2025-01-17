import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes'
import type { BaseErrorDetails, GalleryErrorCode } from '@/lib/types/gallery-error-types'

export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }

  toJSON(): BaseErrorDetails {
    return {
      code: this.code,
      field: this.field,
      message: this.message
    }
  }
}

export class GalleryError extends BaseError {
  constructor(
    message: string,
    code: GalleryErrorCode,
    field?: string
  ) {
    super(message, code, field)
    this.name = 'GalleryError'
  }
} 