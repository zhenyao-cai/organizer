"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { PlacePicker } from "./PlacePicker";
import { ArrowRightLeft } from "lucide-react";

interface MoveItemDialogProps {
  open: boolean;
  onClose: () => void;
  currentPlaceId: string;
  onMove: (placeId: string) => Promise<void>;
}

export function MoveItemDialog({
  open,
  onClose,
  currentPlaceId,
  onMove,
}: MoveItemDialogProps) {
  const [selected, setSelected] = useState(currentPlaceId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected("");
  }, [open]);

  const handleMove = async () => {
    if (!selected || selected === currentPlaceId) return;
    setLoading(true);
    try {
      await onMove(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Move to...">
      <p className="mb-4 text-sm text-ink-light">
        Pick a new home for this item — any room or nested container.
      </p>
      <PlacePicker
        value={selected}
        onChange={setSelected}
        excludeId={currentPlaceId}
      />
      <button
        onClick={handleMove}
        disabled={!selected || selected === currentPlaceId || loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet py-3 font-bold text-white transition hover:bg-violet/90 disabled:opacity-50"
      >
        <ArrowRightLeft className="h-4 w-4" />
        {loading ? "Moving..." : "Move here"}
      </button>
    </Modal>
  );
}
