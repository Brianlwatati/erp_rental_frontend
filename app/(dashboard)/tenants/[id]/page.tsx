"use client";

import React, { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Tenant } from "@/types/tenant";

export default function TenantPage() {
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

  // Load the lease of the client
  // load the invoices of the client
  // load the payments of the client
  // Expenses of the client

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading tenant record...
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Tenant Details</h1>
    </div>
  );
}
