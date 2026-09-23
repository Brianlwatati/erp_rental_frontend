"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Property, Building, Unit, UnitType } from "@/types/property";
import { PropertyOverviewTab } from "@/components/property/property-overview";
import { PropertyBuildingsTab } from "@/components/property/property-building";
import { PropertyUnitsTab } from "@/components/property/property-units";
import { PropertyUnitTypesTab } from "@/components/property/property-unit-types";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "buildings" | "units" | "unit-types"
  >("overview");
  const [property, setProperty] = useState<Property | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propRes, bldRes, typesRes] = await Promise.all([
        apiFetch<Property>(`/properties/${id}`),
        apiFetch<Building[]>(`/buildings/property/${id}`),
        // apiFetch<Unit[]>(`/properties/${id}/units`),
        apiFetch<UnitType[]>("/unit-types"),
      ]);

      setProperty(propRes.data);
      setBuildings(bldRes.data);
      // setUnits(unitsRes.data);
      setUnitTypes(typesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading property profile...
      </div>
    );
  if (!property)
    return (
      <div className="p-8 text-center text-rose-500">Property not found.</div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {property.name}
            </h1>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {property.code}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {[property.address, property.city, property.county]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        <button
          onClick={() => router.push(`/properties/${id}/edit`)}
          className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
        >
          Edit Property
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        {(["overview", "buildings", "unit-types", "units"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <PropertyOverviewTab property={{ ...property, buildings, units }} />
      )}
      {activeTab === "buildings" && <PropertyBuildingsTab propertyId={id} />}
      {activeTab === "unit-types" && <PropertyUnitTypesTab />}
      {activeTab === "units" && (
        <PropertyUnitsTab buildings={buildings} unitTypes={unitTypes} />
      )}
    </div>
  );
}
