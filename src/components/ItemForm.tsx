"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { ImageUpload } from "./ImageUpload";
import { MoveItemDialog } from "./MoveItemDialog";
import { PlacePicker } from "./PlacePicker";
import { TagPicker } from "./TagPicker";
import { Item, PathSegment } from "@/types";
import { formatPath } from "@/lib/utils";
import {
  formatMonthInput,
  isExpired,
  parseMonthInput,
} from "@/lib/expiration";
import { NEED_TO_FIX_TAG } from "@/lib/tags";
import { Star, ArrowRightLeft, Trash2, Calendar } from "lucide-react";

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
  const [expiresMonth, setExpiresMonth] = useState("");
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
      setExpiresMonth(formatMonthInput(item.expiresAt));
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
      setExpiresMonth("");
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
        expiresAt: expiresMonth || null,
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

  const handleExpiresChange = (value: string) => {
    setExpiresMonth(value);
    if (!value) return;
    const expiresAt = parseMonthInput(value);
    if (expiresAt && isExpired(expiresAt)) {
      setTags((prev) =>
        prev.includes(NEED_TO_FIX_TAG) ? prev : [...prev, NEED_TO_FIX_TAG]
      );
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
              Note
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Where exactly? Condition? Serial number? Anything helpful..."
              rows={3}
              className="w-full rounded-xl border border-lavender bg-white px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-violet resize-none"
            />
          </div>

          <TagPicker tags={tags} onChange={setTags} />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Expires
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ink-light shrink-0" />
              <input
                type="month"
                value={expiresMonth}
                onChange={(e) => handleExpiresChange(e.target.value)}
                className="flex-1 rounded-xl border border-lavender bg-white px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-violet"
              />
              {expiresMonth && (
                <button
                  type="button"
                  onClick={() => setExpiresMonth("")}
                  className="rounded-xl bg-lavender/30 px-3 py-2.5 text-xs font-semibold text-ink-light hover:bg-lavender/50"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-ink-light">
              Optional. Past the expiry month, items are tagged Need to fix.
            </p>
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
