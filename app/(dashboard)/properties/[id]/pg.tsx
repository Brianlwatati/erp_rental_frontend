"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";

import {
  Building,
  Home,
  Plus,
  Search,
  Layers,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  BuildingCard,
  BuildingData,
} from "@/components/property/property/BuildingCard";

interface PropertyDetail {
  id: string;
  name: string;
  address?: string;
  city?: string;
  buildings: BuildingData[];
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"buildings" | "overview">(
    "buildings",
  );

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<PropertyDetail>(`/properties/${propertyId}`);
      setProperty(res.data || null);
    } catch (err) {
      console.error("Failed to load property details:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const filteredBuildings = useMemo(() => {
    if (!property?.buildings) return [];
    return property.buildings.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [property, searchTerm]);

  // Total Portfolio Calculations for this Property
  const totals = useMemo(() => {
    if (!property?.buildings)
      return { totalUnits: 0, occupied: 0, vacant: 0, buildingsCount: 0 };

    return property.buildings.reduce(
      (acc, b) => ({
        totalUnits: acc.totalUnits + b.total_units,
        occupied: acc.occupied + b.occupied_units,
        vacant: acc.vacant + b.vacant_units,
        buildingsCount: acc.buildingsCount + 1,
      }),
      { totalUnits: 0, occupied: 0, vacant: 0, buildingsCount: 0 },
    );
  }, [property]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
        Loading building and property operations...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Property Not Found
        </h3>
        <Link
          href="/properties"
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          Return to Properties List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Property Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/properties" className="hover:text-slate-600">
              Properties
            </Link>
            <span>/</span>
            <span className="text-slate-700">{property.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
          <p className="text-xs text-slate-500">
            {[property.address, property.city].filter(Boolean).join(", ") ||
              "No address provided"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              /* Trigger Add Building Modal */
            }}
            className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Building
          </button>
        </div>
      </div>

      {/* Operational Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Buildings
          </span>
          <span className="text-xl font-bold text-slate-900">
            {totals.buildingsCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Units
          </span>
          <span className="text-xl font-bold text-slate-900">
            {totals.totalUnits}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Occupied
          </span>
          <span className="text-xl font-bold text-emerald-600">
            {totals.occupied}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Vacant
          </span>
          <span className="text-xl font-bold text-amber-600">
            {totals.vacant}
          </span>
        </div>
      </div>

      {/* Tab Navigation & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("buildings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "buildings"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Buildings ({totals.buildingsCount})
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Property Metadata
          </button>
        </div>

        {activeTab === "buildings" && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search building name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Main Operations View */}
      {activeTab === "buildings" ? (
        filteredBuildings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              {searchTerm
                ? "No matching buildings found"
                : "No Buildings Added Yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Add your first building block to begin assigning units, tracking tenants, and issuing maintenance requests."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                propertyId={property.id}
                onAddUnit={(buildingId) => {
                  /* Handle Add Unit Modal pre-filled with buildingId */
                }}
              />
            ))}
          </div>
        )
      ) : (
        /* Property Metadata / Overview Details */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Property Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">
                Property Name
              </span>
              <span className="text-slate-800 font-semibold">
                {property.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Location</span>
              <span className="text-slate-800 font-semibold">
                {[property.address, property.city].filter(Boolean).join(", ") ||
                  "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
