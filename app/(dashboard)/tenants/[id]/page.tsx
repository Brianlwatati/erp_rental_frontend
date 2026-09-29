"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Tenant } from "@/types/tenant";
import { Lease } from "@/types/lease";
import { Payment } from "@/types/payment";
import { Invoice } from "@/types/invoice";

interface TenantDetailsData {
  tenant: Tenant | null;
  leases: Lease[];
  invoices: Invoice[];
  payments: Payment[];
}

export default function TenantPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [data, setData] = useState<TenantDetailsData>({
    tenant: null,
    leases: [],
    invoices: [],
    payments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError(null);

      // Execute all sub-requests concurrently
      const [tenantRes, leasesRes, invoicesRes, paymentsRes] =
        await Promise.all([
          apiFetch<Tenant>(`/tenants/${tenantId}`),
          apiFetch<Lease[]>(`/leases/tenantleases/${tenantId}`),
          apiFetch<Invoice[]>(`/invoices/tenantinvoices/${tenantId}`),
          apiFetch<Payment[]>(`/payments/tenantpayments/${tenantId}`),
        ]);

      setData({
        tenant: tenantRes.data,
        leases: leasesRes.data || [],
        invoices: invoicesRes.data || [],
        payments: paymentsRes.data || [],
      });
    } catch (err: any) {
      console.error("Failed to load tenant profile:", err);
      setError(err.message || "Failed to load tenant record.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm animate-pulse">
        Loading tenant record...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {data.tenant?.first_name || "Tenant Details"}
      </h1>
      {/* UI components consuming data.leases, data.invoices, etc. */}
    </div>
  );
}
