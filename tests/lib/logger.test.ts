import { describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  it("emits info and filters out sensitive PII keys", () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.info("Plan generated", {
      profileId: "123",
      latitude: 28.61, // Should be stripped
      email: "test@example.com", // Should be stripped
      safeCount: 5,
    });

    expect(stdoutSpy).toHaveBeenCalled();
    const rawCall = stdoutSpy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(rawCall);

    expect(parsed.message).toBe("Plan generated");
    expect(parsed.level).toBe("info");
    expect(parsed.safeCount).toBe(5);
    expect(parsed.latitude).toBeUndefined();
    expect(parsed.email).toBeUndefined();

    stdoutSpy.mockRestore();
  });

  it("emits error to stderr", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    logger.error("System failure", { code: "500" });

    expect(stderrSpy).toHaveBeenCalled();
    const rawCall = stderrSpy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(rawCall);
    expect(parsed.level).toBe("error");

    stderrSpy.mockRestore();
  });

  it("emits warn to stdout", () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    logger.warn("Transient issue");
    expect(stdoutSpy).toHaveBeenCalled();

    stdoutSpy.mockRestore();
  });
});
