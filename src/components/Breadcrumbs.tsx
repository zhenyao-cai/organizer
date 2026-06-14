"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { PathSegment } from "@/types";
import { PlaceAvatar } from "./PlaceAvatar";

interface BreadcrumbsProps {
  path: PathSegment[];
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  if (path.length === 0) return null;

  return (
    <nav
      aria-label="Location"
      className="mb-3 flex flex-wrap items-center gap-1 text-xs sm:text-sm"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 font-semibold text-ink-light hover:bg-white/50 hover:text-ink transition"
      >
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>

      {path.map((seg, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={seg._id} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-ink-light/60 shrink-0" />
            {isLast ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/50 px-1.5 py-0.5 font-bold text-ink">
                <PlaceAvatar
                  name={seg.name}
                  imageUrl={seg.imageUrl}
                  icon={seg.icon}
                  size="xs"
                />
                {seg.name}
              </span>
            ) : (
              <Link
                href={`/place/${seg._id}`}
                className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 font-semibold text-ink-light hover:bg-white/50 hover:text-ink transition"
              >
                <PlaceAvatar
                  name={seg.name}
                  imageUrl={seg.imageUrl}
                  icon={seg.icon}
                  size="xs"
                />
                {seg.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
