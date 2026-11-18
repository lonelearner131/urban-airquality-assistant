import { describe, expect, it } from "vitest";
import {
  InternalAppError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  UpstreamServiceError,
  ValidationError,
  normalizeError,
} from "@/lib/errors";

describe("errors", () => {
  it("maps ValidationError to 400 and code", () => {
    const err = new ValidationError("Invalid coordinates");
    expect(err.httpStatus).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.toResponse().error).toBe("Invalid coordinates");
  });

  it("maps NotFoundError to 404", () => {
    const err = new NotFoundError("Plan not found");
    expect(err.httpStatus).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("maps RateLimitError to 429", () => {
    const err = new RateLimitError("Rate limit reached");
    expect(err.httpStatus).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("maps UpstreamServiceError to 502", () => {
    const err = new UpstreamServiceError("Open-Meteo failure");
    expect(err.httpStatus).toBe(502);
    expect(err.code).toBe("UPSTREAM_SERVICE_ERROR");
  });

  it("maps TimeoutError to 504", () => {
    const err = new TimeoutError("Timed out");
    expect(err.httpStatus).toBe(504);
    expect(err.code).toBe("TIMEOUT_ERROR");
  });

  it("normalizes standard JS Error to InternalAppError (500)", () => {
    const raw = new Error("Boom");
    const normalized = normalizeError(raw);
    expect(normalized.httpStatus).toBe(500);
    expect(normalized.code).toBe("INTERNAL_ERROR");
  });

  it("normalizes non-Error unknown thrown object", () => {
    const normalized = normalizeError("string exception");
    expect(normalized).toBeInstanceOf(InternalAppError);
  });
});
