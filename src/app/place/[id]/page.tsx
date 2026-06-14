"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FolderPlus,
  PackagePlus,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlaceCard } from "@/components/PlaceCard";
import { ItemCard } from "@/components/ItemCard";
import { TagFilter } from "@/components/TagFilter";
import { PlaceForm } from "@/components/PlaceForm";
import { ItemForm } from "@/components/ItemForm";
import { MovePlaceDialog } from "@/components/MovePlaceDialog";
import { PlaceAvatar } from "@/components/PlaceAvatar";
import { ImageUpload } from "@/components/ImageUpload";
import { IconPicker } from "@/components/IconPicker";
import { Place, Item, PathSegment } from "@/types";
import { formatPath } from "@/lib/utils";
import { itemMatchesAnyTag } from "@/lib/items";

export default function PlacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const { id } = use(params);
  const { item: itemIdParam } = use(searchParams);
  const router = useRouter();

  const [place, setPlace] = useState<Place | null>(null);
  const [children, setChildren] = useState<Place[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [path, setPath] = useState<PathSegment[]>([]);
  const [deleteStats, setDeleteStats] = useState({
    subPlaceCount: 0,
    itemCount: 0,
    blockedMoveIds: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showMovePlace, setShowMovePlace] = useState(false);
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemFormPlaceId, setItemFormPlaceId] = useState(id);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingPlace, setEditingPlace] = useState(false);
  const [editIcon, setEditIcon] = useState("");
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/places/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data?.error || "Could not load this place");
        setLoading(false);
        return;
      }
      setPlace(data.place);
      setChildren(Array.isArray(data.children) ? data.children : []);
      setItems(Array.isArray(data.items) ? data.items : []);
      setPath(Array.isArray(data.path) ? data.path : []);
      setDeleteStats(
        data.deleteStats || {
          subPlaceCount: 0,
          itemCount: 0,
          blockedMoveIds: [],
        }
      );
      setLoadError(null);
    } catch {
      setLoadError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (itemIdParam && items.length > 0) {
      const found = items.find((i) => i._id === itemIdParam);
      if (found) setEditingItem(found);
    }
  }, [itemIdParam, items]);

  const savePlaceEdit = async () => {
    await fetch(`/api/places/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        icon: editIcon,
        imageUrl: editImage,
      }),
    });
    setEditingPlace(false);
    load();
  };

  const handleDeletePlace = async () => {
    const parts: string[] = [];
    if (deleteStats.subPlaceCount > 0) {
      parts.push(
        `${deleteStats.subPlaceCount} container${deleteStats.subPlaceCount === 1 ? "" : "s"}`
      );
    }
    if (deleteStats.itemCount > 0) {
      parts.push(
        `${deleteStats.itemCount} item${deleteStats.itemCount === 1 ? "" : "s"}`
      );
    }

    const detail =
      parts.length > 0
        ? `\n\nThis will permanently delete ${parts.join(" and ")} inside.`
        : "";

    if (
      !confirm(
        `Delete "${place?.name}" and everything inside?${detail}\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/places/${id}`, { method: "DELETE" });
      if (res.ok) {
        const parentPath = path.slice(0, -1);
        const redirect =
          parentPath.length > 0
            ? `/place/${parentPath[parentPath.length - 1]._id}`
            : "/";
        router.push(redirect);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleMovePlace = async (newParentId: string | null) => {
    const res = await fetch(`/api/places/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: newParentId }),
    });
    if (res.ok) {
      setEditingPlace(false);
      router.push(`/place/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet border-t-transparent" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-bold text-ink">
          {loadError ? "Something went wrong" : "Place not found"}
        </p>
        {loadError && (
          <p className="text-sm text-ink-light max-w-md">{loadError}</p>
        )}
        <Link href="/" className="text-sm font-semibold text-violet hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const filteredItems =
    tagFilters.length > 0
      ? items.filter((item) => itemMatchesAnyTag(item.tags, tagFilters))
      : items;

  const openAddItem = (targetPlaceId: string = id) => {
    setEditingItem(null);
    setItemFormPlaceId(targetPlaceId);
    setShowItemForm(true);
  };

  const parentPath = path.slice(0, -1);
  const backHref =
    parentPath.length > 0
      ? `/place/${parentPath[parentPath.length - 1]._id}`
      : "/";

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-gradient-to-br from-sky via-mint to-lavender px-4 pb-6 pt-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-light hover:text-ink transition"
          >
            <ChevronLeft className="h-4 w-4" />
            {parentPath.length > 0
              ? parentPath[parentPath.length - 1].name
              : "All rooms"}
          </Link>

          <Breadcrumbs path={path} />

          <div className="flex items-start gap-4 mb-4">
            <PlaceAvatar
              name={place.name}
              imageUrl={place.imageUrl}
              icon={place.icon}
              size="lg"
              className="ring-2 ring-white shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-ink truncate">
                {place.name}
              </h1>
              {path.length > 1 && (
                <p className="text-sm text-ink-light mt-0.5 truncate">
                  {formatPath(path.slice(0, -1))}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setEditName(place.name);
                setEditIcon(place.icon || "Box");
                setEditImage(place.imageUrl);
                setEditingPlace(true);
              }}
              className="rounded-full bg-white/60 p-2 hover:bg-white transition shrink-0"
            >
              <Pencil className="h-4 w-4 text-ink-light" />
            </button>
          </div>

          <SearchBar />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Containers</h2>
            <button
              onClick={() => setShowPlaceForm(true)}
              className="flex items-center gap-1 rounded-full bg-violet/20 px-3 py-1.5 text-xs font-bold text-violet hover:bg-violet/30 transition"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          {children.length === 0 ? (
            <p className="rounded-xl bg-lavender/20 px-4 py-3 text-sm text-ink-light">
              No sub-containers yet — add closets, drawers, shelves...
            </p>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <PlaceCard
                  key={child._id}
                  place={child}
                  onQuickAddItem={(placeId) => openAddItem(placeId)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Items</h2>
            <button
              onClick={() => openAddItem()}
              className="flex items-center gap-1 rounded-full bg-sage/30 px-3 py-1.5 text-xs font-bold text-ink hover:bg-sage/50 transition"
            >
              <PackagePlus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          {items.length > 0 && (
            <div className="mb-3">
              <TagFilter selected={tagFilters} onChange={setTagFilters} />
            </div>
          )}
          {items.length === 0 ? (
            <p className="rounded-xl bg-mint/20 px-4 py-3 text-sm text-ink-light">
              Nothing logged here yet — add an item to this level, or use the{" "}
              <span className="font-semibold">+ Item</span> button on a container
              below.
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="rounded-xl bg-mint/20 px-4 py-3 text-sm text-ink-light">
              No items with this tag here.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onClick={() => {
                    setEditingItem(item);
                    setShowItemForm(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <PlaceForm
        open={showPlaceForm}
        onClose={() => setShowPlaceForm(false)}
        parentId={id}
        onSaved={load}
      />

      <ItemForm
        open={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        placeId={itemFormPlaceId}
        item={editingItem}
        onSaved={load}
        onDeleted={load}
      />

      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setEditingPlace(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:mx-4">
            <h2 className="text-xl font-bold text-ink mb-4">Edit place</h2>
            <div className="space-y-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="field-input w-full rounded-xl border border-lavender px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet"
              />
              <ImageUpload
                value={editImage}
                onChange={setEditImage}
                label="Photo (optional — overrides icon)"
              />
              {!editImage && (
                <IconPicker
                  value={editIcon}
                  onChange={setEditIcon}
                  isRoot={!place.parentId}
                />
              )}
              <button
                onClick={savePlaceEdit}
                className="w-full rounded-2xl bg-violet py-3 font-bold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowMovePlace(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky/50 py-3 font-bold text-ink transition hover:bg-sky"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Move to another place
              </button>
              <button
                type="button"
                onClick={handleDeletePlace}
                disabled={deleting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blush/60 py-3 font-bold text-ink transition hover:bg-blush disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete place & everything inside"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MovePlaceDialog
        open={showMovePlace}
        onClose={() => setShowMovePlace(false)}
        placeId={id}
        placeName={place.name}
        currentParentId={place.parentId}
        excludeIds={deleteStats.blockedMoveIds}
        onMove={handleMovePlace}
      />
    </div>
  );
}
