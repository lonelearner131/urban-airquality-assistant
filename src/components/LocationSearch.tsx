"use client";

import React, { useEffect, useRef, useState } from "react";
import { Locate, MapPin, Search } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
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

export function toLocationSelection(item: GeocodeResultItem): LocationSelection {
  const name = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
  return {
    name,
    countryCode: item.country_code,
    lat: roundCoordinate(item.latitude),
    lon: roundCoordinate(item.longitude),
  };
}

function SuggestionOption({
  item,
  isSelected,
  onSelect,
}: {
  readonly item: GeocodeResultItem;
  readonly isSelected: boolean;
  readonly onSelect: (item: GeocodeResultItem) => void;
}): React.JSX.Element {
  const label = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
  const activeClass = isSelected ? "bg-sky-50 dark:bg-sky-950/40" : "";
  return (
    <li
      id={`location-option-${item.id}`}
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      tabIndex={-1}
      className={`flex min-h-[44px] w-full cursor-pointer items-center gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-800 last:border-b-0 hover:bg-sky-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-sky-950/40 ${activeClass}`}
    >
      <MapPin className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
      <span>{label}</span>
    </li>
  );
}

function LocationDropdown({
  isOpen,
  suggestions,
  activeIndex,
  onSelect,
}: {
  readonly isOpen: boolean;
  readonly suggestions: readonly GeocodeResultItem[];
  readonly activeIndex: number;
  readonly onSelect: (item: GeocodeResultItem) => void;
}): React.JSX.Element | null {
  if (!isOpen || suggestions.length === 0) return null;
  return (
    <ul
      id="location-suggestions-list"
      role="listbox"
      aria-label="Location suggestions"
      className="absolute left-0 right-0 top-[76px] z-30 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      {suggestions.map((item, idx) => (
        <SuggestionOption
          key={item.id}
          item={item}
          isSelected={idx === activeIndex}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

interface UseGeocodeSuggestionsResult {
  readonly suggestions: readonly GeocodeResultItem[];
  readonly isOpen: boolean;
  readonly setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function useGeocodeSuggestions(query: string): UseGeocodeSuggestionsResult {
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
          const json = (await res.json()) as { results?: readonly GeocodeResultItem[] };
          setSuggestions(json.results ?? []);
          setIsOpen(true);
        }
      } catch {
        setIsOpen(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, isOpen, setIsOpen };
}

interface InputBarProps {
  readonly query: string;
  readonly isOpen: boolean;
  readonly hasSuggestions: boolean;
  readonly activeOptionId?: string | undefined;
  readonly onQueryChange: (val: string) => void;
  readonly onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onFocus: () => void;
  readonly onGeoClick: () => void;
}

function LocationInputBar(props: InputBarProps): React.JSX.Element {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          id="location-search-input"
          type="text"
          role="combobox"
          value={props.query}
          onChange={(e) => props.onQueryChange(e.target.value)}
          onKeyDown={props.onKeyDown}
          onFocus={() => props.hasSuggestions && props.onFocus()}
          placeholder="e.g. New Delhi, Noida, Lahore, London"
          aria-autocomplete="list"
          aria-expanded={props.isOpen}
          aria-controls="location-suggestions-list"
          aria-activedescendant={props.isOpen ? props.activeOptionId : undefined}
          className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <button
        type="button"
        onClick={props.onGeoClick}
        aria-label="Use browser geolocation"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2.5 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Locate className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function handleComboboxKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  isOpen: boolean,
  suggestions: readonly GeocodeResultItem[],
  activeIndex: number,
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onSelect: (item: GeocodeResultItem) => void,
): void {
  if (!isOpen || suggestions.length === 0) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveIndex((prev) => (prev + 1) % suggestions.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
  } else if (e.key === "Enter" && suggestions[activeIndex]) {
    e.preventDefault();
    onSelect(suggestions[activeIndex]);
  } else if (e.key === "Escape") {
    setIsOpen(false);
  }
}

function useSearchHandlers(
  setQuery: (q: string) => void,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
  onSelectLocation: (loc: LocationSelection) => void,
  requestPosition: ReturnType<typeof useGeolocation>["requestPosition"],
) {
  const handleSelect = (item: GeocodeResultItem): void => {
    const loc = toLocationSelection(item);
    setQuery(loc.name);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectLocation(loc);
  };
  const handleGeoClick = (): void =>
    requestPosition(({ latitude, longitude }) => {
      const name = `Location (${latitude}, ${longitude})`;
      setQuery(name);
      setIsOpen(false);
      onSelectLocation({ name, lat: latitude, lon: longitude });
    });
  return { handleSelect, handleGeoClick };
}

interface LayoutProps {
  readonly inputProps: InputBarProps;
  readonly isOpen: boolean;
  readonly suggestions: readonly GeocodeResultItem[];
  readonly activeIndex: number;
  readonly geoError: string | null;
  readonly onSelect: (item: GeocodeResultItem) => void;
}

function LocationSearchLayout({
  inputProps,
  isOpen,
  suggestions,
  activeIndex,
  geoError,
  onSelect,
}: LayoutProps): React.JSX.Element {
  return (
    <div className="relative flex w-full flex-col gap-1.5">
      <label
        htmlFor="location-search-input"
        className="text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        City or Neighborhood Location
      </label>
      <LocationInputBar {...inputProps} />
      {geoError && (
        <span role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {geoError}
        </span>
      )}
      <LocationDropdown
        isOpen={isOpen}
        suggestions={suggestions}
        activeIndex={activeIndex}
        onSelect={onSelect}
      />
    </div>
  );
}

export function LocationSearch({
  onSelectLocation,
  initialLocationName = "",
}: LocationSearchProps): React.JSX.Element {
  const [query, setQuery] = useState(initialLocationName);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, isOpen, setIsOpen } = useGeocodeSuggestions(query);
  const { error: geoError, requestPosition } = useGeolocation();
  const h = useSearchHandlers(setQuery, setIsOpen, setActiveIndex, onSelectLocation, requestPosition);
  const activeItem = activeIndex >= 0 ? suggestions[activeIndex] : undefined;

  const inputProps: InputBarProps = {
    query,
    isOpen,
    hasSuggestions: suggestions.length > 0,
    activeOptionId: activeItem ? `location-option-${activeItem.id}` : undefined,
    onQueryChange: (val) => {
      setQuery(val);
      setActiveIndex(-1);
    },
    onKeyDown: (e) =>
      handleComboboxKey(e, isOpen, suggestions, activeIndex, setActiveIndex, setIsOpen, h.handleSelect),
    onFocus: () => setIsOpen(true),
    onGeoClick: h.handleGeoClick,
  };

  return (
    <LocationSearchLayout
      inputProps={inputProps}
      isOpen={isOpen}
      suggestions={suggestions}
      activeIndex={activeIndex}
      geoError={geoError}
      onSelect={h.handleSelect}
    />
  );
}
