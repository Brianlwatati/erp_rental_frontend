"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";
import { Lease, LeaseStatus } from "@/types/lease";
import { Building, Unit } from "@/types/property";
import { Tenant } from "@/types/tenant";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { LeaseModal } from "@/components/lease/lease-modal";

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    fetchData();
  }, [fetchData]);

  const handleEdit = (lease: Lease) => {
    setSelectedLease(lease);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedLease(null);
    setIsModalOpen(true);
  };

  const filteredLeases = leases.filter((lease) => {
    const tenantName = lease.tenant
      ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
      : "";
    const unitNo = lease.unit?.unit_number || "";
    const leaseNo = lease.lease_number || "";

    const matchesSearch =
      tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unitNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leaseNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || lease.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: Column<Lease>[] = [
    {
      header: "Lease #",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.lease_number}
          </span>
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
        <div>
          <span className="font-semibold text-slate-800 block">
            Unit {row.unit?.unit_number || row.unit_id.slice(0, 6)}
          </span>
          <span className="text-xs text-slate-500">
            {row.unit?.building?.name || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Tenant",
      accessor: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">
            {row.tenant
              ? `${row.tenant.first_name} ${row.tenant.last_name}`
              : "—"}
          </span>
          <span className="text-xs text-slate-500">
            {row.tenant?.phone || row.tenant?.email || ""}
          </span>
        </div>
      ),
    },
    {
      header: "Monthly Rent",
      accessor: (row) => (
        <span className="font-bold text-slate-900">
          {new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(row.monthly_rent)}
        </span>
      ),
    },
    {
      header: "Billing Day",
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700">
          Day {row.billing_day}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/leases/${row.id}`}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
          >
            Details
          </Link>
          <button
            onClick={() => handleEdit(row)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
          className="px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm"
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
        />
      )}

      {isModalOpen && (
        <LeaseModal
          lease={selectedLease}
          buildings={buildings}
          tenants={tenants}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
