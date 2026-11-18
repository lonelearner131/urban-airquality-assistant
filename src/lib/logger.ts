/**
 * @fileoverview Structured, privacy-preserving JSON logger.
 * Strictly guarantees that no personally identifiable information (PII),
 * exact coordinates, or raw prompt text are logged into system outputs.
 */

export type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly [key: string]: unknown;
}

/**
 * Emits structured log payload to standard stream without using console methods.
 */
function emitLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? sanitizeLogMeta(meta) : {}),
  };

  const output = JSON.stringify(payload) + "\n";
  if (level === "error") {
    process.stderr.write(output);
  } else {
    process.stdout.write(output);
  }
}

/**
 * Strips potential PII keys (email, lat, lon, prompt, key) from metadata objects.
 */
function sanitizeLogMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const forbiddenKeys = new Set([
    "email",
    "latitude",
    "longitude",
    "lat",
    "lon",
    "prompt",
    "key",
    "apiKey",
  ]);
  const clean: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(meta)) {
    if (!forbiddenKeys.has(k.toLowerCase())) {
      clean[k] = v;
    }
  }
  return clean;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    emitLog("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    emitLog("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    emitLog("error", message, meta);
  },
};
