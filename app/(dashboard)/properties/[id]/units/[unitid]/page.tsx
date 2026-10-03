"use client";

import React, { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  Building,
  Layers,
  DollarSign,
  AlertCircle,
  FilePlus,
  Bed,
  Bath,
  Printer,
  FileText,
  MapPin,
  ShieldCheck,
  Home,
} from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Building as BuildingMy, Unit } from "@/types/property";
import { StatusBadge } from "@/components/ui/badge";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { LeaseModal } from "@/components/lease/modals/lease-modal";

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ unitid: string }>;
}) {
  const { unitid } = use(params);
  const router = useRouter();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [leaseBuilding, setLeaseBuilding] = useState<BuildingMy[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leaseSetupLoading, setLeaseSetupLoading] = useState(false);
  const [leaseSetupError, setLeaseSetupError] = useState<string | null>(null);

  // Fetch unit details and associated leases concurrently
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [unitRes, leasesRes] = await Promise.all([
        apiFetch<Unit>(`/units/${unitid}`),
        apiFetch<Lease[]>(`/leases/unitleases/${unitid}`),
      ]);

      setUnit(unitRes.data);
      setLeases(leasesRes.data || []);
    } catch (err: any) {
      console.error("Failed to load unit details or leases:", err);
      setError(err?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [unitid]);

  useEffect(() => {
    if (unitid) {
      fetchData();
    }
  }, [unitid, fetchData]);

  const handleOpenLeaseModal = async () => {
    if (!unit || unit.status !== "VACANT" || leaseSetupLoading) return;

    setLeaseSetupLoading(true);
    setLeaseSetupError(null);
    try {
      const [buildingRes, tenantsRes] = await Promise.all([
        apiFetch<BuildingMy>(`/buildings/${unit.building_id}`),
        apiFetch<Tenant[]>("/tenants"),
      ]);
      setLeaseBuilding([buildingRes.data]);
      setTenants(tenantsRes.data || []);
      setIsLeaseModalOpen(true);
    } catch (err: unknown) {
      setLeaseSetupError(
        err instanceof Error
          ? err.message
          : "Could not prepare lease creation.",
      );
    } finally {
      setLeaseSetupLoading(false);
    }
  };

  const isVacant = unit?.status === "VACANT";

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-24 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-2xl border border-slate-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-56 bg-slate-100 rounded-2xl border border-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Unit Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            {error || "The requested unit details could not be retrieved."}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Units
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Unit {unit.unit_number}
            </h1>
            <StatusBadge status={unit.status} />
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>{unit.property_name || "Unassigned Property"}</span>
            {unit.property_code && (
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                {unit.property_code}
              </span>
            )}
            <span>•</span>
            <span>{unit.building_name || "Unassigned Building"}</span>
            {unit.building_code && (
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                {unit.building_code}
              </span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        {isVacant && (
          <button
            onClick={handleOpenLeaseModal}
            disabled={leaseSetupLoading}
            className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs rounded-xl hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto disabled:cursor-wait disabled:opacity-60"
          >
            <FilePlus className="w-4 h-4" />
            {leaseSetupLoading ? "Preparing lease..." : "Draft Lease"}
          </button>
        )}
      </div>

      {/* Vacant Banner Callout */}
      {isVacant && (
        <div className="bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 border border-blue-200/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                Unit Ready for Occupancy
              </h3>
              <p className="text-xs text-blue-700/80 mt-0.5">
                This unit is currently marked as <strong>VACANT</strong>. You
                can initiate a new tenant lease agreement now.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenLeaseModal}
            disabled={leaseSetupLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shrink-0 shadow-sm disabled:cursor-wait disabled:opacity-60"
          >
            {leaseSetupLoading ? "Preparing lease..." : "Create Lease"}
          </button>
        </div>
      )}
      {leaseSetupError && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {leaseSetupError}
        </p>
      )}

      {/* Primary Key Metric Cards (Row 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Rent
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ${unit.monthly_rent?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Deposit Required
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ${unit.deposit_amount?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Floor Level
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              Floor {unit.floor}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bedrooms & Bath
            </p>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {unit.unit_type_bedrooms ?? 0} Bed •{" "}
              {unit.unit_type_bathrooms || "0"} Bath
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Bed className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Condensed 2-Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Card 1: Unit Specifications & Layout */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Unit Specifications
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100/80">
              <p className="text-[11px] text-slate-400 font-medium">
                Unit Number
              </p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {unit.unit_number}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100/80">
              <p className="text-[11px] text-slate-400 font-medium">
                Unit Type
              </p>
              <p className="font-semibold text-slate-800 text-sm mt-0.5 truncate">
                {unit.unit_type_name || "Standard"}
                {unit.unit_type_code && (
                  <span className="text-[10px] text-slate-400 ml-1">
                    ({unit.unit_type_code})
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Bedrooms
                </p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {unit.unit_type_bedrooms ?? 0}
                </p>
              </div>
              <Bed className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Bathrooms
                </p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {unit.unit_type_bathrooms || "0"}
                </p>
              </div>
              <Bath className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100/80 col-span-2">
              <p className="text-[11px] text-slate-400 font-medium">
                Floor & Position
              </p>
              <p className="font-semibold text-slate-800 mt-0.5">
                Floor {unit.floor}{" "}
                {unit.building_floors
                  ? ` (out of ${unit.building_floors})`
                  : ""}
                {unit.grid_column ? ` • Column ${unit.grid_column}` : ""}
              </p>
            </div>
          </div>

          {unit.description && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {unit.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Associated Leases Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lease Agreements History ({leases.length})
            </h3>
          </div>
        </div>

        {leases.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No leases associated with this unit yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-2.5 px-3">Lease #</th>
                  <th className="py-2.5 px-3">Tenant Details</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">End Date</th>
                  <th className="py-2.5 px-3">Billing Day</th>
                  <th className="py-2.5 px-3">Rent + Charges</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {leases.map((lease) => (
                  <tr
                    key={lease.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {lease.lease_number}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {lease.tenant_first_name} {lease.tenant_last_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lease.tenant_email}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(lease.start_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {lease.end_date
                        ? new Date(lease.end_date).toLocaleDateString()
                        : "Month-to-month"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      Day {lease.billing_day}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      ${lease.rentpluscharges?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={lease.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/leases/${lease.id}/print`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isLeaseModalOpen && leaseBuilding.length > 0 && (
        <LeaseModal
          lease={null}
          leases={leases}
          buildings={leaseBuilding}
          tenants={tenants}
          isOpen={isLeaseModalOpen}
          onClose={() => setIsLeaseModalOpen(false)}
          onSuccess={() => void fetchData()}
          defaultBuildingId={unit.building_id}
          defaultUnitId={unit.id}
        />
      )}
    </div>
  );
}
