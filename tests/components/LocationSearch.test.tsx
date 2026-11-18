import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocationSearch } from "@/components/LocationSearch";

describe("LocationSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("fetches and selects a location suggestion via click and keyboard", async () => {
    const onSelect = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: "New Delhi",
              admin1: "Delhi",
              country: "India",
              country_code: "IN",
              latitude: 28.6139,
              longitude: 77.209,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    render(<LocationSearch onSelectLocation={onSelect} initialLocationName="" />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Delhi" } });

    await vi.advanceTimersByTimeAsync(350);

    const option = await screen.findByRole("option");
    expect(option).toHaveTextContent("New Delhi, Delhi, India");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith({
      name: "New Delhi, Delhi, India",
      countryCode: "IN",
      lat: 28.61,
      lon: 77.21,
    });
  });

  it("handles browser geolocation success and error states", async () => {
    const onSelect = vi.fn();
    const getCurrentPositionMock = vi.fn((success: PositionCallback) => {
      success({
        coords: { latitude: 19.076, longitude: 72.8777 },
      } as GeolocationPosition);
    });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
    });

    render(<LocationSearch onSelectLocation={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /use browser geolocation/i }));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({
        name: "Location (19.08, 72.88)",
        lat: 19.08,
        lon: 72.88,
      });
    });
  });
});
