"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api_client";

interface Invoice {
  id: string;
  invoice_number: string;
  tenant_name?: string;
  amount_due: number;
  amount_paid: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
  due_date: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Invoice[]>("/invoices")
      .then((res) => setInvoices(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
            Paid
          </span>
        );
      case "OVERDUE":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Overdue
          </span>
        );
      case "PARTIAL":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
            Partial
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Billing & Invoices
          </h1>
          <p className="text-sm text-slate-500">
            Track tenant balances, recurring rent charges, and payment
            histories.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          + Generate Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading invoices...
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Amount Due</th>
                <th className="px-6 py-3">Amount Paid</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ${Number(inv.amount_due).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">
                    ${Number(inv.amount_paid || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
