import { useState } from "react";
import { roundCoordinate } from "@/schemas/profile";

export interface GeolocationCoords {
  readonly latitude: number;
  readonly longitude: number;
}

export interface UseGeolocationResult {
  readonly coords: GeolocationCoords | null;
  readonly error: string | null;
  readonly loading: boolean;
  readonly requestPosition: (onSuccess?: (coords: GeolocationCoords) => void) => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPosition = (onSuccess?: (resolved: GeolocationCoords) => void): void => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const resolved: GeolocationCoords = {
          latitude: roundCoordinate(pos.coords.latitude),
          longitude: roundCoordinate(pos.coords.longitude),
        };
        setCoords(resolved);
        setLoading(false);
        onSuccess?.(resolved);
      },
      () => {
        setError("Unable to retrieve location. Please search by city name.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return { coords, error, loading, requestPosition };
}
