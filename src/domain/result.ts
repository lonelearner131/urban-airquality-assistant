/**
 * @fileoverview Pure Result monad / discriminated union for deterministic error handling.
 * Avoids throwing exceptions across domain boundaries, making failures explicit and
 * statically verifiable by the TypeScript compiler.
 */

/**
 * Successful result representation.
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Failure result representation holding a typed error.
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Discriminated union representing either a successful value or a typed failure.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Constructs an Ok result.
 *
 * @param value - The value of the successful operation.
 * @returns An Ok result wrapping the provided value.
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Constructs an Err result.
 *
 * @param error - The typed domain or application error.
 * @returns An Err result wrapping the error.
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Maps the value of a successful result, leaving errors untouched.
 *
 * @param result - The target result to transform.
 * @param fn - Pure mapping function.
 * @returns A transformed Result.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}
