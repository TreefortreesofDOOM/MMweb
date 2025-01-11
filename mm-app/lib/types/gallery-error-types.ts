import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes';

export interface BaseErrorDetails {
  code: string;
  field?: string;
  message: string;
}

export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): BaseErrorDetails {
    return {
      code: this.code,
      field: this.field,
      message: this.message
    };
  }
}

type GalleryErrorCode = 
  | typeof GALLERY_ERROR_CODES.VALIDATION[keyof typeof GALLERY_ERROR_CODES.VALIDATION]
  | typeof GALLERY_ERROR_CODES.AUTHORIZATION[keyof typeof GALLERY_ERROR_CODES.AUTHORIZATION]
  | typeof GALLERY_ERROR_CODES.DATABASE[keyof typeof GALLERY_ERROR_CODES.DATABASE];

export class GalleryError extends BaseError {
  constructor(
    message: string,
    code: GalleryErrorCode,
    field?: string
  ) {
    super(message, code, field);
    this.name = 'GalleryError';
  }
} 