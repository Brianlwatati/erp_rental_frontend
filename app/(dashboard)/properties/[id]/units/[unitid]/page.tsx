"use client";

import React, { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Building as BuildingMy, Unit } from "@/types/property";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { InvoiceModal } from "@/components/billing/InvoiceModal";
import { LeaseModal } from "@/components/lease/modals/lease-modal";
import { UnitLeaseHistory } from "@/components/property/unit/unit-lease-history";
import {
  UnitDetailHeader,
  UnitSpecifications,
  UnitSummaryCards,
  VacantUnitNotice,
} from "@/components/property/unit/unit-detail-sections";

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ unitid: string }>;
}) {
  const { unitid } = use(params);
  const router = useRouter();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceLeaseId, setInvoiceLeaseId] = useState<string | null>(null);
  const [invoicePreparingLeaseId, setInvoicePreparingLeaseId] = useState<
    string | null
  >(null);
  const [invoiceSetupError, setInvoiceSetupError] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
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
    } catch (err: unknown) {
      console.error("Failed to load unit details or leases:", err);
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [unitid]);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(() => {
      if (isCurrent && unitid) return fetchData();
    });

    return () => {
      isCurrent = false;
    };
  }, [unitid, fetchData]);

  const handleOpenLeaseModal = async (lease: Lease | null = null) => {
    if (
      lease ? lease.lease_invoice_id != null : !unit || unit.status !== "VACANT"
    ) {
      return;
    }
    if (leaseSetupLoading) return;

    const buildingId = lease?.building_id || unit?.building_id;
    if (!buildingId) return;

    setLeaseSetupLoading(true);
    setLeaseSetupError(null);
    setSelectedLease(lease);
    try {
      const [buildingRes, tenantsRes] = await Promise.all([
        apiFetch<BuildingMy>(`/buildings/${buildingId}`),
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

  const handleOpenInvoiceModal = async (lease: Lease) => {
    if (lease.lease_invoice_id != null || invoicePreparingLeaseId) return;

    setInvoicePreparingLeaseId(lease.id);
    setInvoiceSetupError(null);
    try {
      if (tenants.length === 0) {
        const tenantsRes = await apiFetch<Tenant[]>("/tenants");
        setTenants(tenantsRes.data || []);
      }
      setInvoiceLeaseId(lease.id);
      setIsInvoiceModalOpen(true);
    } catch (err: unknown) {
      setInvoiceSetupError(
        err instanceof Error ? err.message : "Could not prepare invoice.",
      );
    } finally {
      setInvoicePreparingLeaseId(null);
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
      <UnitDetailHeader
        unit={unit}
        leaseSetupLoading={leaseSetupLoading}
        onBack={() => router.back()}
        onCreateLease={() => void handleOpenLeaseModal()}
      />
      {isVacant && (
        <VacantUnitNotice
          leaseSetupLoading={leaseSetupLoading}
          error={leaseSetupError}
          onCreateLease={() => void handleOpenLeaseModal()}
        />
      )}

      <UnitSummaryCards unit={unit} />
      <UnitSpecifications unit={unit} />

      {/* Associated Leases Section */}
      {invoiceSetupError && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {invoiceSetupError}
        </p>
      )}
      <UnitLeaseHistory
        leases={leases}
        onEdit={handleOpenLeaseModal}
        onInvoice={(lease) => void handleOpenInvoiceModal(lease)}
        invoicePreparingLeaseId={invoicePreparingLeaseId}
      />

      {isLeaseModalOpen && leaseBuilding.length > 0 && (
        <LeaseModal
          lease={selectedLease}
          leases={leases}
          buildings={leaseBuilding}
          tenants={tenants}
          isOpen={isLeaseModalOpen}
          onClose={() => {
            setIsLeaseModalOpen(false);
            setSelectedLease(null);
          }}
          onSuccess={() => void fetchData()}
          defaultBuildingId={selectedLease?.building_id || unit.building_id}
          defaultUnitId={selectedLease ? undefined : unit.id}
        />
      )}
      {isInvoiceModalOpen && (
        <InvoiceModal
          invoice={null}
          leases={leases}
          tenants={tenants}
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setInvoiceLeaseId(null);
          }}
          onSuccess={() => void fetchData()}
          defaultLeaseId={invoiceLeaseId || undefined}
        />
      )}
    </div>
  );
}
