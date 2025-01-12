export const GALLERY_ERROR_CODES = {
  DATABASE: {
    TRANSACTION_FAILED: 'GALLERY_TRANSACTION_FAILED',
    RECORD_NOT_FOUND: 'GALLERY_RECORD_NOT_FOUND',
    UPDATE_FAILED: 'GALLERY_UPDATE_FAILED',
    INSERT_FAILED: 'GALLERY_INSERT_FAILED',
    FETCH_FAILED: 'GALLERY_FETCH_FAILED'
  },
  VALIDATION: {
    INVALID_DATES: 'GALLERY_INVALID_DATES',
    MISSING_ARTWORKS: 'GALLERY_MISSING_ARTWORKS',
    INVALID_PRICE: 'GALLERY_INVALID_PRICE',
    INVALID_TITLE: 'GALLERY_INVALID_TITLE',
    INVALID_WALL_TYPE: 'GALLERY_INVALID_WALL_TYPE',
    DATE_CONFLICT: 'GALLERY_DATE_CONFLICT'
  },
  AUTHORIZATION: {
    UNAUTHORIZED: 'GALLERY_UNAUTHORIZED',
    INSUFFICIENT_PERMISSIONS: 'GALLERY_INSUFFICIENT_PERMISSIONS'
  }
} as const;

export type GalleryErrorCode = typeof GALLERY_ERROR_CODES[keyof typeof GALLERY_ERROR_CODES][keyof typeof GALLERY_ERROR_CODES[keyof typeof GALLERY_ERROR_CODES]]; 