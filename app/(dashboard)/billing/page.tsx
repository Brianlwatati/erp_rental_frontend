"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { Invoice, InvoiceModal } from "@/components/billing/InvoiceModal";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Per-invoice loading state for action buttons
  const [issuingId, setIssuingId] = useState<string | null>(null);

  // Modals & Selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invData, leaseData, tenantData] = await Promise.all([
        apiFetch<Invoice[]>("/invoices"),
        apiFetch<Lease[]>("/leases"),
        apiFetch<Tenant[]>("/tenants"),
      ]);
      setInvoices(invData.data || []);
      setLeases(leaseData.data || []);
      setTenants(tenantData.data || []);
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  // Issue Draft Invoice Functionality
  const handleIssue = async (invoice: Invoice) => {
    if (
      !confirm(
        `Are you sure you want to issue invoice #${invoice.invoice_number}?`,
      )
    ) {
      return;
    }

    setIssuingId(invoice.id);
    try {
      await apiFetch(`/invoices/${invoice.id}/issue`, {
        method: "POST",
        body: JSON.stringify({
          id: invoice.id,
          tenantId: invoice.tenant_id,
        }),
      });

      // Refresh list to update badge to ISSUED
      await fetchData();
    } catch (err: any) {
      console.error("Failed to issue invoice:", err);
      alert(err.message || "Failed to issue invoice. Please try again.");
    } finally {
      setIssuingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.tenant_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      DRAFT: "bg-slate-100 text-slate-700 border-slate-300",
      ISSUED: "bg-blue-50 text-blue-700 border-blue-200",
      PARTIALLY_PAID: "bg-amber-50 text-amber-700 border-amber-200",
      PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
      OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
      CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
    };
    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
          styles[status] || styles.DRAFT
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Billing & Invoices
          </h1>
          <p className="text-xs text-slate-500">
            Manage tenant invoices, utility billing, and rent collection state.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          + Create Invoice
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by invoice number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        />

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ISSUED">ISSUED</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No invoices found.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 font-semibold text-slate-900">
                    {inv.invoice_number}
                  </td>
                  <td className="p-3">
                    {inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    KES {Number(inv.total).toLocaleString()}
                  </td>
                  <td className="p-3 text-emerald-600 font-medium">
                    KES {Number(inv.amount_paid).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    KES {Number(inv.balance).toLocaleString()}
                  </td>
                  <td className="p-3">{getStatusBadge(inv.status)}</td>
                  <td className="p-3 text-right space-x-2">
                    {/* Issue Button: Rendered only when status is DRAFT */}
                    {inv.status === "DRAFT" && (
                      <button
                        onClick={() => handleIssue(inv)}
                        disabled={issuingId === inv.id}
                        className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs disabled:opacity-50"
                      >
                        {issuingId === inv.id ? "Issuing..." : "Issue"}
                      </button>
                    )}

                    <button
                      onClick={() => handleEdit(inv)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        leases={leases}
        tenants={tenants}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
