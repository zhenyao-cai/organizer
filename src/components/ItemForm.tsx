"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { ImageUpload } from "./ImageUpload";
import { MoveItemDialog } from "./MoveItemDialog";
import { PlacePicker } from "./PlacePicker";
import { Item, PathSegment } from "@/types";
import { formatPath } from "@/lib/utils";
import { Star, ArrowRightLeft, Trash2 } from "lucide-react";
import Image from "next/image";

interface ItemFormProps {
  open: boolean;
  onClose: () => void;
  placeId: string;
  item?: Item | null;
  onSaved: () => void;
  onDeleted?: () => void;
  pickLocationFirst?: boolean;
}

export function ItemForm({
  open,
  onClose,
  placeId,
  item,
  onSaved,
  onDeleted,
  pickLocationFirst = false,
}: ItemFormProps) {
  const isEdit = !!item;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [starred, setStarred] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [path, setPath] = useState<PathSegment[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(placeId);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setTags(item.tags);
      setStarred(item.starred);
      setImageUrl(item.imageUrl);
      setSelectedPlaceId(item.placeId);
      fetch(`/api/items/${item._id}`)
        .then((r) => r.json())
        .then((d) => setPath(d.path || []));
    } else {
      setName("");
      setDescription("");
      setTags([]);
      setStarred(false);
      setImageUrl(null);
      setSelectedPlaceId(placeId);
      setPath([]);
      fetch(`/api/places/${placeId}`)
        .then((r) => r.json())
        .then((d) => setPath(d.path || []));
    }
    setShowLocationPicker(pickLocationFirst && !item);
  }, [open, item, placeId, pickLocationFirst]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const body = {
        name,
        description,
        tags,
        starred,
        imageUrl,
        placeId: isEdit ? item!.placeId : selectedPlaceId,
      };

      const res = await fetch(
        isEdit ? `/api/items/${item!._id}` : "/api/items",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm("Delete this item?")) return;
    const res = await fetch(`/api/items/${item._id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted?.();
      onClose();
    }
  };

  const handleMove = async (newPlaceId: string) => {
    if (!item) return;
    const res = await fetch(`/api/items/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: newPlaceId }),
    });
    if (res.ok) {
      onSaved();
      onClose();
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? "Edit item" : "Add item"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              {showLocationPicker ? (
                <PlacePicker
                  value={selectedPlaceId}
                  onChange={(id) => {
                    setSelectedPlaceId(id);
                    fetch(`/api/places/${id}`)
                      .then((r) => r.json())
                      .then((d) => setPath(d.path || []));
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full rounded-xl bg-sky/40 px-3 py-2.5 text-left transition hover:bg-sky/60"
                >
                  <span className="text-xs font-semibold text-ink-light block">
                    Saving to
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {path.length > 0 ? formatPath(path) : "This location"}
                  </span>
                  <span className="text-xs text-violet font-semibold mt-1 block">
                    Tap to pick a different container
                  </span>
                </button>
              )}
            </div>
          )}

          {isEdit && path.length > 0 && (
            <p className="rounded-xl bg-sky/50 px-3 py-2 text-xs text-ink-light">
              📍 {formatPath(path)}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Old phone, Winter jacket"
              className="w-full rounded-xl border border-lavender bg-white px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-violet"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
              className="w-full rounded-xl border border-lavender bg-white px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-violet resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="electronics, winter..."
                className="flex-1 rounded-xl border border-lavender bg-white px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-violet"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-peach px-4 py-2.5 text-sm font-semibold text-ink hover:bg-coral/30 transition"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-peach px-2.5 py-1 text-xs font-medium text-ink"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-coral"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStarred(!starred)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
              starred
                ? "bg-coral/20 text-coral"
                : "bg-lavender/30 text-ink-light hover:bg-lavender/50"
            }`}
          >
            <Star
              className={`h-5 w-5 ${starred ? "fill-coral text-coral" : ""}`}
            />
            <span className="font-semibold text-sm">
              {starred ? "Starred" : "Star this item"}
            </span>
          </button>

          <ImageUpload value={imageUrl} onChange={setImageUrl} />

          <button
            type="submit"
            disabled={loading || !name.trim() || !selectedPlaceId}
            className="w-full rounded-2xl bg-sage py-3 font-bold text-white transition hover:bg-sage/90 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Save changes" : "Add item"}
          </button>

          {isEdit && (
            <div className="flex gap-2 pt-2 border-t border-lavender/50">
              <button
                type="button"
                onClick={() => setShowMove(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky/50 py-2.5 text-sm font-semibold text-ink hover:bg-sky transition"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Move
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 rounded-xl bg-blush/50 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-blush transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </Modal>

      {item && (
        <MoveItemDialog
          open={showMove}
          onClose={() => setShowMove(false)}
          currentPlaceId={item.placeId}
          onMove={handleMove}
        />
      )}
    </>
  );
}
