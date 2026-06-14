"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Star, Package } from "lucide-react";
import Link from "next/link";
import { ItemWithPath, PlaceWithPath } from "@/types";
import { formatPath } from "@/lib/utils";
import { tagLabel, tagStyle } from "@/lib/tags";
import { PlaceAvatar } from "./PlaceAvatar";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    places: PlaceWithPath[];
    items: ItemWithPath[];
  } | null>(null);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (res.ok && data.places && data.items) {
      setResults(data);
    } else {
      setResults({ places: [], items: [] });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const hasResults =
    results && (results.places.length > 0 || results.items.length > 0);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 card-shadow">
        <Search className="h-5 w-5 text-violet shrink-0" />
        <input
          type="text"
          placeholder="Search items, places, tags..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-ink placeholder:text-ink-light outline-none"
        />
      </div>

      {open && query.trim() && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 card-shadow">
            {!hasResults && (
              <p className="px-3 py-4 text-center text-sm text-ink-light">
                No results found
              </p>
            )}
            {results?.places.map((place) => (
              <Link
                key={place._id}
                href={`/place/${place._id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-lavender/40 transition"
              >
                <PlaceAvatar
                  name={place.name}
                  imageUrl={place.imageUrl}
                  icon={place.icon}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">{place.name}</p>
                  <p className="text-xs text-ink-light truncate">
                    {formatPath(place.path)}
                  </p>
                </div>
              </Link>
            ))}
            {results?.items.map((item) => (
              <Link
                key={item._id}
                href={`/place/${item.placeId}?item=${item._id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-mint/40 transition"
              >
                {item.starred ? (
                  <Star className="h-4 w-4 text-coral fill-coral shrink-0" />
                ) : (
                  <Package className="h-4 w-4 text-sage shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">{item.name}</p>
                  <p className="text-xs text-ink-light truncate">
                    {formatPath(item.path)}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tagStyle(tag)}`}
                        >
                          {tagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
