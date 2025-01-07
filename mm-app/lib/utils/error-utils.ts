import type { ErrorLog } from '@/lib/types/errors'

export function logError(error: ErrorLog): void {
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
    default:
      console.log('[Log]', logData)
  }
} 