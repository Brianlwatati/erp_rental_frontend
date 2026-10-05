"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Building } from "@/types/property";
import { Tenant } from "@/types/tenant";
import { DataTable } from "@/components/ui/data-table";
import { InvoiceModal } from "@/components/billing/InvoiceModal";
import { LeaseModal } from "@/components/lease/modals/lease-modal";
import InfoModal from "@/components/ui/InfoModal";

// Modular Sub-components
import { LeaseEmptyState } from "@/components/lease/LeaseEmptyState";
import { LeaseFilters } from "@/components/lease/LeaseFilters";
import { LeaseExpandedRow } from "@/components/lease/LeaseExpandedRow";
import { getLeaseColumns } from "@/components/lease/LeaseColumns";

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [invoiceLeaseId, setInvoiceLeaseId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [blockedLease, setBlockedLease] = useState<Lease | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leasesRes, buildingsRes, tenantsRes] = await Promise.all([
        apiFetch<Lease[]>("/leases").catch(() => ({ data: [] })),
        apiFetch<Building[]>("/buildings/all").catch(() => ({ data: [] })),
        apiFetch<Tenant[]>("/tenants").catch(() => ({ data: [] })),
      ]);

      setLeases(leasesRes.data || []);
      setBuildings(buildingsRes.data || []);
      setTenants(tenantsRes.data || []);
    } catch (err) {
      console.error("Failed to load leases data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(() => {
      if (isCurrent) return fetchData();
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchData]);

  const handleEdit = useCallback((lease: Lease) => {
    if (lease.lease_invoice_id != null) {
      setBlockedLease(lease);
      return;
    }
    setSelectedLease(lease);
    setIsModalOpen(true);
  }, []);

  const handleNew = () => {
    setSelectedLease(null);
    setInvoiceLeaseId(undefined);
    setIsModalOpen(true);
  };

  const handleCreateInvoice = useCallback((lease: Lease) => {
    if (lease.lease_invoice_id != null) return;
    setSelectedLease(null);
    setInvoiceLeaseId(lease.id);
    setIsInvoiceModalOpen(true);
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const filteredLeases = useMemo(() => {
    return leases.filter((lease) => {
      const tenantName = `${lease.tenant_first_name || ""} ${
        lease.tenant_last_name || ""
      }`.trim();
      const unitNo = lease.unit_number || "";
      const leaseNo = lease.lease_number || "";

      const matchesSearch =
        tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unitNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaseNo.toLowerCase().includes(searchTerm.toLowerCase());

      const isInvoiced = lease.lease_invoice_id != null;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "INVOICED"
          ? isInvoiced
          : lease.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [leases, searchTerm, statusFilter]);

  const columns = useMemo(
    () =>
      getLeaseColumns({
        onEdit: handleEdit,
        onCreateInvoice: handleCreateInvoice,
      }),
    [handleEdit, handleCreateInvoice],
  );

  return (
    <div className="p-0 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lease Agreements
          </h1>
          <p className="text-xs text-slate-500">
            Manage active tenancy contracts, rental terms, and extra charges.
          </p>
        </div>

        <button
          onClick={handleNew}
          className="px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          + Create Lease
        </button>
      </div>

      {/* Filter Controls (rendered only when base lease records exist) */}
      {leases.length > 0 && (
        <LeaseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      )}

      {/* Main Content / Views */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
          Loading lease contracts...
        </div>
      ) : leases.length === 0 ? (
        /* Base empty view when database is empty */
        <LeaseEmptyState onCreateNew={handleNew} />
      ) : filteredLeases.length === 0 ? (
        /* Empty view when search/filters yield zero results */
        <LeaseEmptyState
          onCreateNew={handleNew}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onClearFilters={clearFilters}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeases}
          emptyMessage="No lease agreements found."
          renderExpandedRow={(lease) => <LeaseExpandedRow lease={lease} />}
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <LeaseModal
          lease={selectedLease}
          leases={leases}
          buildings={buildings}
          tenants={tenants}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
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
            setInvoiceLeaseId(undefined);
          }}
          onSuccess={fetchData}
          defaultLeaseId={invoiceLeaseId}
        />
      )}

      <InfoModal
        isOpen={blockedLease !== null}
        onClose={() => setBlockedLease(null)}
        title="Lease Already Invoiced"
        description={
          blockedLease
            ? `Lease ${blockedLease.lease_number} has already been invoiced to the tenant. Invoiced leases are locked and cannot be edited or modified.`
            : ""
        }
      />
    </div>
  );
}
