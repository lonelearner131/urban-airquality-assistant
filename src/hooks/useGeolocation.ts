import { useState } from "react";
import { roundCoordinate } from "@/schemas/profile";

export interface GeolocationCoords {
  readonly latitude: number;
  readonly longitude: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPosition = (): void => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: roundCoordinate(pos.coords.latitude),
          longitude: roundCoordinate(pos.coords.longitude),
        });
        setLoading(false);
      },
      () => {
        setError("Unable to obtain location coordinates");
        setLoading(false);
      },
      { timeout: 8000 },
    );
  };

  return { coords, error, loading, requestPosition };
}
