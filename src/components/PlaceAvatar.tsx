"use client";

import { AppImage } from "./AppImage";
import { getPlaceIcon } from "@/lib/place-icons";

interface PlaceAvatarProps {
  name: string;
  imageUrl?: string | null;
  icon?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: { box: "h-6 w-6", icon: "h-3 w-3", img: 24, rounded: "rounded-md" },
  sm: { box: "h-8 w-8", icon: "h-4 w-4", img: 32, rounded: "rounded-lg" },
  md: { box: "h-14 w-14", icon: "h-6 w-6", img: 56, rounded: "rounded-xl" },
  lg: { box: "h-18 w-18", icon: "h-8 w-8", img: 72, rounded: "rounded-2xl" },
};

export function PlaceAvatar({
  name,
  imageUrl,
  icon,
  size = "md",
  className = "",
}: PlaceAvatarProps) {
  const s = sizeMap[size];
  const Icon = getPlaceIcon(icon);

  if (imageUrl) {
    return (
      <AppImage
        src={imageUrl}
        alt={name}
        width={s.img}
        height={s.img}
        className={`${s.box} ${s.rounded} object-cover ring-2 ring-lavender shrink-0 bg-lavender/20 ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex ${s.box} items-center justify-center ${s.rounded} bg-lavender/50 text-violet shrink-0 ${className}`}
    >
      <Icon className={s.icon} strokeWidth={2} />
    </div>
  );
}
