import { describe, expect, it } from "vitest";
import { getEnv, resetEnvCache } from "@/lib/env";

describe("env", () => {
  it("retrieves validated environment configuration", () => {
    resetEnvCache();
    const env = getEnv();
    expect(env.GEMINI_MODEL).toBeDefined();
    expect(env.NODE_ENV).toBeDefined();
  });

  it("returns cached env on subsequent calls", () => {
    const env1 = getEnv();
    const env2 = getEnv();
    expect(env1).toBe(env2);
  });
});
