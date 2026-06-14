"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { PlacePicker } from "./PlacePicker";
import { ArrowRightLeft } from "lucide-react";

interface MovePlaceDialogProps {
  open: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
  currentParentId: string | null;
  excludeIds: string[];
  onMove: (parentId: string | null) => Promise<void>;
}

export function MovePlaceDialog({
  open,
  onClose,
  placeId,
  placeName,
  currentParentId,
  excludeIds,
  onMove,
}: MovePlaceDialogProps) {
  const [selected, setSelected] = useState(
    currentParentId ?? "__root__"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(currentParentId ?? "__root__");
  }, [open, currentParentId]);

  const handleMove = async () => {
    const newParentId = selected === "__root__" ? null : selected;
    const current = currentParentId ?? null;
    if (newParentId === current) return;

    setLoading(true);
    try {
      await onMove(newParentId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const currentKey = currentParentId ?? "__root__";
  const unchanged = selected === currentKey;

  return (
    <Modal open={open} onClose={onClose} title={`Move "${placeName}"`}>
      <p className="mb-4 text-sm text-ink-light">
        Choose a new parent. Everything inside this container moves with it.
      </p>
      <PlacePicker
        value={selected}
        onChange={setSelected}
        excludeIds={[placeId, ...excludeIds]}
        allowRoot
        label="Move into..."
      />
      <button
        onClick={handleMove}
        disabled={unchanged || loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet py-3 font-bold text-white transition hover:bg-violet/90 disabled:opacity-50"
      >
        <ArrowRightLeft className="h-4 w-4" />
        {loading ? "Moving..." : "Move here"}
      </button>
    </Modal>
  );
}
