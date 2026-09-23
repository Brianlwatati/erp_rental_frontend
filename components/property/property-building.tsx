"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api_client";
import { Building } from "@/types/property";
import { DataTable, Column } from "@/components/ui/data-table";
import { BuildingModal } from "./building-modal";

export function PropertyBuildingsTab({ propertyId }: { propertyId: string }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      // Endpoint: GET /buildings/property/:propertyId
      const res = await apiFetch<Building[]>(
        `/buildings/property/${propertyId}`,
      );
      setBuildings(res.data);
    } catch (err) {
      console.error("Failed to load buildings:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedBuilding(null);
    setIsModalOpen(true);
  };

  const columns: Column<Building>[] = [
    {
      header: "Building Name",
      accessor: (row) => (
        <span className="font-semibold text-slate-900">{row.name}</span>
      ),
    },
    {
      header: "Code",
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {row.code}
        </span>
      ),
    },
    {
      header: "Floors",
      accessor: (row) => row.floors ?? "N/A",
    },
    {
      header: "Description",
      accessor: (row) => (
        <span className="text-slate-500 text-xs truncate max-w-xs block">
          {row.description || "—"}
        </span>
      ),
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Registered Buildings
          </h3>
          <p className="text-xs text-slate-500">
            Buildings and structures associated with this property.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-3.5 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          + Add Building
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading buildings...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={buildings}
          emptyMessage="No buildings registered for this property."
        />
      )}

      {isModalOpen && (
        <BuildingModal
          propertyId={propertyId}
          building={selectedBuilding}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchBuildings}
        />
      )}
    </div>
  );
}
