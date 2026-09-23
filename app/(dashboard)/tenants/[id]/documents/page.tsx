"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Tenant } from "@/types/tenant";
import { StatusBadge } from "@/components/ui/badge";
import { TenantDocumentsTab } from "@/components/tenant/tenant-documents-tab";

export default function TenantDocumentsPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<Tenant>(`/tenants/${tenantId}`);
      setTenant(res.data);
    } catch (err: any) {
      console.error("Failed to load tenant details:", err);
      setError(err.message || "Failed to load tenant profile.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
    }
  }, [tenantId, fetchTenantDetails]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading tenant record...
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <Link
          href="/tenants"
          className="inline-flex items-center text-xs text-blue-600 font-semibold hover:underline"
        >
          &larr; Back to Tenants
        </Link>
        <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error || "Tenant not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div>
        <Link
          href="/tenants"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
        >
          &larr; Back to Tenants Directory
        </Link>

        {/* Tenant Header Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                {tenant.first_name} {tenant.last_name}
              </h1>
              <StatusBadge status={tenant.status} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {tenant.national_id && (
                <span>
                  ID / Passport:{" "}
                  <strong className="text-slate-700">
                    {tenant.national_id}
                  </strong>
                </span>
              )}
              {tenant.phone && (
                <span>
                  Phone:{" "}
                  <strong className="text-slate-700">{tenant.phone}</strong>
                </span>
              )}
              {tenant.email && (
                <span>
                  Email:{" "}
                  <strong className="text-slate-700">{tenant.email}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Documents Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <TenantDocumentsTab tenantId={tenantId} />
      </div>
    </div>
  );
}
