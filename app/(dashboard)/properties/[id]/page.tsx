"use client";

import { useCallback, useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Home,
  Percent,
  Layers,
  Edit,
} from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Property, Building, Unit, UnitType } from "@/types/property";
import { PropertyOverviewTab } from "@/components/property/property-overview";
import { PropertyBuildingsTab } from "@/components/property/building/property-building";
import { PropertyUnitsTab } from "@/components/property/property-units";
import { PropertyUnitTypesTab } from "@/components/property/property-unit-types";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Set default tab to 'buildings' for a building-centric operational view
  const [activeTab, setActiveTab] = useState<
    "buildings" | "units" | "overview" | "unit-types"
  >("buildings");

  const [property, setProperty] = useState<Property | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(
    async (showLoading = true) => {
      if (!id) return;

      try {
        if (showLoading) setLoading(true);
        setError(null);

        const [propertyRes, buildingsRes, typeRes, unitsRes] =
          await Promise.all([
            apiFetch<Property>(`/properties/${id}`),
            apiFetch<Building[]>(`/buildings/property/${id}`),
            apiFetch<UnitType[]>("/unit-types"),
            apiFetch<Unit[]>(`/units/property/${id}`),
          ]);

        setProperty(propertyRes.data);
        setBuildings(buildingsRes.data || []);
        setUnitTypes(typeRes.data || []);
        setUnits(unitsRes.data || []);
      } catch (err: unknown) {
        console.error("Failed to load property profile:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load property record.",
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(() => {
      if (isCurrent) return fetchAllData();
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchAllData]);

  // Compute live operational summary stats from buildings and units
  const stats = useMemo(() => {
    const totalUnitsCount = units.length;
    const occupiedUnitsCount = units.filter(
      (u) => u.status?.toLowerCase() === "occupied",
    ).length;
    const occupancyRate =
      totalUnitsCount > 0
        ? Math.round((occupiedUnitsCount / totalUnitsCount) * 100)
        : 0;

    return {
      buildingsCount: buildings.length,
      totalUnits: totalUnitsCount,
      occupiedUnits: occupiedUnitsCount,
      occupancyRate,
    };
  }, [buildings, units]);

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Loading building and property operational profiles...
      </div>
    );

  if (!property)
    return (
      <div className="p-8 text-center text-rose-500 text-xs">
        {error || "Property record not found."}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start">
        <div>
          <Link
            href="/properties"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            All properties
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {property.name}
            </h1>
            {property.code && (
              <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                {property.code}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {[property.address, property.city, property.county]
              .filter(Boolean)
              .join(", ") || "No address provided"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/properties/${id}/edit`)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            Edit Property
          </button>
        </div>
      </div>

      {/* Building-Centric Quick Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Buildings
            </span>
            <span className="text-base font-bold text-slate-900">
              {stats.buildingsCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Units
            </span>
            <span className="text-base font-bold text-slate-900">
              {stats.totalUnits}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Occupied
            </span>
            <span className="text-base font-bold text-emerald-600">
              {stats.occupiedUnits}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Occupancy
            </span>
            <span className="text-base font-bold text-slate-900">
              {stats.occupancyRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Building-First Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        {[
          { key: "buildings", label: "Buildings", count: buildings.length },
          { key: "units", label: "Units", count: units.length },
          { key: "overview", label: "Overview" },
          { key: "unit-types", label: "Unit Types", count: unitTypes.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() =>
                setActiveTab(
                  tab.key as "buildings" | "units" | "overview" | "unit-types",
                )
              }
              className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "buildings" && (
        <PropertyBuildingsTab
          propertyId={id}
          onDataChanged={() => fetchAllData(false)}
        />
      )}
      {activeTab === "units" && (
        <PropertyUnitsTab
          buildings={buildings}
          unitTypes={unitTypes}
          units={units}
          onDataChanged={() => fetchAllData(false)}
        />
      )}
      {activeTab === "overview" && (
        <PropertyOverviewTab property={{ ...property, buildings, units }} />
      )}
      {activeTab === "unit-types" && <PropertyUnitTypesTab />}
    </div>
  );
}
