/**
 * @fileoverview Resilient HTTP client wrapper with configurable timeout, retry, and typed error handling.
 * Avoids uncaught network failures and enforces SLA boundaries on upstream APIs.
 */

import { NETWORK_CONFIG } from "@/domain/constants";
import { TimeoutError, UpstreamServiceError } from "./errors";

export interface RequestOptions extends RequestInit {
  readonly timeoutMs?: number;
  readonly retries?: number;
}

export type FetchFn = typeof fetch;

/**
 * Validates that outbound requests strictly use HTTPS to prevent SSRF over insecure schemes.
 */
function assertHttpsUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UpstreamServiceError(`Invalid URL format: ${url}`);
  }
  if (parsed.protocol !== "https:") {
    throw new UpstreamServiceError(`Blocked non-HTTPS request to ${url}`);
  }
}

/**
 * Performs a single fetch request with an AbortController timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestOptions,
  customFetch: FetchFn,
): Promise<Response> {
  assertHttpsUrl(url);
  const timeoutMs = options.timeoutMs ?? NETWORK_CONFIG.HTTP_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await customFetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      throw new UpstreamServiceError(`HTTP ${res.status} from ${url}`);
    }
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new TimeoutError(`Request timed out after ${timeoutMs}ms for ${url}`);
    }
    if (err instanceof UpstreamServiceError) throw err;
    throw new UpstreamServiceError(`Network error communicating with ${url}`, err);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Executes a resilient HTTP fetch with automatic single retry on transient failures.
 *
 * @param url - Destination endpoint URL.
 * @param options - Request options including timeout and retry count.
 * @param customFetch - Dependency-injected fetch implementation (defaults to global fetch).
 * @returns Parsed JSON response.
 */
export async function resilientFetchJson<T>(
  url: string,
  options: RequestOptions = {},
  customFetch: FetchFn = fetch,
): Promise<T> {
  const maxRetries = options.retries ?? NETWORK_CONFIG.MAX_RETRIES;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      const response = await fetchWithTimeout(url, options, customFetch);
      return (await response.json()) as T;
    } catch (err: unknown) {
      lastError = err;
      attempt++;
      if (attempt > maxRetries) break;
    }
  }

  throw lastError;
}
