"use client";

import React from "react";
import { FileText, Plus, Search } from "lucide-react";

interface LeaseEmptyStateProps {
  onCreateNew: () => void;
  searchTerm?: string;
  statusFilter?: string;
  onClearFilters?: () => void;
}

export function LeaseEmptyState({
  onCreateNew,
  searchTerm,
  statusFilter,
  onClearFilters,
}: LeaseEmptyStateProps) {
  const hasActiveFilters =
    Boolean(searchTerm && searchTerm.trim() !== "") ||
    Boolean(statusFilter && statusFilter !== "ALL");

  if (hasActiveFilters) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-semibold text-slate-800">
            No matching lease agreements found
          </h3>
          <p className="text-xs text-slate-500">
            No records matched your search query or filter criteria. Try
            adjusting your search term or resetting active filters.
          </p>
        </div>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
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
        <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
          <FileText className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
          <Plus className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Copy */}
      <div className="max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          No Lease Agreements Recorded Yet
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Create tenancy contracts, link tenants to property units, configure
          billing days, monthly rent, security deposits, and extra charges.
        </p>
      </div>

      {/* Action Button */}
      <div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/10 hover:shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create First Lease
        </button>
      </div>

      {/* Onboarding Workflow Steps */}
      <div className="pt-8 border-t border-slate-100 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Lease Lifecycle Workflow:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              01. Unit & Tenant Assignment
            </span>
            <p className="text-[11px] text-slate-500">
              Select an available vacant unit and assign an onboarded tenant
              profile.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              02. Rent & Charges Setup
            </span>
            <p className="text-[11px] text-slate-500">
              Configure rent amount, security deposits, billing days, and
              recurring extra fees.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              03. Billing & Invoicing
            </span>
            <p className="text-[11px] text-slate-500">
              Generate first move-in invoices and automate monthly recurring
              billing cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
