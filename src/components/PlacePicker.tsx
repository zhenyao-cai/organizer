"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Home } from "lucide-react";
import { PlaceWithPath } from "@/types";
import { formatPath } from "@/lib/utils";
import { PlaceAvatar } from "./PlaceAvatar";

interface PlacePickerProps {
  value: string;
  onChange: (placeId: string) => void;
  excludeId?: string;
  excludeIds?: string[];
  allowRoot?: boolean;
  compact?: boolean;
  label?: string;
}

export function PlacePicker({
  value,
  onChange,
  excludeId,
  excludeIds = [],
  allowRoot = false,
  compact = false,
  label = "Where does this live?",
}: PlacePickerProps) {
  const [places, setPlaces] = useState<PlaceWithPath[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/places/tree")
      .then((r) => r.json())
      .then(setPlaces);
  }, []);

  const filtered = useMemo(() => {
    const blocked = new Set([
      ...excludeIds,
      ...(excludeId ? [excludeId] : []),
    ]);

    let list = places.filter((p) => !blocked.has(p._id));

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          formatPath(p.path).toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      const depthA = a.path.length;
      const depthB = b.path.length;
      if (depthA !== depthB) return depthA - depthB;
      return formatPath(a.path).localeCompare(formatPath(b.path));
    });
  }, [places, query, excludeId, excludeIds]);

  const selected = places.find((p) => p._id === value);

  if (compact && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full rounded-xl bg-sky/40 px-3 py-2.5 text-left text-sm transition hover:bg-sky/60"
      >
        <span className="text-xs font-semibold text-ink-light block mb-1">
          Location
        </span>
        {selected && (
          <span className="inline-flex items-center gap-2">
            <PlaceAvatar
              name={selected.name}
              imageUrl={selected.imageUrl}
              icon={selected.icon}
              size="xs"
            />
            <span className="font-semibold text-ink">
              {formatPath(selected.path)}
            </span>
          </span>
        )}
        <span className="text-xs text-violet font-semibold mt-1 block">
          Tap to change
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {!compact && (
        <label className="block text-sm font-semibold text-ink">{label}</label>
      )}

      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-lavender">
        <Search className="h-4 w-4 text-ink-light shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rooms, closets, drawers..."
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-light"
        />
      </div>

      <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-xl bg-lavender/10 p-1">
        {allowRoot && (
          <button
            type="button"
            onClick={() => {
              onChange("__root__");
              setExpanded(false);
              setQuery("");
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
              value === "__root__"
                ? "bg-violet/25 ring-2 ring-violet"
                : "hover:bg-white/80"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender/50 text-violet">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">Top level</p>
              <p className="text-[11px] text-ink-light">Shows on home as a room</p>
            </div>
          </button>
        )}
        {filtered.length === 0 && !(allowRoot && !query.trim()) ? (
          <p className="px-3 py-4 text-center text-sm text-ink-light">
            No locations found
          </p>
        ) : (
          filtered.map((place) => {
            const depth = place.path.length;
            const isSelected = value === place._id;
            return (
              <button
                key={place._id}
                type="button"
                onClick={() => {
                  onChange(place._id);
                  setExpanded(false);
                  setQuery("");
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                  isSelected
                    ? "bg-violet/25 ring-2 ring-violet"
                    : "hover:bg-white/80"
                }`}
                style={{ paddingLeft: `${8 + (depth - 1) * 14}px` }}
              >
                <PlaceAvatar
                  name={place.name}
                  imageUrl={place.imageUrl}
                  icon={place.icon}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-sm leading-tight">
                    {place.name}
                  </p>
                  {depth > 1 && (
                    <p className="text-[11px] text-ink-light truncate mt-0.5">
                      {formatPath(place.path.slice(0, -1))}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {compact && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-semibold text-ink-light hover:text-ink"
        >
          Done
        </button>
      )}
    </div>
  );
}
