import { describe, expect, it } from "vitest";
import { GeocodingService } from "@/services/geocoding";

describe("GeocodingService", () => {
  it("returns parsed geocode results on success", async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: "New Delhi",
              latitude: 28.6139,
              longitude: 77.209,
              country_code: "IN",
              country: "India",
            },
          ],
        }),
        { status: 200 },
      );

    const service = new GeocodingService(fakeFetch);
    const results = await service.search("Delhi");

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("New Delhi");
    expect(results[0]?.country_code).toBe("IN");
  });

  it("returns empty array for short query (< 2 characters)", async () => {
    const service = new GeocodingService();
    const results = await service.search("d");
    expect(results).toHaveLength(0);
  });

  it("returns empty array if payload schema is invalid", async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ not_results: true }), { status: 200 });

    const service = new GeocodingService(fakeFetch);
    const results = await service.search("Invalid");
    expect(results).toHaveLength(0);
  });
});
