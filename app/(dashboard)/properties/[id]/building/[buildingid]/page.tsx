"use client";

import React, { useCallback, useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Building, Unit, UnitType } from "@/types/property";
import { UnitModal } from "@/components/property/unit-modal";
import { Building2DGrid } from "@/components/property/building/building-2d-grid";

export default function BuildingDetailsPage({
  params,
}: {
  params: Promise<{ buildingid: string }>;
}) {
  const { buildingid } = use(params);
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [unitLocation, setUnitLocation] = useState<{
    floor: number;
    gridColumn: number;
  } | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!buildingid) return;

    try {
      setLoading(true);
      setError(null);

      const [buildingRes, unitsRes, unitTypesRes] = await Promise.all([
        apiFetch<Building>(`/buildings/${buildingid}`),
        apiFetch<Unit[]>(`/buildings/${buildingid}/units`),
        apiFetch<UnitType[]>("/unit-types").catch(() => ({ data: [] })),
      ]);

      setBuilding(buildingRes.data);
      setUnits(unitsRes.data || []);
      setUnitTypes(unitTypesRes.data || []);
    } catch (err: unknown) {
      console.error("Failed to load building details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load building details.",
      );
    } finally {
      setLoading(false);
    }
  }, [buildingid]);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(() => {
      if (isCurrent) return fetchAllData();
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchAllData]);

  const modalBuildings = useMemo(
    () => (building ? [building] : []),
    [building],
  );

  const openUnitModal = (floor: number, gridColumn: number) => {
    setUnitLocation({ floor, gridColumn });
    setIsUnitModalOpen(true);
  };

  const handleNewUnit = () => {
    const groundFloorUnits = units.filter((unit) => unit.floor === 0);
    const nextGridColumn =
      groundFloorUnits.reduce(
        (maxColumn, unit) => Math.max(maxColumn, unit.grid_column ?? -1),
        -1,
      ) + 1;
    openUnitModal(0, nextGridColumn);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
        Loading Building details...
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error || "Building not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href={`/properties/${building.property_id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to property details
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{building.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Property:{" "}
            <span className="font-semibold text-slate-700">
              {building.property_name}
            </span>{" "}
            • Code: <span className="font-mono">{building.code}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewUnit}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          + New Unit
        </button>
      </div>

      {/* 2D Elevation View */}
      <Building2DGrid
        building={building}
        units={units}
        onUnitClick={(unit) => router.push(`/units/${unit.id}`)}
        onAddUnitClick={openUnitModal}
      />
      <UnitModal
        buildings={modalBuildings}
        unitTypes={unitTypes}
        unit={null}
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onSuccess={() => void fetchAllData()}
        defaultBuildingId={building.id}
        defaultFloor={unitLocation?.floor}
        defaultGridColumn={unitLocation?.gridColumn}
      />
    </div>
  );
}
