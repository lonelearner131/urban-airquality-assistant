import { describe, expect, it } from "vitest";
import { err, mapResult, ok } from "@/domain/result";

describe("result", () => {
  it("constructs an Ok result", () => {
    const res = ok(42);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(42);
    }
  });

  it("constructs an Err result", () => {
    const res = err(new Error("test failure"));
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toBe("test failure");
    }
  });

  it("maps value when ok is true", () => {
    const res = ok(10);
    const mapped = mapResult(res, (n) => n * 2);
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(20);
    }
  });

  it("preserves error when ok is false", () => {
    const res = err("original error");
    const mapped = mapResult(res, (n: number) => n * 2);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe("original error");
    }
  });
});
