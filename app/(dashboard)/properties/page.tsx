"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Property } from "@/types/property";
import EmptyPropertyState from "@/components/property/property/EmptyPropertyState";
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

  // Filter logic across property names, codes, and locations
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

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Sleek, Focused Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Properties
            </h1>
            {!loading && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                {properties.length}{" "}
                {properties.length === 1 ? "Property" : "Properties"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Select a property to manage its buildings, units, and tenant
            operations.
          </p>
        </div>

        <Link
          href="/properties/new"
          className="px-4 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition shadow-xs inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Main Page Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 bg-slate-100/80 animate-pulse rounded-2xl border border-slate-200/60"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        /* Empty state when database is empty */
        <EmptyPropertyState />
      ) : (
        /* Property list content with simple search and layout toggle */
        <div className="space-y-4">
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
        </div>
      )}
    </div>
  );
}
