"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api_client";
import { Unit, Building, UnitType } from "@/types/property";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { UnitModal } from "./unit-modal";

export function PropertyUnitsTab({
  buildings,
  unitTypes,
}: {
  buildings: Building[];
  unitTypes: UnitType[];
}) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuildingFilter, setSelectedBuildingFilter] =
    useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUnits = useCallback(async () => {
    if (buildings.length === 0) {
      setUnits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch units for each building via /units/building/:buildingId
      const promises = buildings.map((building) =>
        apiFetch<Unit[]>(`/units/building/${building.id}`)
          .then((res) =>
            res.data.map((unit) => ({
              ...unit,
              building,
            })),
          )
          .catch(() => [] as Unit[]),
      );

      const results = await Promise.all(promises);
      const allUnits = results.flat();
      setUnits(allUnits);
    } catch (err) {
      console.error("Failed to load units:", err);
    } finally {
      setLoading(false);
    }
  }, [buildings]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedUnit(null);
    setIsModalOpen(true);
  };

  const filteredUnits =
    selectedBuildingFilter === "ALL"
      ? units
      : units.filter((u) => u.building_id === selectedBuildingFilter);

  const columns: Column<Unit>[] = [
    {
      header: "Unit #",
      accessor: (row) => (
        <span className="font-bold text-slate-900">{row.unit_number}</span>
      ),
    },
    {
      header: "Building",
      accessor: (row) => (
        <span className="font-medium text-slate-700">
          {row.building?.name || "—"}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: (row) => row.unit_type?.name || "—",
    },
    {
      header: "Floor",
      accessor: (row) => row.floor ?? "N/A",
    },
    {
      header: "Monthly Rent",
      accessor: (row) =>
        new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
        }).format(row.monthly_rent),
    },
    {
      header: "Deposit",
      accessor: (row) =>
        new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
        }).format(row.deposit_amount),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => handleEdit(row)}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900">Property Units</h3>
          {buildings.length > 1 && (
            <select
              value={selectedBuildingFilter}
              onChange={(e) => setSelectedBuildingFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleNew}
          disabled={buildings.length === 0}
          className="px-3.5 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
        >
          + Add Unit
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading units...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUnits}
          emptyMessage={
            buildings.length === 0
              ? "Please create a building first before adding units."
              : "No units registered for this property."
          }
        />
      )}

      {isModalOpen && (
        <UnitModal
          buildings={buildings}
          unitTypes={unitTypes}
          unit={selectedUnit}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchUnits}
          defaultBuildingId={
            selectedBuildingFilter !== "ALL"
              ? selectedBuildingFilter
              : buildings[0]?.id
          }
        />
      )}
    </div>
  );
}
