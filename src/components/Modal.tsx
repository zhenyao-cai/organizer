"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-blush/50 transition"
          >
            <X className="h-5 w-5 text-ink-light" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
