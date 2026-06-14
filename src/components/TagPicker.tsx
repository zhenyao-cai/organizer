"use client";

import { PRESET_TAGS, normalizeTag, tagLabel, tagStyle } from "@/lib/tags";

interface TagPickerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagPicker({ tags, onChange }: TagPickerProps) {
  const toggle = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter((t) => t !== tag));
    } else {
      onChange([...tags, tag]);
    }
  };

  const addCustom = (raw: string) => {
    const tag = normalizeTag(raw);
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-ink">
        Tags <span className="font-normal text-ink-light">(select multiple)</span>
      </label>

      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((preset) => {
          const active = tags.includes(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => toggle(preset.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tagStyle(preset.id)} ${
                active ? "ring-2 ring-violet scale-105" : "opacity-70 hover:opacity-100"
              }`}
            >
              {active ? "✓ " : ""}
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Custom tag..."
          className="flex-1 rounded-xl border border-lavender bg-white px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-violet"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.currentTarget;
              addCustom(input.value);
              input.value = "";
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            addCustom(input.value);
            input.value = "";
          }}
          className="rounded-xl bg-peach px-4 py-2.5 text-sm font-semibold text-ink hover:bg-coral/30 transition"
        >
          Add
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tagStyle(tag)}`}
            >
              {tagLabel(tag)}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
