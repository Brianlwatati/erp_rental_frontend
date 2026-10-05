"use client";

import React from "react";

interface BillingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function BillingFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: BillingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
      <input
        type="text"
        placeholder="Search by invoice number or tenant ID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-2 w-full sm:w-auto">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ISSUED">ISSUED</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
    </div>
  );
}
