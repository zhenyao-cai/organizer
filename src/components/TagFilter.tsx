"use client";

import { useEffect, useState } from "react";
import { PRESET_TAGS, customTagsOnly, tagLabel, tagStyle } from "@/lib/tags";

interface TagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilter({ selected, onChange }: TagFilterProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.tags)) {
          setCustomTags(customTagsOnly(data.tags));
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-ink-light">
        Filter by tag (select multiple)
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            selected.length === 0
              ? "bg-violet text-white"
              : "bg-white text-ink-light ring-1 ring-lavender hover:bg-lavender/30"
          }`}
        >
          All
        </button>
        {PRESET_TAGS.map((preset) => {
          const active = selected.includes(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => toggle(preset.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "ring-2 ring-violet " + tagStyle(preset.id)
                  : tagStyle(preset.id) + " opacity-80 hover:opacity-100"
              }`}
            >
              {active ? "✓ " : ""}
              {preset.label}
            </button>
          );
        })}
        {customTags.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "ring-2 ring-violet " + tagStyle(tag)
                  : tagStyle(tag) + " opacity-80 hover:opacity-100"
              }`}
            >
              {active ? "✓ " : ""}
              {tagLabel(tag)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
