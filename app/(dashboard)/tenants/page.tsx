"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";
import { Tenant } from "@/types/tenant";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { TenantModal } from "@/components/tenant/tenant-modal";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<Tenant[]>("/tenants");
      setTenants(res.data);
    } catch (err) {
      console.error("Failed to load tenants:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      `${tenant.first_name} ${tenant.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (tenant.email &&
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tenant.phone && tenant.phone.includes(searchTerm)) ||
      (tenant.national_id && tenant.national_id.includes(searchTerm));

    const matchesStatus =
      statusFilter === "ALL" || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: Column<Tenant>[] = [
    {
      header: "Tenant Name",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.first_name} {row.last_name}
          </span>
          {row.national_id && (
            <span className="text-[11px] text-slate-500 block">
              ID: {row.national_id}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Contact Information",
      accessor: (row) => (
        <div className="text-xs">
          {row.phone && (
            <div className="text-slate-800 font-medium">{row.phone}</div>
          )}
          {row.email && <div className="text-slate-500">{row.email}</div>}
          {!row.phone && !row.email && (
            <span className="text-slate-400">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Emergency Contact",
      accessor: (row) => (
        <div className="text-xs">
          {row.emergency_contact_name ? (
            <>
              <div className="font-medium text-slate-800">
                {row.emergency_contact_name}
              </div>
              <div className="text-slate-500">
                {row.emergency_contact_phone || "No phone"}
              </div>
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
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
            href={`/tenants/${row.id}/documents`}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
          >
            Docs
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
    <div className="p-0 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tenants Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage tenant profiles, contact details, and status.
          </p>
        </div>

        <button
          onClick={handleNew}
          className="px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          + Add Tenant
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, phone, or national ID..."
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
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BLACKLISTED">BLACKLISTED</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading tenants...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTenants}
          emptyMessage="No tenants found."
        />
      )}

      {isModalOpen && (
        <TenantModal
          tenant={selectedTenant}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTenants}
        />
      )}
    </div>
  );
}
