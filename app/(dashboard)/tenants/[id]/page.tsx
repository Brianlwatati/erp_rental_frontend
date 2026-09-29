"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<
    "leases" | "invoices" | "payments" | "info"
  >("leases");

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

  // Formatters
  const formatCurrency = (val?: string | number) => {
    const num = Number(val || 0);
    return `KES ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Aggregated metrics
  const totalBalance = data.invoices.reduce(
    (acc, inv) => acc + Number(inv.balance || 0),
    0,
  );
  const totalPaid = data.payments.reduce(
    (acc, pmt) => acc + Number(pmt.amount || 0),
    0,
  );
  const activeLeases = data.leases.filter((l) => l.status === "ACTIVE").length;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
        Loading tenant record...
      </div>
    );
  }

  if (error || !data.tenant) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/tenants"
          className="inline-flex items-center text-xs text-blue-600 font-semibold hover:underline"
        >
          &larr; Back to Tenants
        </Link>
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error || "Tenant record not found."}
        </div>
      </div>
    );
  }

  const { tenant, leases, invoices, payments } = data;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 bg-slate-50/50 min-h-screen">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/tenants"
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            &larr; Back to Tenants List
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {tenant.first_name} {tenant.last_name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${tenant.phone}`}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Call Tenant
          </a>
          <a
            href={`mailto:${tenant.email}`}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email Tenant
          </a>
        </div>
      </div>

      {/* Tenant Profile Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                  tenant.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {tenant.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {tenant.national_id || "N/A"}
              </span>
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-bold text-slate-900">
                {tenant.first_name} {tenant.last_name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{tenant.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">{tenant.phone}</p>
              <p className="text-xs text-slate-500 mt-1">
                📍 {tenant.address || "No address provided"}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-700 block mb-1">
              Emergency Contact:
            </span>
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium text-slate-900">
                {tenant.emergency_contact_name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span className="font-medium text-slate-900">
                {tenant.emergency_contact_phone || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Outstanding
            </span>
            <div className="my-2">
              <p
                className={`text-2xl font-black ${
                  totalBalance > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Unpaid balances across all invoices
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Paid to Date
            </span>
            <div className="my-2">
              <p className="text-2xl font-black text-slate-900">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Total posted payment transactions
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Leases
            </span>
            <div className="my-2">
              <p className="text-2xl font-black text-slate-900">
                {activeLeases}
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              {leases.length} total historical leases
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 pt-3 flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("leases")}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === "leases"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Leases ({leases.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === "invoices"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === "payments"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === "info"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Full Profile
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* LEASES TAB */}
          {activeTab === "leases" && (
            <div>
              {leases.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No lease records found for this tenant.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leases.map((lease) => (
                    <div
                      key={lease.id}
                      className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {lease.lease_number}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                            {lease.property_name} • Unit {lease.unit_number}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {lease.building_name} ({lease.building_code})
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            lease.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lease.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-md border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Monthly Rent
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(lease.monthly_rent)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Deposit
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(lease.deposit_amount)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Start Date
                          </span>
                          <span className="font-medium text-slate-800">
                            {formatDate(lease.start_date)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            End Date
                          </span>
                          <span className="font-medium text-slate-800">
                            {formatDate(lease.end_date)}
                          </span>
                        </div>
                      </div>

                      {lease.notes && (
                        <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2.5 rounded border border-amber-100">
                          &ldquo;{lease.notes}&rdquo;
                        </p>
                      )}

                      <div className="pt-2 flex justify-end">
                        <Link
                          href={`/leases/${lease.id}/print`}
                          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          View Printable Lease &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === "invoices" && (
            <div className="overflow-x-auto">
              {invoices.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No invoices recorded for this tenant.
                </p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-right">Paid</th>
                      <th className="py-3 px-4 text-right">Balance</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(inv.invoice_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(inv.due_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(inv.period_start)} -{" "}
                          {formatDate(inv.period_end)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                          {formatCurrency(inv.amount_paid)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(inv.balance)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              inv.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : inv.status === "OVERDUE"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div className="overflow-x-auto">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No payments recorded for this tenant.
                </p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Payment Ref #</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {pmt.payment_number}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(pmt.payment_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                            {pmt.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {formatCurrency(pmt.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              pmt.status === "POSTED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pmt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* FULL PROFILE TAB */}
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">First Name:</span>
                    <span className="font-semibold text-slate-900">
                      {tenant.first_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Last Name:</span>
                    <span className="font-semibold text-slate-900">
                      {tenant.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">
                      National ID / Passport:
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {tenant.national_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-900">
                      {tenant.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  Emergency Contact & System Metadata
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Contact Name:</span>
                    <span className="font-semibold text-slate-900">
                      {tenant.emergency_contact_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Contact Phone:</span>
                    <span className="font-medium text-slate-900">
                      {tenant.emergency_contact_phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Tenant Created:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(tenant.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Last Updated:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(tenant.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
