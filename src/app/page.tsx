"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles, PackagePlus } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceForm } from "@/components/PlaceForm";
import { ItemForm } from "@/components/ItemForm";
import { ItemCard } from "@/components/ItemCard";
import { TagFilter } from "@/components/TagFilter";
import { Place, Item, PathSegment } from "@/types";
import { formatPath } from "@/lib/utils";
import { tagLabel } from "@/lib/tags";

interface ItemWithPath extends Item {
  path?: PathSegment[];
}

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<ItemWithPath[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const loadPlaces = async () => {
    try {
      const res = await fetch("/api/places?parentId=root");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPlaces(data);
        setError(null);
      } else {
        setPlaces([]);
        setError(data?.error || "Could not load rooms");
      }
    } catch {
      setPlaces([]);
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    if (!tagFilter) {
      setFilteredItems([]);
      return;
    }
    setLoadingItems(true);
    fetch(`/api/items?tag=${encodeURIComponent(tagFilter)}&includePath=true`)
      .then((r) => r.json())
      .then((data) => {
        setFilteredItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setFilteredItems([]))
      .finally(() => setLoadingItems(false));
  }, [tagFilter]);

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-br from-lavender via-blush to-peach px-4 pb-8 pt-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet" />
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              Yaorganize
            </h1>
          </div>
          <p className="mb-5 text-ink-light font-medium">
            Know exactly where everything lives ✨
          </p>
          <SearchBar />
          <div className="mt-4">
            <TagFilter selected={tagFilter} onChange={setTagFilter} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {tagFilter ? (
          <section>
            <h2 className="text-lg font-bold text-ink mb-3">
              Items tagged &ldquo;{tagLabel(tagFilter)}&rdquo;
            </h2>
            {loadingItems ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-lavender/30"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="rounded-xl bg-mint/20 px-4 py-3 text-sm text-ink-light">
                No items with this tag yet.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    showPath={
                      item.path ? formatPath(item.path) : undefined
                    }
                    onClick={() => setEditingItem(item)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">Your rooms</h2>
              <div className="flex gap-2">
                {places.length > 0 && (
                  <button
                    onClick={() => setShowItemForm(true)}
                    className="flex items-center gap-1.5 rounded-full bg-sage/40 px-3 py-2 text-sm font-bold text-ink hover:bg-sage/60 transition"
                  >
                    <PackagePlus className="h-4 w-4" />
                    Add item
                  </button>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-violet/90 transition"
                >
                  <Plus className="h-4 w-4" />
                  Add room
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-blush/50 px-4 py-3 text-sm text-ink">
                <p className="font-semibold">Could not load data</p>
                <p className="mt-1 text-ink-light">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-lavender/30"
                  />
                ))}
              </div>
            ) : places.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center card-shadow">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender/40">
                  <Sparkles className="h-8 w-8 text-violet" />
                </div>
                <p className="font-bold text-ink mb-1">No rooms yet</p>
                <p className="text-sm text-ink-light mb-4">
                  Start by adding your first room — kitchen, bedroom, office...
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-full bg-violet px-6 py-2.5 text-sm font-bold text-white hover:bg-violet/90 transition"
                >
                  Add your first room
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {places.map((place) => (
                  <PlaceCard key={place._id} place={place} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <PlaceForm
        open={showForm}
        onClose={() => setShowForm(false)}
        parentId={null}
        isRoot
        onSaved={loadPlaces}
      />

      {places.length > 0 && (
        <ItemForm
          open={showItemForm}
          onClose={() => setShowItemForm(false)}
          placeId={places[0]._id}
          pickLocationFirst
          onSaved={() => {}}
        />
      )}

      {editingItem && (
        <ItemForm
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          placeId={editingItem.placeId}
          item={editingItem}
          onSaved={() => {
            if (tagFilter) {
              fetch(
                `/api/items?tag=${encodeURIComponent(tagFilter)}&includePath=true`
              )
                .then((r) => r.json())
                .then((data) =>
                  setFilteredItems(Array.isArray(data) ? data : [])
                );
            }
          }}
          onDeleted={() => {
            setEditingItem(null);
            if (tagFilter) {
              fetch(
                `/api/items?tag=${encodeURIComponent(tagFilter)}&includePath=true`
              )
                .then((r) => r.json())
                .then((data) =>
                  setFilteredItems(Array.isArray(data) ? data : [])
                );
            }
          }}
        />
      )}
    </div>
  );
}
