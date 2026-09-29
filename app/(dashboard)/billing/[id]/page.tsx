"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Invoice } from "@/types/invoice";
import { Tenant } from "@/types/tenant";
import { Lease } from "@/types/lease";
import { formatBillingDate } from "@/lib/billing_dates";

interface BillingDetailsState {
  bill: Invoice | null;
  tenant: Tenant | null;
  lease: Lease | null;
}

export default function BillingDetailsPage() {
  const params = useParams();
  const billId = params.id as string;

  const [data, setData] = useState<BillingDetailsState>({
    bill: null,
    tenant: null,
    lease: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!billId) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch the invoice first to get tenant_id and lease_id
      const invoiceRes = await apiFetch<Invoice>(`/invoices/${billId}`);
      const invoiceData = invoiceRes.data;

      if (!invoiceData) {
        throw new Error("Invoice record not found.");
      }

      // 2. Fetch tenant and lease details concurrently if IDs are present
      const tenantPromise = invoiceData.tenant_id
        ? apiFetch<Tenant>(`/tenants/${invoiceData.tenant_id}`).catch((err) => {
            console.warn("Failed to fetch tenant details:", err);
            return { data: null };
          })
        : Promise.resolve({ data: null });

      const leasePromise = invoiceData.lease_id
        ? apiFetch<Lease>(`/leases/${invoiceData.lease_id}`).catch((err) => {
            console.warn("Failed to fetch lease details:", err);
            return { data: null };
          })
        : Promise.resolve({ data: null });

      const [tenantRes, leaseRes] = await Promise.all([
        tenantPromise,
        leasePromise,
      ]);

      setData({
        bill: invoiceData,
        tenant: tenantRes.data,
        lease: leaseRes.data,
      });
    } catch (err) {
      console.error("Failed to load invoice details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load invoice details.",
      );
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const formatCurrency = (value?: string | number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
        Loading invoice details...
      </div>
    );
  }

  if (error || !data.bill) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/billing"
          className="inline-flex items-center text-xs text-blue-600 font-semibold hover:underline"
        >
          &larr; Back to Invoices
        </Link>
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error || "Invoice not found."}
        </div>
      </div>
    );
  }

  const { bill, tenant, lease } = data;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 text-slate-800 bg-slate-50/50 min-h-screen">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/billing"
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            &larr; Back to Invoices
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {bill.invoice_number}
            </h1>
            <span
              className={`px-3 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${
                bill.status === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : bill.status === "OVERDUE"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {bill.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Invoice
          </button>
        </div>
      </div>

      {/* Main Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
        {/* Invoice Metadata Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block uppercase font-semibold text-[10px]">
              Invoice Date
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {formatBillingDate(bill.invoice_date)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold text-[10px]">
              Due Date
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {formatBillingDate(bill.due_date)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold text-[10px]">
              Billing Period Start
            </span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {formatBillingDate(bill.period_start)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-semibold text-[10px]">
              Billing Period End
            </span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {formatBillingDate(bill.period_end)}
            </span>
          </div>
        </div>

        {/* Tenant & Lease Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Tenant Details */}
          <div className="border border-slate-200 rounded-lg p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Billed To (Tenant)
            </h3>
            {tenant ? (
              <div className="space-y-1">
                <Link
                  href={`/tenants/${tenant.id}`}
                  className="text-sm font-bold text-slate-900 hover:text-blue-600 block transition-colors"
                >
                  {tenant.first_name} {tenant.last_name}
                </Link>
                <p className="text-slate-600">{tenant.email}</p>
                <p className="text-slate-600">{tenant.phone}</p>
                {tenant.national_id && (
                  <p className="text-slate-500 font-mono text-[11px] mt-1">
                    ID / Passport: {tenant.national_id}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Tenant ID: <span className="font-mono">{bill.tenant_id}</span>
              </p>
            )}
          </div>

          {/* Lease Details */}
          <div className="border border-slate-200 rounded-lg p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Lease & Property Information
            </h3>
            {lease ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {lease.property_name} • Unit {lease.unit_number}
                </p>
                <p className="text-slate-600">
                  Building: {lease.building_name} ({lease.building_code})
                </p>
                <p className="text-slate-500 font-mono text-[11px] mt-1">
                  Lease No: {lease.lease_number}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Lease ID: <span className="font-mono">{bill.lease_id}</span>
              </p>
            )}
          </div>
        </div>

        {/* Invoice Line Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Invoice Items
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items && bill.items.length > 0 ? (
                  bill.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                          {item.item_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {Number(item.quantity)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-slate-400 italic"
                    >
                      No items listed on this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t border-slate-200">
          <div className="text-xs space-y-1 text-slate-500 max-w-xs">
            {bill.notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <span className="font-bold block mb-0.5">Notes:</span>
                {bill.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(bill.subtotal)}
              </span>
            </div>
            {Number(bill.discount || 0) > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                <span>Discount:</span>
                <span className="font-semibold">
                  -{formatCurrency(bill.discount)}
                </span>
              </div>
            )}
            {Number(bill.tax || 0) > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tax:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(bill.tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-slate-200 font-bold text-sm text-slate-900">
              <span>Total Amount:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
              <span>Amount Paid:</span>
              <span className="font-semibold">
                {formatCurrency(bill.amount_paid)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm font-black">
              <span className="text-slate-700">Balance Due:</span>
              <span
                className={
                  Number(bill.balance) > 0
                    ? "text-rose-600"
                    : "text-emerald-600"
                }
              >
                {formatCurrency(bill.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
