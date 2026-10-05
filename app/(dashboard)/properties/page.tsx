"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";
import { Property } from "@/types/property";
import EmptyPropertyState from "@/components/property/property/EmptyPropertyState";
import PropertyStatsBar from "@/components/property/property/PropertyStatsBar";
import PropertyControlBar from "@/components/property/property/PropertyControlBar";
import PropertyListView from "@/components/property/property/PropertyListView";
import PropertyGridView from "@/components/property/property/PropertyGridView";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    apiFetch<Property[]>("/properties")
      .then((res) => setProperties(res.data || []))
      .catch((err) => console.error("Failed to load properties:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const query = searchQuery.toLowerCase();
    return properties.filter((p) => {
      const location = [p.address, p.city, p.county].filter(Boolean).join(" ");
      return (
        p.name.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        location.toLowerCase().includes(query)
      );
    });
  }, [properties, searchQuery]);

  // Unique city count
  const uniqueCities = useMemo(() => {
    const cities = properties.map((p) => p.city).filter(Boolean);
    return new Set(cities).size;
  }, [properties]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Properties Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage real estate assets, buildings, and tenant portfolios.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs rounded-xl hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto"
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
          Add Property
        </Link>
      </div>

      {/* Main Page Body */}
      {loading ? (
        <>
          <div className="h-168 sm:hidden bg-slate-100/70 animate-pulse rounded-2xl border border-slate-200" />
          <div className="hidden grid-cols-1 gap-5 sm:grid md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-100/70 animate-pulse rounded-2xl border border-slate-200"
              />
            ))}
          </div>
        </>
      ) : properties.length === 0 ? (
        /* Empty State (When database is empty) */
        <EmptyPropertyState />
      ) : (
        /* Content State (When properties exist) */
        <>
          <PropertyStatsBar
            totalAssets={properties.length}
            uniqueCities={uniqueCities}
          />

          <PropertyControlBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {filteredProperties.length === 0 ? (
            /* Search filter returns empty results */
            <EmptyPropertyState
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery("")}
            />
          ) : viewMode === "grid" ? (
            <PropertyGridView properties={filteredProperties} />
          ) : (
            <PropertyListView properties={filteredProperties} />
          )}
        </>
      )}
    </div>
  );
}
