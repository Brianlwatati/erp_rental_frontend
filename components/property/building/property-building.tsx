"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api_client";
import { Building } from "@/types/property";
import { BuildingModal } from "../building-modal";
import Link from "next/link";

export function PropertyBuildingsTab({
  propertyId,
  onDataChanged,
}: {
  propertyId: string;
  onDataChanged: () => void | Promise<void>;
}) {
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
      setBuildings(res.data || []);
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

  const handleSaveSuccess = async () => {
    await fetchBuildings();
    await onDataChanged();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-slate-100 pb-4">
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
          className="px-3.5 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
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
          Add Building
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 bg-slate-100/70 animate-pulse rounded-xl border border-slate-200"
            />
          ))}
        </div>
      ) : buildings.length === 0 ? (
        /* Empty State */
        <div className="p-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              No buildings registered
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Get started by adding the first building block or structure to
              this property.
            </p>
          </div>
          <button
            onClick={handleNew}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm inline-block"
          >
            + Add First Building
          </button>
        </div>
      ) : (
        /* Building Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header & Code */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {building.name}
                      </h4>
                      <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {building.code}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                    {building.floors ?? 0}{" "}
                    {building.floors === 1 ? "Floor" : "Floors"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-9">
                  {building.description ||
                    "No description provided for this building."}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleEdit(building)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Edit Details
                </button>

                <Link
                  href={`/properties/building/${building.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 group/link"
                >
                  View Floor Grid
                  <svg
                    className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Building Modal */}
      {isModalOpen && (
        <BuildingModal
          propertyId={propertyId}
          building={selectedBuilding}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
