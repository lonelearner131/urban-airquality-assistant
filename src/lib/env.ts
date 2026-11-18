import "server-only";
import { z } from "zod";

/**
 * @fileoverview Centralized, server-only environment variable validation.
 * Sole authorized gateway for reading process.env in the entire codebase.
 */

const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().trim().min(1).optional(),
  GEMINI_MODEL: z.string().trim().default(DEFAULT_GEMINI_MODEL),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates and retrieves server-side environment variables.
 * Caches the parsed object after initial validation.
 *
 * @returns Validated environment configuration.
 */
export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Environment variable validation failure: ${errorDetails}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Resets cached env (used during unit testing).
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}
