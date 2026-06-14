"use client";

import { useEffect, useState } from "react";
import { customTagsOnly } from "@/lib/tags";

export function useSavedTags() {
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

  const rememberTag = (tag: string) => {
    setCustomTags((prev) =>
      prev.includes(tag) ? prev : [...prev, tag].sort((a, b) => a.localeCompare(b))
    );
  };

  return { customTags, rememberTag };
}
