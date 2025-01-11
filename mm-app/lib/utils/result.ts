/**
 * A Result type that represents either a successful value or an error.
 * @template T The type of the success value
 * @template E The type of the error value (defaults to Error)
 */
export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

type SuccessResult<T> = {
  ok: true;
  value: T;
};

type ErrorResult<E> = {
  ok: false;
  error: E;
};

/**
 * Creates a successful Result containing the given value.
 * @example
 * const result = ok("success"); // Result<string, never>
 */
export function ok<T>(value: T): SuccessResult<T> {
  return { ok: true, value };
}

/**
 * Creates an error Result containing the given error.
 * @example
 * const result = err(new Error("failed")); // Result<never, Error>
 */
export function err<E>(error: E): ErrorResult<E> {
  return { ok: false, error };
}

/**
 * Type guard to check if a Result is successful.
 * @example
 * if (isOk(result)) {
 *   console.log(result.value);
 * }
 */
export function isOk<T, E>(result: Result<T, E>): result is SuccessResult<T> {
  return result.ok;
}

/**
 * Type guard to check if a Result is an error.
 * @example
 * if (isErr(result)) {
 *   console.error(result.error);
 * }
 */
export function isErr<T, E>(result: Result<T, E>): result is ErrorResult<E> {
  return !result.ok;
} 