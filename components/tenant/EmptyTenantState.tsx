"use client";

interface EmptyTenantStateProps {
  onAddTenant: () => void;
  searchTerm?: string;
  statusFilter?: string;
  onClearFilters?: () => void;
}

export function EmptyTenantState({
  onAddTenant,
  searchTerm,
  statusFilter,
  onClearFilters,
}: EmptyTenantStateProps) {
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
            No matching tenants found
          </h3>
          <p className="text-xs text-slate-500">
            No records matched your search parameters. Try adjusting your query
            or resetting your filters.
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
      {/* Visual Badge Icon */}
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
          No Tenants Registered Yet
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your directory is currently empty. Add tenant profiles to manage
          personal contact details, lease assignments, emergency contacts, and
          compliance documents.
        </p>
      </div>

      {/* Primary Action Button */}
      <div>
        <button
          onClick={onAddTenant}
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
          Add Your First Tenant
        </button>
      </div>

      {/* Onboarding Workflow Steps */}
      <div className="pt-8 border-t border-slate-100 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Onboarding Workflow:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              01. Profile Registration
            </span>
            <p className="text-[11px] text-slate-500">
              Record full names, contact info, and national identification
              details.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              02. Lease Linkage
            </span>
            <p className="text-[11px] text-slate-500">
              Assign the tenant to a unit and track lease validity dates.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-blue-600 mb-1 block">
              03. Documents & Verification
            </span>
            <p className="text-[11px] text-slate-500">
              Store identification documents, signed contracts, and references.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
