/**
 * @fileoverview Typed Application Error hierarchy and HTTP status code mapping.
 * Guarantees uniform error representations across domain, services, and route handlers.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "UPSTREAM_SERVICE_ERROR"
  | "TIMEOUT_ERROR"
  | "INTERNAL_ERROR";

export abstract class AppError extends Error {
  public abstract readonly code: ErrorCode;
  public abstract readonly httpStatus: number;

  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toResponse(): { error: string; code: ErrorCode } {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

export class ValidationError extends AppError {
  public override readonly code = "VALIDATION_ERROR";
  public override readonly httpStatus = 400;
}

export class NotFoundError extends AppError {
  public override readonly code = "NOT_FOUND";
  public override readonly httpStatus = 404;
}

export class RateLimitError extends AppError {
  public override readonly code = "RATE_LIMIT_EXCEEDED";
  public override readonly httpStatus = 429;
}

export class UpstreamServiceError extends AppError {
  public override readonly code = "UPSTREAM_SERVICE_ERROR";
  public override readonly httpStatus = 502;
}

export class TimeoutError extends AppError {
  public override readonly code = "TIMEOUT_ERROR";
  public override readonly httpStatus = 504;
}

export class InternalAppError extends AppError {
  public override readonly code = "INTERNAL_ERROR";
  public override readonly httpStatus = 500;
}

/**
 * Maps any caught exception into a safe, structured AppError.
 */
export function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }
  const message = err instanceof Error ? err.message : "An unexpected server error occurred";
  return new InternalAppError(message, err);
}
