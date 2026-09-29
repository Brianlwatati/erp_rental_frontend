"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Invoice } from "@/types/invoice";
import { formatBillingDate } from "@/lib/billing_dates";

export default function BillingDetailsPage() {
  const params = useParams();
  const billId = params.id as string;

  const [bill, setBill] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBill = useCallback(async () => {
    if (!billId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch<Invoice>(`/invoices/${billId}`);
      setBill(response.data);
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
    fetchBill();
  }, [fetchBill]);

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
        Loading bill record...
      </div>
    );
  }

  if (error || !bill) {
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

  return (
    <div className="p-0 max-w-7xl mx-auto space-y-5 sm:space-y-6 text-slate-800">
      <Link
        href="/billing"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        &larr; Back to Billing
      </Link>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Invoice Details
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">
              {bill.invoice_number || "Invoice"}
            </h1>
          </div>
          <span className="inline-flex self-start px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
            {bill.status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(bill.total)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Paid</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">
              {formatCurrency(bill.amount_paid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Balance</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(bill.balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Due Date</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {bill.due_date ? formatBillingDate(bill.due_date) : "N/A"}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Billing Information
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <dt className="text-slate-500">Tenant ID</dt>
            <dd className="mt-1 font-semibold text-slate-800 break-all">
              {bill.tenant_id}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Lease ID</dt>
            <dd className="mt-1 font-semibold text-slate-800 break-all">
              {bill.lease_id}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Invoice Date</dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {bill.invoice_date ? formatBillingDate(bill.invoice_date) : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Billing Period</dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {formatBillingDate(bill.period_start)} -{" "}
              {formatBillingDate(bill.period_end)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {formatCurrency(bill.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Tax / Discount</dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {formatCurrency(bill.tax)} / {formatCurrency(bill.discount)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Invoice Items</h2>
        </div>
        {bill.items?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="p-3 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="p-3">{item.itemType}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900">
                      {formatCurrency(
                        item.amount ?? item.quantity * item.unitPrice,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-xs text-slate-500">
            No line items are available for this invoice.
          </p>
        )}
      </section>

      {bill.notes && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Notes</h2>
          <p className="text-xs text-slate-600 whitespace-pre-wrap">
            {bill.notes}
          </p>
        </section>
      )}
    </div>
  );
}
