"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { InvoiceModal } from "@/components/billing/InvoiceModal";
import { Invoice } from "@/types/invoice";
import { formatBillingDate } from "@/lib/billing_dates";
import { IssueInvoiceConfirmModal } from "@/components/billing/billingmodal/IssueInvoiceConfirmModal";
import { PaymentModal } from "@/components/payment/PaymentModal";
import InfoModal from "@/components/ui/InfoModal";
import { DataTable, Column } from "@/components/ui/data-table";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

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
  const [invoiceToIssue, setInvoiceToIssue] = useState<Invoice | null>(null);
  const [invoiceToPay, setInvoiceToPay] = useState<Invoice | null>(null);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [invoiceEditNotice, setInvoiceEditNotice] = useState<Invoice | null>(
    null,
  );
  const [issueError, setIssueError] = useState<string | null>(null);
  const [invoiceActionError, setInvoiceActionError] = useState<string | null>(
    null,
  );
  const [invoiceActionLoading, setInvoiceActionLoading] = useState(false);

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
    if (invoice.status !== "DRAFT") {
      setInvoiceEditNotice(invoice);
      return;
    }

    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handlePay = (invoice: Invoice) => {
    setInvoiceToPay(invoice);
  };

  const confirmCancelInvoice = async () => {
    if (!invoiceToCancel) return;

    const target = invoiceToCancel;
    setInvoiceActionLoading(true);
    setInvoiceActionError(null);
    try {
      await apiFetch(`/invoices/${target.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ id: target.id, lease_id: target.lease_id }),
      });
      setInvoiceToCancel(null);
      await fetchData();
    } catch (err) {
      setInvoiceActionError(
        err instanceof Error ? err.message : "Failed to cancel invoice.",
      );
      setInvoiceToCancel(null);
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    const target = invoiceToDelete;
    setInvoiceActionLoading(true);
    setInvoiceActionError(null);
    try {
      await apiFetch(`/invoices/${target.id}`, { method: "DELETE" });
      setInvoiceToDelete(null);
      await fetchData();
    } catch (err) {
      setInvoiceActionError(
        err instanceof Error ? err.message : "Failed to delete invoice.",
      );
      setInvoiceToDelete(null);
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  // Issue Draft Invoice Functionality
  const handleIssue = (invoice: Invoice) => {
    setInvoiceToIssue(invoice);
    setIssueError(null);
  };

  const confirmIssue = async () => {
    if (!invoiceToIssue) return;

    const invoice = invoiceToIssue;
    setIssuingId(invoice.id);
    setIssueError(null);
    try {
      await apiFetch(`/invoices/${invoice.id}/issue`, {
        method: "POST",
        body: JSON.stringify({
          id: invoice.id,
          tenantId: invoice.tenant_id,
        }),
      });

      // Refresh list to update badge to ISSUED
      setInvoiceToIssue(null);
      await fetchData();
    } catch (err: any) {
      console.error("Failed to issue invoice:", err);
      setIssueError(
        err.message || "Failed to issue invoice. Please try again.",
      );
    } finally {
      setIssuingId(null);
    }
  };

  const closeIssueConfirm = () => {
    if (issuingId) return;
    setInvoiceToIssue(null);
    setIssueError(null);
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

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice #",
      accessor: (invoice) => (
        <span className="font-semibold text-slate-900">
          {invoice.invoice_number}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessor: (invoice) =>
        invoice.due_date ? formatBillingDate(invoice.due_date) : "-",
    },
    {
      header: "Total",
      accessor: (invoice) => (
        <span className="font-semibold text-slate-900">
          KES {Number(invoice.total).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Paid",
      accessor: (invoice) => (
        <span className="font-medium text-emerald-600">
          KES {Number(invoice.amount_paid).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Balance",
      accessor: (invoice) => (
        <span className="font-bold text-slate-900">
          KES {Number(invoice.balance).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (invoice) => getStatusBadge(invoice.status),
    },
    {
      header: "Actions",
      accessor: (invoice) => (
        <div className="flex min-w-max flex-wrap items-center justify-end gap-2">
          {invoice.status === "DRAFT" && (
            <button
              onClick={() => handleIssue(invoice)}
              disabled={issuingId === invoice.id}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
            >
              {issuingId === invoice.id ? "Issuing..." : "Issue"}
            </button>
          )}
          {(invoice.status === "ISSUED" ||
            invoice.status === "PARTIALLY_PAID") && (
            <button
              onClick={() => handlePay(invoice)}
              className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Record Payment
            </button>
          )}
          <Link
            href={`/billing/${invoice.id}`}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Details
          </Link>
          <button
            onClick={() => handleEdit(invoice)}
            aria-disabled={invoice.status !== "DRAFT"}
            title={
              invoice.status !== "DRAFT"
                ? "Only draft invoices can be edited"
                : undefined
            }
            className={`text-xs font-semibold ${
              invoice.status !== "DRAFT"
                ? "cursor-not-allowed text-slate-400"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            Edit
          </button>
          {invoice.status === "CANCELLED" ? (
            <button
              onClick={() => {
                setInvoiceActionError(null);
                setInvoiceToDelete(invoice);
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              Delete
            </button>
          ) : invoice.status !== "PAID" &&
            invoice.status !== "PARTIALLY_PAID" ? (
            <button
              onClick={() => {
                setInvoiceActionError(null);
                setInvoiceToCancel(invoice);
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              Cancel
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="p-0 max-w-7xl mx-auto space-y-6">
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

      {invoiceActionError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
        >
          {invoiceActionError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredInvoices}
        loading={loading}
        emptyMessage="No invoices found."
      />

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        leases={leases}
        tenants={tenants}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      <IssueInvoiceConfirmModal
        invoice={invoiceToIssue}
        isOpen={invoiceToIssue !== null}
        isLoading={issuingId === invoiceToIssue?.id}
        error={issueError}
        onClose={closeIssueConfirm}
        onConfirm={confirmIssue}
      />

      <PaymentModal
        isOpen={invoiceToPay !== null}
        onClose={() => setInvoiceToPay(null)}
        onSuccess={fetchData}
        tenants={tenants}
        unpaidInvoices={invoiceToPay ? [invoiceToPay] : []}
        preselectedTenantId={invoiceToPay?.tenant_id}
        preselectedInvoiceId={invoiceToPay?.id}
        lockToPreselectedInvoice
      />

      <DeleteConfirmModal
        isOpen={invoiceToCancel !== null}
        onClose={() => setInvoiceToCancel(null)}
        onConfirm={confirmCancelInvoice}
        title="Cancel Invoice?"
        entityName={invoiceToCancel?.invoice_number}
        description={`Cancel invoice ${invoiceToCancel?.invoice_number || ""}? This action cannot be undone.`}
        confirmLabel="Cancel Invoice"
        cancelLabel="Keep Invoice"
        loadingLabel="Cancelling..."
        isLoading={invoiceActionLoading}
      />

      <DeleteConfirmModal
        isOpen={invoiceToDelete !== null}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDeleteInvoice}
        title="Delete Invoice?"
        entityName={invoiceToDelete?.invoice_number}
        description={`Permanently delete invoice ${invoiceToDelete?.invoice_number || ""}? This action cannot be undone.`}
        confirmLabel="Delete Invoice"
        cancelLabel="Keep Invoice"
        loadingLabel="Deleting..."
        isLoading={invoiceActionLoading}
      />

      <InfoModal
        isOpen={invoiceEditNotice !== null}
        onClose={() => setInvoiceEditNotice(null)}
        title="Invoice cannot be edited"
        description={
          invoiceEditNotice
            ? `Only draft invoices can be edited. This invoice is currently ${invoiceEditNotice.status.replace("_", " ").toLowerCase()}.`
            : ""
        }
      />
    </div>
  );
}
