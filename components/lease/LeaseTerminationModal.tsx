"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";

interface LeaseTerminationModalProps {
  lease: Lease;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function LeaseTerminationModal({
  lease,
  onClose,
  onSuccess,
}: LeaseTerminationModalProps) {
  const [terminationDate, setTerminationDate] = useState("");
  const [terminationReason, setTerminationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch(`/leases/${lease.id}/terminate`, {
        method: "POST",
        body: JSON.stringify({ terminationDate, terminationReason }),
      });
      await onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to terminate lease.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminate-lease-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="terminate-lease-title"
              className="text-lg font-bold text-slate-900"
            >
              Terminate Lease
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter the termination date and reason for lease{" "}
              {lease.lease_number}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close termination form"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="terminationDate"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Termination date
            </label>
            <input
              id="terminationDate"
              name="terminationDate"
              type="date"
              value={terminationDate}
              onChange={(event) => setTerminationDate(event.target.value)}
              required
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="terminationReason"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Termination reason
            </label>
            <textarea
              id="terminationReason"
              name="terminationReason"
              value={terminationReason}
              onChange={(event) => setTerminationReason(event.target.value)}
              required
              disabled={submitting}
              rows={4}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin"
                />
              )}
              {submitting ? "Terminating..." : "Terminate Lease"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
