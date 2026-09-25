"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api_client";
import { UnitType } from "@/types/property";
import { DataTable, Column } from "@/components/ui/data-table";
import { UnitTypeModal } from "./unit-type-modal";

export function PropertyUnitTypesTab() {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUnitTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<UnitType[]>("/unit-types");
      setUnitTypes(res.data);
    } catch (err) {
      console.error("Failed to load unit types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnitTypes();
  }, [fetchUnitTypes]);

  const handleEdit = (unitType: UnitType) => {
    if (unitType.company_id === "default") return;

    setSelectedUnitType(unitType);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedUnitType(null);
    setIsModalOpen(true);
  };

  const columns: Column<UnitType>[] = [
    {
      header: "Name",
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
      header: "Bedrooms",
      accessor: (row) => row.bedrooms ?? 0,
    },
    {
      header: "Bathrooms",
      accessor: (row) => row.bathrooms ?? 0,
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
          disabled={row.company_id === "default"}
          className="text-xs font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
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
          <h3 className="text-lg font-bold text-slate-900">Unit Types</h3>
          <p className="text-xs text-slate-500">
            Define standardized room layouts, bedrooms, and bathrooms for your
            property units.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-3.5 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          + Add Unit Type
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading unit types...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={unitTypes}
          emptyMessage="No unit types created yet."
        />
      )}

      {isModalOpen && (
        <UnitTypeModal
          unitType={selectedUnitType}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchUnitTypes}
        />
      )}
    </div>
  );
}
