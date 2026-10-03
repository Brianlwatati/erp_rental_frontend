"use client";

import { useEffect } from "react";
import { Invoice } from "@/types/invoice";

interface IssueInvoiceConfirmModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function IssueInvoiceConfirmModal({
  invoice,
  isOpen,
  isLoading,
  error,
  onClose,
  onConfirm,
}: IssueInvoiceConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isLoading) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-invoice-title"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5-4.5A12 12 0 0112 3a12 12 0 01-8 2.5c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h2
              id="issue-invoice-title"
              className="text-lg font-bold text-slate-900"
            >
              Issue Invoice
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Issue invoice{" "}
              <span className="font-semibold text-slate-800">
                #{invoice.invoice_number}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-slate-800">
                KES {Number(invoice.total).toLocaleString()}
              </span>
              ?
            </p>
          </div>
        </div>

        {error && (
          <p
            className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-w-30"
          >
            {isLoading ? "Issuing..." : "Issue Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
