export const PRESET_TAGS = [
  { id: "missing", label: "Missing" },
  { id: "need to fix", label: "Need to fix" },
  { id: "need to replace", label: "Need to replace" },
] as const;

export const PRESET_TAG_IDS = PRESET_TAGS.map((t) => t.id);

export function tagLabel(tag: string): string {
  const preset = PRESET_TAGS.find((t) => t.id === tag);
  return preset?.label ?? tag;
}

export function tagStyle(tag: string): string {
  switch (tag) {
    case "missing":
      return "bg-coral/25 text-coral ring-1 ring-coral/30";
    case "need to fix":
      return "bg-peach text-ink ring-1 ring-coral/20";
    case "need to replace":
      return "bg-sky/50 text-ink ring-1 ring-violet/20";
    default:
      return "bg-lavender/40 text-ink ring-1 ring-lavender";
  }
}

export function normalizeTag(input: string): string {
  return input.trim().toLowerCase();
}
