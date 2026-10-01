"use client";

import { useEffect } from "react";
import { Info } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  closeLabel?: string;
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  description,
  closeLabel = "Close",
}: InfoModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-amber-100 p-2.5 text-amber-700">
            <Info aria-hidden="true" className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2
              id="info-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {title}
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
