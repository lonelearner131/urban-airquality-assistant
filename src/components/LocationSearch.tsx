"use client";

import React, { useEffect, useRef, useState } from "react";
import { Locate, MapPin, Search } from "lucide-react";
import { roundCoordinate } from "@/schemas/profile";
import type { GeocodeResultItem } from "@/schemas/airQuality";

export interface LocationSelection {
  readonly name: string;
  readonly countryCode?: string | undefined;
  readonly lat: number;
  readonly lon: number;
}

export interface LocationSearchProps {
  readonly onSelectLocation: (loc: LocationSelection) => void;
  readonly initialLocationName?: string;
}

function LocationDropdown({
  isOpen,
  suggestions,
  onSelect,
}: {
  readonly isOpen: boolean;
  readonly suggestions: readonly GeocodeResultItem[];
  readonly onSelect: (item: GeocodeResultItem) => void;
}): React.JSX.Element | null {
  if (!isOpen || suggestions.length === 0) return null;

  return (
    <ul
      id="location-suggestions-list"
      role="listbox"
      className="absolute left-0 right-0 top-[76px] z-30 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      {suggestions.map((item) => (
        <li key={item.id} role="option" aria-selected="false">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex min-h-[44px] w-full items-center gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-800 last:border-b-0 hover:bg-sky-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-sky-950/40"
          >
            <MapPin className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
            <span>{[item.name, item.admin1, item.country].filter(Boolean).join(", ")}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function useGeocodeSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<readonly GeocodeResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.results ?? []);
          setIsOpen(true);
        }
      } catch {
        // Ignored
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, isOpen, setIsOpen };
}

function useCurrentLocation(
  onSelect: (loc: { name: string; lat: number; lon: number }) => void,
  onNameUpdate: (name: string) => void,
) {
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestLocation = (): void => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = roundCoordinate(pos.coords.latitude);
        const lon = roundCoordinate(pos.coords.longitude);
        const locName = `Location (${lat}, ${lon})`;
        onNameUpdate(locName);
        onSelect({ name: locName, lat, lon });
      },
      () => setGeoError("Unable to retrieve location. Please search by city name."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return { geoError, requestLocation };
}

interface InputBarProps {
  readonly query: string;
  readonly isOpen: boolean;
  readonly hasSuggestions: boolean;
  readonly onQueryChange: (val: string) => void;
  readonly onFocus: () => void;
  readonly onGeoClick: () => void;
}

function LocationInputBar({
  query,
  isOpen,
  hasSuggestions,
  onQueryChange,
  onFocus,
  onGeoClick,
}: InputBarProps): React.JSX.Element {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          id="location-search-input"
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => hasSuggestions && onFocus()}
          placeholder="e.g. New Delhi, Noida, Lahore, London"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="location-suggestions-list"
          className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <button
        type="button"
        onClick={onGeoClick}
        aria-label="Use browser geolocation"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2.5 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Locate className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function toLocationSelection(item: GeocodeResultItem): LocationSelection {
  const name = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
  return {
    name,
    countryCode: item.country_code,
    lat: roundCoordinate(item.latitude),
    lon: roundCoordinate(item.longitude),
  };
}

export function LocationSearch({
  onSelectLocation,
  initialLocationName = "",
}: LocationSearchProps): React.JSX.Element {
  const [query, setQuery] = useState(initialLocationName);
  const { suggestions, isOpen, setIsOpen } = useGeocodeSuggestions(query);
  const { geoError, requestLocation } = useCurrentLocation(onSelectLocation, setQuery);

  const handleSelect = (item: GeocodeResultItem): void => {
    const loc = toLocationSelection(item);
    setQuery(loc.name);
    setIsOpen(false);
    onSelectLocation(loc);
  };

  return (
    <div className="relative flex w-full flex-col gap-1.5">
      <label
        htmlFor="location-search-input"
        className="text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        City or Neighborhood Location
      </label>
      <LocationInputBar
        query={query}
        isOpen={isOpen}
        hasSuggestions={suggestions.length > 0}
        onQueryChange={setQuery}
        onFocus={() => setIsOpen(true)}
        onGeoClick={requestLocation}
      />
      {geoError && (
        <span role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {geoError}
        </span>
      )}
      <LocationDropdown isOpen={isOpen} suggestions={suggestions} onSelect={handleSelect} />
    </div>
  );
}
