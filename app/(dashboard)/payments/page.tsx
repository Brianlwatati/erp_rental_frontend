"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Payment } from "@/types/payment";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { Tenant } from "@/types/tenant";
import { Invoice } from "@/types/invoice";

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const preselectedInvoiceId = searchParams.get("invoiceId") || undefined;
  const preselectedTenantId = searchParams.get("tenantId") || undefined;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(
    Boolean(preselectedInvoiceId || preselectedTenantId),
  );
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsData, tenantsData, invoicesData] = await Promise.all([
        apiFetch<Payment[]>("/payments"),
        apiFetch<Tenant[]>("/tenants"),
        apiFetch<Invoice[]>("/invoices/not-fully-paid"),
      ]);

      setPayments(paymentsData.data || []);
      setTenants(tenantsData.data || []);
      setUnpaidInvoices(
        (invoicesData.data || []).map((invoice) => {
          const apiInvoice = invoice as Invoice & {
            tenant_id?: string;
            invoice_number?: string;
            due_date?: string;
          };

          return {
            ...invoice,
            tenantId: invoice.tenantId || apiInvoice.tenant_id || "",
            invoiceNumber:
              invoice.invoiceNumber || apiInvoice.invoice_number || "",
            dueDate: invoice.dueDate || apiInvoice.due_date || "",
          };
        }),
      );
    } catch (err) {
      console.error("Failed to load payment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rental Payments</h1>
          <p className="text-xs text-slate-500">
            Track transactions, M-PESA receipts, and invoice allocations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
        >
          + Record Payment
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading payments...
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Payment No.</th>
                <th className="p-3">Date</th>
                <th className="p-3">Method</th>
                <th className="p-3">Ref Code</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-900">
                    {p.payment_number}
                  </td>
                  <td className="p-3">{p.payment_date}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px]">
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    {p.reference_number || "—"}
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    KES {p.amount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "POSTED"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "REVERSED"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contextual Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        tenants={tenants}
        unpaidInvoices={unpaidInvoices}
        preselectedTenantId={preselectedTenantId}
        preselectedInvoiceId={preselectedInvoiceId}
      />
    </div>
  );
}
