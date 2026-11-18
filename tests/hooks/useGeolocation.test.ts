import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "@/hooks/useGeolocation";

describe("useGeolocation", () => {
  const originalGeolocation = globalThis.navigator?.geolocation;

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("sets error when geolocation is not supported by the browser", () => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toBe("Geolocation is not supported by your browser");
    expect(result.current.coords).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("resolves rounded coordinates and invokes callback on success", () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: { latitude: 28.6139, longitude: 77.209 },
      } as GeolocationPosition);
    });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition },
      configurable: true,
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition(onSuccess);
    });

    expect(result.current.coords).toEqual({ latitude: 28.61, longitude: 77.21 });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith({ latitude: 28.61, longitude: 77.21 });
  });

  it("sets error state when getCurrentPosition fails", () => {
    const getCurrentPosition = vi.fn(
      (_success: PositionCallback, error?: PositionErrorCallback | null) => {
        error?.({ code: 1, message: "Permission denied" } as GeolocationPositionError);
      },
    );

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition },
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPosition();
    });

    expect(result.current.error).toBe(
      "Unable to retrieve location. Please search by city name.",
    );
    expect(result.current.coords).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
