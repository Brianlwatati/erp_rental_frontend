"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Lock,
  FileCheck,
  Printer,
  ExternalLink,
  Calendar,
  FileText,
} from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Building } from "@/types/property";
import { Tenant } from "@/types/tenant";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { InvoiceModal } from "@/components/billing/InvoiceModal";
import { LeaseModal } from "@/components/lease/modals/lease-modal";
import InfoModal from "@/components/ui/InfoModal";

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  const handleEdit = (lease: Lease) => {
    if (lease.lease_invoice_id != null) {
      setBlockedLease(lease);
      return;
    }

    setSelectedLease(lease);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedLease(null);
    setInvoiceLeaseId(undefined);
    setIsModalOpen(true);
  };

  const handleCreateInvoice = (lease: Lease) => {
    if (lease.lease_invoice_id != null) return;
    setSelectedLease(null);
    setInvoiceLeaseId(lease.id);
    setIsInvoiceModalOpen(true);
  };

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);

  const filteredLeases = leases.filter((lease) => {
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

  const columns: Column<Lease>[] = [
    {
      header: "Lease #",
      accessor: (row) => (
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 block">
              {row.lease_number}
            </span>
            {row.lease_invoice_id != null && (
              <span
                title="This lease has been invoiced and is locked from editing."
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
              >
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                Invoiced
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(row.start_date).toLocaleDateString()} &ndash;{" "}
            {row.end_date
              ? new Date(row.end_date).toLocaleDateString()
              : "Ongoing"}
          </span>
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: (row) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-800 block">
            Unit {row.unit_number || row.unit_id.slice(0, 6)}
          </span>
          <span className="text-xs text-slate-500 text-nowrap">
            {row.building_name || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Tenant",
      accessor: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">
            {row.tenant_first_name || row.tenant_last_name
              ? `${row.tenant_first_name || ""} ${row.tenant_last_name || ""}`
              : "—"}
          </span>
          {row.tenant_email && (
            <span className="text-xs text-slate-500 block">
              {row.tenant_email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Monthly Rent",
      accessor: (row) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(row.monthly_rent)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link
            href={`/leases/${row.id}/print`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
          >
            <Printer aria-hidden="true" className="h-3.5 w-3.5" />
            View
          </Link>

          {row.lease_invoice_id == null && (
            <button
              type="button"
              onClick={() => handleCreateInvoice(row)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              <FileCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Invoice
            </button>
          )}

          {row.lease_invoice_id != null ? (
            <span
              aria-disabled="true"
              title="Details are unavailable for invoiced leases as they cannot be changed"
              className="cursor-not-allowed text-xs font-semibold text-slate-400 inline-flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              L.Charges
            </span>
          ) : (
            <Link
              href={`/leases/${row.id}`}
              className="text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              L.Charges
            </Link>
          )}

          <button
            onClick={() => handleEdit(row)}
            aria-disabled={row.lease_invoice_id != null}
            title={
              row.lease_invoice_id != null
                ? "This lease has already been invoiced and cannot be edited or modified"
                : undefined
            }
            className={`text-xs font-semibold inline-flex items-center gap-1 ${
              row.lease_invoice_id != null
                ? "cursor-not-allowed text-slate-400"
                : "text-blue-600 hover:underline cursor-pointer"
            }`}
          >
            {row.lease_invoice_id != null && (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
            Edit
          </button>
        </div>
      ),
    },
  ];

  const renderExpandedRow = (lease: Lease) => {
    const extraCharges =
      (lease.rentpluscharges || 0) - (lease.monthly_rent || 0);

    const includesDeposit = Boolean(lease.include_deposit_in_first_invoice);
    const depositAmount = Number(lease.deposit_amount) || 0;
    const totalRentAndCharges = Number(lease.rentpluscharges) || 0;

    // Total payable calculation based on include_deposit_in_first_invoice flag
    const totalInitialPayable = includesDeposit
      ? totalRentAndCharges + depositAmount
      : totalRentAndCharges;

    return (
      <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-4 bg-slate-50/90 border-l-4 border-blue-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Extra Charges Breakdown */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Extra Charges
            </span>
            <span className="text-sm font-bold text-slate-800 block">
              {formatCurrency(extraCharges)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Rent + Extra: {formatCurrency(totalRentAndCharges)}
            </span>
          </div>

          {/* Total Initial Payable */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Total Payable
            </span>
            <span className="text-sm font-bold text-slate-900 block">
              {formatCurrency(totalInitialPayable)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {includesDeposit
                ? `Includes Deposit (${formatCurrency(depositAmount)})`
                : `Excludes Deposit (${formatCurrency(depositAmount)})`}
            </span>
          </div>

          {/* Billing Terms & Deposit Inclusion */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Billing Terms
            </span>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Day {lease.billing_day || "1"} of month</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Deposit in First Invoice:{" "}
              <strong className="text-slate-700">
                {includesDeposit ? "Yes" : "No"}
              </strong>
            </span>
          </div>

          {/* Invoice Reference */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Invoice Reference
              </span>
              {lease.lease_invoice_id ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Invoiced</span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Not invoiced yet</span>
              )}
            </div>

            {lease.lease_invoice_id && (
              <Link
                href={`/billing/${lease.lease_invoice_id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Linked Invoice
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Description / Notes */}
        {lease.notes && (
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Description / Terms Notes
            </span>
            <p className="text-slate-600 text-xs leading-relaxed">
              {lease.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-0 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
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
          className="px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
        >
          + Create Lease
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by lease #, unit number, or tenant name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INVOICED">INVOICED (Locked)</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="TERMINATED">TERMINATED</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading lease contracts...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeases}
          emptyMessage="No lease agreements found."
          renderExpandedRow={renderExpandedRow}
        />
      )}

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
