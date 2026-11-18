import { describe, expect, it } from "vitest";
import { resilientFetchJson } from "@/lib/http";
import { TimeoutError, UpstreamServiceError } from "@/lib/errors";

describe("http resilientFetchJson", () => {
  it("resolves JSON on successful 200 response", async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ status: "ok", aqi: 180 }), { status: 200 });

    const data = await resilientFetchJson<{ status: string; aqi: number }>(
      "https://api.example.com",
      {},
      fakeFetch,
    );
    expect(data.status).toBe("ok");
    expect(data.aqi).toBe(180);
  });

  it("retries and succeeds on subsequent attempt", async () => {
    let callCount = 0;
    const fakeFetch: typeof fetch = async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Temporary connection reset");
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    };

    const data = await resilientFetchJson<{ success: boolean }>(
      "https://api.example.com",
      { retries: 1 },
      fakeFetch,
    );
    expect(data.success).toBe(true);
    expect(callCount).toBe(2);
  });

  it("throws UpstreamServiceError on HTTP 500 error", async () => {
    const fakeFetch: typeof fetch = async () => new Response("Server Error", { status: 500 });

    await expect(
      resilientFetchJson("https://api.example.com", { retries: 0 }, fakeFetch),
    ).rejects.toBeInstanceOf(UpstreamServiceError);
  });

  it("throws TimeoutError when aborted", async () => {
    const fakeFetch: typeof fetch = async (_url, init) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("Abort");
          err.name = "AbortError";
          reject(err);
        });
      });
    };

    await expect(
      resilientFetchJson("https://api.example.com", { timeoutMs: 20, retries: 0 }, fakeFetch),
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});
