"use client";

import { PLACE_ICONS, CONTAINER_ICONS, ROOM_PRESETS } from "@/lib/place-icons";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  isRoot?: boolean;
}

export function IconPicker({ value, onChange, isRoot = false }: IconPickerProps) {
  const icons = isRoot
    ? [...new Set(ROOM_PRESETS.map((p) => p.icon))]
    : CONTAINER_ICONS;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        Icon <span className="font-normal text-ink-light">(if no photo)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {icons.map((iconName) => {
          const Icon = PLACE_ICONS[iconName];
          if (!Icon) return null;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                value === iconName
                  ? "bg-violet/30 ring-2 ring-violet text-violet"
                  : "bg-lavender/30 text-ink-light hover:bg-lavender/50 hover:text-violet"
              }`}
              title={iconName}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
