import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes'
import type { BaseErrorDetails, GalleryErrorCode } from '@/lib/types/gallery-error-types'

/**
 * Base error class for application errors
 */
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

/**
 * Gallery-specific error class
 */
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

/**
 * Error log types
 */
export type ErrorLogType = 
  | 'error'   // Serious errors that need immediate attention
  | 'warn'    // Warning conditions
  | 'info'    // Informational messages
  | 'debug'   // Debug-level messages
  | 'auth'    // Authentication related messages
  | 'validation' // Input validation issues
  | 'database'   // Database operation issues
  | 'data'       // Data processing issues

/**
 * Error log interface
 */
export interface ErrorLog {
  code: string
  message: string
  context: string
  type: ErrorLogType
  timestamp: string
  userId?: string
  metadata?: Record<string, unknown>
}

/**
 * Error handling service
 */
export class ErrorService {
  private static instance: ErrorService

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  /**
   * Log an error with standardized formatting
   */
  public logError(error: ErrorLog): void {
    const logData = {
      ...error,
      timestamp: error.timestamp || new Date().toISOString()
    }

    switch (error.type) {
      case 'debug':
        console.debug('[Debug]', logData)
        break
      case 'info':
        console.info('[Info]', logData)
        break
      case 'warn':
        console.warn('[Warning]', logData)
        break
      case 'error':
        console.error('[Error]', logData)
        break
      case 'auth':
        console.info('[Auth]', logData)
        break
      case 'validation':
        console.warn('[Validation]', logData)
        break
      case 'database':
        console.error('[Database]', logData)
        break
      case 'data':
        console.warn('[Data]', logData)
        break
      default:
        console.log('[Log]', logData)
    }
  }

  /**
   * Log an authentication error with standard format
   */
  public logAuthError(
    code: string,
    message: string,
    context: string,
    metadata?: Record<string, unknown>,
    userId?: string
  ): void {
    this.logError({
      code,
      message,
      type: 'auth',
      context,
      timestamp: new Date().toISOString(),
      ...(userId && { userId }),
      ...(metadata && { metadata })
    })
  }

  /**
   * Create a gallery error with proper error code
   */
  public createGalleryError(
    message: string,
    code: GalleryErrorCode,
    field?: string
  ): GalleryError {
    return new GalleryError(message, code, field)
  }

  /**
   * Check if an error is a gallery error
   */
  public isGalleryError(error: unknown): error is GalleryError {
    return error instanceof GalleryError
  }

  /**
   * Format error for client response
   */
  public formatErrorResponse(error: unknown): BaseErrorDetails {
    if (error instanceof BaseError) {
      return error.toJSON()
    }

    return {
      code: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 