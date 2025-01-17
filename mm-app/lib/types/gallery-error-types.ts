import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes';

export interface BaseErrorDetails {
  code: string;
  field?: string;
  message: string;
}

export type GalleryErrorCode = 
  | typeof GALLERY_ERROR_CODES.VALIDATION[keyof typeof GALLERY_ERROR_CODES.VALIDATION]
  | typeof GALLERY_ERROR_CODES.AUTHORIZATION[keyof typeof GALLERY_ERROR_CODES.AUTHORIZATION]
  | typeof GALLERY_ERROR_CODES.DATABASE[keyof typeof GALLERY_ERROR_CODES.DATABASE]; 