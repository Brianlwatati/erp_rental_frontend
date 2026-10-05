"use client";

import React from "react";

interface LeaseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function LeaseFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: LeaseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Search by lease #, unit number, or tenant name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="ALL">All Statuses</option>
        <option value="DRAFT">DRAFT</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INVOICED">INVOICED (Locked)</option>
        <option value="EXPIRED">EXPIRED</option>
        <option value="TERMINATED">TERMINATED</option>
      </select>
    </div>
  );
}
