"use client";

import Link from "next/link";
import { ChevronRight, PackagePlus } from "lucide-react";
import { Place } from "@/types";
import { PlaceAvatar } from "./PlaceAvatar";

interface PlaceCardProps {
  place: Place;
  itemCount?: number;
  childCount?: number;
  onQuickAddItem?: (placeId: string) => void;
}

export function PlaceCard({
  place,
  itemCount,
  childCount,
  onQuickAddItem,
}: PlaceCardProps) {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-white p-2 card-hover">
      <Link
        href={`/place/${place._id}`}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition hover:bg-lavender/20"
      >
        <PlaceAvatar
          name={place.name}
          imageUrl={place.imageUrl}
          icon={place.icon}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ink truncate">{place.name}</h3>
          {(itemCount !== undefined || childCount !== undefined) && (
            <p className="text-xs text-ink-light mt-0.5">
              {childCount ? `${childCount} containers` : ""}
              {childCount && itemCount ? " · " : ""}
              {itemCount ? `${itemCount} items` : ""}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-ink-light group-hover:text-violet transition shrink-0" />
      </Link>
      {onQuickAddItem && (
        <button
          type="button"
          onClick={() => onQuickAddItem(place._id)}
          title={`Add item to ${place.name}`}
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-sage/25 text-ink transition hover:bg-sage/45"
        >
          <PackagePlus className="h-5 w-5" />
          <span className="text-[9px] font-bold mt-0.5">Item</span>
        </button>
      )}
    </div>
  );
}
