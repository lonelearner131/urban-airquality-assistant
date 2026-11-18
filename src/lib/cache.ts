/**
 * @fileoverview High-performance in-memory TTL cache for upstream air quality queries.
 * Dampens load against free public APIs and provides immediate cache hits for proximate coordinates.
 */

import { NETWORK_CONFIG } from "@/domain/constants";

interface CacheRecord<T> {
  readonly value: T;
  readonly expiresAt: number;
}

export class MemoryCache<T> {
  private readonly store = new Map<string, CacheRecord<T>>();

  constructor(private readonly defaultTtlMs: number = NETWORK_CONFIG.CACHE_TTL_MS) {}

  public get(key: string): T | null {
    const record = this.store.get(key);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return record.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  public clear(): void {
    this.store.clear();
  }
}

export const airQualityCache = new MemoryCache<unknown>();
