import { describe, expect, it } from "vitest";
import { MemoryCache } from "@/lib/cache";

describe("MemoryCache", () => {
  it("stores and retrieves cached records", () => {
    const cache = new MemoryCache<string>(5000);
    cache.set("key1", "data1");
    expect(cache.get("key1")).toBe("data1");
  });

  it("returns null for non-existent key", () => {
    const cache = new MemoryCache<string>();
    expect(cache.get("missing")).toBeNull();
  });

  it("expires record after TTL", () => {
    const cache = new MemoryCache<string>(-100); // Immediate expiration
    cache.set("expired_key", "old");
    expect(cache.get("expired_key")).toBeNull();
  });

  it("clears all records", () => {
    const cache = new MemoryCache<number>();
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.get("a")).toBeNull();
    expect(cache.get("b")).toBeNull();
  });
});
