"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { ImageUpload } from "./ImageUpload";
import { IconPicker } from "./IconPicker";
import { ROOM_PRESETS, DEFAULT_ROOT_ICON, DEFAULT_CONTAINER_ICON } from "@/lib/place-icons";
import { getPlaceIcon } from "@/lib/place-icons";

interface PlaceFormProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  isRoot?: boolean;
  onSaved: () => void;
}

export function PlaceForm({
  open,
  onClose,
  parentId,
  isRoot = false,
  onSaved,
}: PlaceFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(
    isRoot ? DEFAULT_ROOT_ICON : DEFAULT_CONTAINER_ICON
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setIcon(isRoot ? DEFAULT_ROOT_ICON : DEFAULT_CONTAINER_ICON);
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, parentId, imageUrl }),
      });
      if (res.ok) {
        reset();
        onSaved();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const presets = isRoot ? ROOM_PRESETS : [];
  const PreviewIcon = getPlaceIcon(icon);

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={isRoot ? "Add a room" : "Add a container"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {presets.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Quick pick
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const PresetIcon = getPlaceIcon(p.icon);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setName(p.name);
                      setIcon(p.icon);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-lavender/40 px-3 py-1.5 text-sm font-medium text-ink hover:bg-lavender transition"
                  >
                    <PresetIcon className="h-4 w-4 text-violet" />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRoot ? "e.g. Kitchen" : "e.g. Closet 1, Drawer 2"}
            className="w-full rounded-xl border border-lavender bg-white px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-violet"
            required
          />
        </div>

        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          label="Photo (optional — overrides icon)"
        />

        {!imageUrl && (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-lavender/20 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet">
                <PreviewIcon className="h-6 w-6" />
              </div>
              <p className="text-sm text-ink-light">
                No photo — this icon will be shown
              </p>
            </div>
            <IconPicker value={icon} onChange={setIcon} isRoot={isRoot} />
          </>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full rounded-2xl bg-violet py-3 font-bold text-white transition hover:bg-violet/90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add"}
        </button>
      </form>
    </Modal>
  );
}
