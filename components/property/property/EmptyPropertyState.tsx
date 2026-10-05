"use client";

import Link from "next/link";

interface EmptyPropertyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export default function EmptyPropertyState({
  searchQuery,
  onClearSearch,
}: EmptyPropertyStateProps) {
  if (searchQuery) {
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
            No matching properties found
          </h3>
          <p className="text-xs text-slate-500">
            No properties matched your query &ldquo;
            <span className="font-semibold">{searchQuery}</span>&rdquo;. Try
            searching for another name, code, or city.
          </p>
        </div>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
          >
            Clear Search Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm space-y-8">
      {/* Visual Illustration Header */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9"
            />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
          +
        </div>
      </div>

      {/* Main Copy */}
      <div className="max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          No Properties Added Yet
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your portfolio is currently empty. Start organizing your real estate
          assets by onboarding your first commercial, residential, or mixed-use
          property.
        </p>
      </div>

      {/* Primary Action Button */}
      <div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/10 hover:shadow-lg"
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
          Add Your First Property
        </Link>
      </div>

      {/* Quick Setup Guide Checklist */}
      <div className="pt-8 border-t border-slate-100 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          How to get started:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              01. Add Property
            </span>
            <p className="text-[11px] text-slate-500">
              Register basic details, location, and property type.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              02. Attach Buildings
            </span>
            <p className="text-[11px] text-slate-500">
              Add individual towers, blocks, or structures.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              03. Manage Units
            </span>
            <p className="text-[11px] text-slate-500">
              Assign tenant leases, rent schedules, and units.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
