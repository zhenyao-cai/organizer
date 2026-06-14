"use client";

import { useEffect, useState } from "react";
import { PRESET_TAGS, tagLabel, tagStyle } from "@/lib/tags";

interface TagFilterProps {
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export function TagFilter({ selected, onChange }: TagFilterProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.tags)) setCustomTags(data.tags);
      })
      .catch(() => {});
  }, []);

  const extras = customTags.filter(
    (t) => !PRESET_TAGS.some((p) => p.id === t)
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-ink-light">Filter by tag</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            selected === null
              ? "bg-violet text-white"
              : "bg-white text-ink-light ring-1 ring-lavender hover:bg-lavender/30"
          }`}
        >
          All
        </button>
        {PRESET_TAGS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() =>
              onChange(selected === preset.id ? null : preset.id)
            }
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected === preset.id
                ? "ring-2 ring-violet " + tagStyle(preset.id)
                : tagStyle(preset.id) + " opacity-80 hover:opacity-100"
            }`}
          >
            {preset.label}
          </button>
        ))}
        {extras.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(selected === tag ? null : tag)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected === tag
                ? "ring-2 ring-violet " + tagStyle(tag)
                : tagStyle(tag) + " opacity-80 hover:opacity-100"
            }`}
          >
            {tagLabel(tag)}
          </button>
        ))}
      </div>
    </div>
  );
}
