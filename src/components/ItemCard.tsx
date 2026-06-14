"use client";

import { Star, Tag } from "lucide-react";
import { AppImage } from "./AppImage";
import { Item } from "@/types";
import { tagLabel, tagStyle } from "@/lib/tags";

interface ItemCardProps {
  item: Item;
  onClick: () => void;
  showPath?: string;
}

export function ItemCard({ item, onClick, showPath }: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white p-4 card-hover"
    >
      <div className="flex items-start gap-3">
        {item.imageUrl ? (
          <AppImage
            src={item.imageUrl}
            alt={item.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl object-cover ring-2 ring-mint shrink-0 bg-mint/20"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/50 shrink-0">
            <Tag className="h-5 w-5 text-sage" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-ink truncate">{item.name}</h3>
            {item.starred && (
              <Star className="h-4 w-4 text-coral fill-coral shrink-0" />
            )}
          </div>
          {showPath && (
            <p className="text-[11px] text-ink-light mt-0.5 truncate">
              {showPath}
            </p>
          )}
          {item.description && (
            <p className="text-sm text-ink-light mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tagStyle(tag)}`}
                >
                  {tagLabel(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
