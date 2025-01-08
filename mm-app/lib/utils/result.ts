/**
 * A type that represents either a success value of type T or an error value of type E
 */
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Creates a success Result with the given value
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

/**
 * Creates an error Result with the given error
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

/**
 * Type guard to check if a Result is a success
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok
}

/**
 * Type guard to check if a Result is an error
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok
} 