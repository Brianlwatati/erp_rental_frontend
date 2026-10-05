"use client";

import React from "react";

interface EmptyPaymentStateProps {
  onRecordPayment: () => void;
  searchTerm?: string;
  statusFilter?: string;
  onClearFilters?: () => void;
}

export function EmptyPaymentState({
  onRecordPayment,
  searchTerm,
  statusFilter,
  onClearFilters,
}: EmptyPaymentStateProps) {
  const hasActiveFilters =
    Boolean(searchTerm && searchTerm.trim() !== "") ||
    Boolean(statusFilter && statusFilter !== "ALL");

  if (hasActiveFilters) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-semibold text-slate-800">
            No matching payments found
          </h3>
          <p className="text-xs text-slate-500">
            No transaction records matched your search filters. Try modifying
            your search criteria or resetting filters.
          </p>
        </div>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
          >
            Clear Search & Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm space-y-8">
      {/* Visual Icon Badge */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
          +
        </div>
      </div>

      {/* Main Copy */}
      <div className="max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          No Payments Recorded Yet
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Log rent collections, bank transfers, cash payments, and automated
          M-PESA receipts to reconcile unpaid tenant invoices.
        </p>
      </div>

      {/* Primary Action Button */}
      <div>
        <button
          onClick={onRecordPayment}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-500/10 hover:shadow-lg"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Record First Payment
        </button>
      </div>

      {/* Payment Processing Steps */}
      <div className="pt-8 border-t border-slate-100 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Payment Processing Workflow:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-emerald-600 mb-1 block">
              01. Invoice Selection
            </span>
            <p className="text-[11px] text-slate-500">
              Select unpaid or partially paid tenant invoices to clear pending
              balances.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-emerald-600 mb-1 block">
              02. Reference Logging
            </span>
            <p className="text-[11px] text-slate-500">
              Capture M-PESA transaction codes, bank transfer numbers, or check
              IDs.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-emerald-600 mb-1 block">
              03. Auto Reconciliation
            </span>
            <p className="text-[11px] text-slate-500">
              System updates ledger balances and marks corresponding invoices as
              paid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
