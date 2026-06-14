"use client";

import { useEffect, useRef } from "react";
import { Camera, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Photo",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return;
    const data = await res.json();
    onChange(data.url);
  };

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Upload preview"
            width={120}
            height={120}
            className="h-28 w-28 rounded-2xl object-cover ring-2 ring-blush"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-md hover:bg-blush"
          >
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-violet/40 bg-lavender/30 text-ink-light transition hover:border-violet hover:bg-lavender/50"
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs font-medium">Add photo</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
