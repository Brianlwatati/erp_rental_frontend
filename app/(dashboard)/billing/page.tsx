"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { InvoiceModal } from "@/components/billing/InvoiceModal";
import { Invoice } from "@/types/invoice";
import { IssueInvoiceConfirmModal } from "@/components/billing/billingmodal/IssueInvoiceConfirmModal";
import { PaymentModal } from "@/components/payment/PaymentModal";
import InfoModal from "@/components/ui/InfoModal";
import { DataTable } from "@/components/ui/data-table";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

// Modular Sub-components
import { BillingEmptyState } from "@/components/billing/BillingEmptyState";
import { BillingFilters } from "@/components/billing/BillingFilters";
import { getBillingColumns } from "@/components/billing/billingColumns";

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, leaseData, tenantData] = await Promise.all([
        apiFetch<Invoice[]>("/invoices").catch(() => ({ data: [] })),
        apiFetch<Lease[]>("/leases").catch(() => ({ data: [] })),
        apiFetch<Tenant[]>("/tenants").catch(() => ({ data: [] })),
      ]);
      setInvoices(invData.data || []);
      setLeases(leaseData.data || []);
      setTenants(tenantData.data || []);
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = useCallback((invoice: Invoice) => {
    if (invoice.status !== "DRAFT") {
      setInvoiceEditNotice(invoice);
      return;
    }

    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  }, []);

  const handlePay = useCallback((invoice: Invoice) => {
    setInvoiceToPay(invoice);
  }, []);

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

  const handleIssue = useCallback((invoice: Invoice) => {
    setInvoiceToIssue(invoice);
    setIssueError(null);
  }, []);

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

      setInvoiceToIssue(null);
      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to issue invoice:", err);
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to issue invoice. Please try again.";
      setIssueError(errorMessage);
    } finally {
      setIssuingId(null);
    }
  };

  const closeIssueConfirm = () => {
    if (issuingId) return;
    setInvoiceToIssue(null);
    setIssueError(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus =
        statusFilter === "ALL" || inv.status === statusFilter;
      const matchesSearch =
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.tenant_id?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handlePromptCancel = useCallback((invoice: Invoice) => {
    setInvoiceActionError(null);
    setInvoiceToCancel(invoice);
  }, []);

  const handlePromptDelete = useCallback((invoice: Invoice) => {
    setInvoiceActionError(null);
    setInvoiceToDelete(invoice);
  }, []);

  const columns = useMemo(
    () =>
      getBillingColumns({
        issuingId,
        onIssue: handleIssue,
        onPay: handlePay,
        onEdit: handleEdit,
        onCancelPrompt: handlePromptCancel,
        onDeletePrompt: handlePromptDelete,
      }),
    [
      issuingId,
      handleIssue,
      handlePay,
      handleEdit,
      handlePromptCancel,
      handlePromptDelete,
    ],
  );

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
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          + Create Invoice
        </button>
      </div>

      {/* Control / Filter Bar (rendered only when base invoice records exist) */}
      {invoices.length > 0 && (
        <BillingFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      )}

      {/* Action Error Banner */}
      {invoiceActionError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
        >
          {invoiceActionError}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
          Loading billing statements...
        </div>
      ) : invoices.length === 0 ? (
        /* Base empty view when database is empty */
        <BillingEmptyState onCreateNew={handleCreateNew} />
      ) : filteredInvoices.length === 0 ? (
        /* Empty view when search/filter criteria match no results */
        <BillingEmptyState
          onCreateNew={handleCreateNew}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onClearFilters={clearFilters}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          emptyMessage="No invoices found."
        />
      )}

      {/* Invoice Modal */}
      {isModalOpen && (
        <InvoiceModal
          invoice={selectedInvoice}
          leases={leases}
          tenants={tenants}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Issue Confirmation Modal */}
      <IssueInvoiceConfirmModal
        invoice={invoiceToIssue}
        isOpen={invoiceToIssue !== null}
        isLoading={issuingId === invoiceToIssue?.id}
        error={issueError}
        onClose={closeIssueConfirm}
        onConfirm={confirmIssue}
      />

      {/* Payment Processing Modal */}
      {invoiceToPay !== null && (
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
      )}

      {/* Cancel Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={invoiceToCancel !== null}
        onClose={() => setInvoiceToCancel(null)}
        onConfirm={confirmCancelInvoice}
        title="Cancel Invoice?"
        entityName={invoiceToCancel?.invoice_number}
        description={`Cancel invoice ${
          invoiceToCancel?.invoice_number || ""
        }? This action cannot be undone.`}
        confirmLabel="Cancel Invoice"
        cancelLabel="Keep Invoice"
        loadingLabel="Cancelling..."
        isLoading={invoiceActionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={invoiceToDelete !== null}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDeleteInvoice}
        title="Delete Invoice?"
        entityName={invoiceToDelete?.invoice_number}
        description={`Permanently delete invoice ${
          invoiceToDelete?.invoice_number || ""
        }? This action cannot be undone.`}
        confirmLabel="Delete Invoice"
        cancelLabel="Keep Invoice"
        loadingLabel="Deleting..."
        isLoading={invoiceActionLoading}
      />

      {/* Information Modal for Inactive Actions */}
      <InfoModal
        isOpen={invoiceEditNotice !== null}
        onClose={() => setInvoiceEditNotice(null)}
        title="Invoice cannot be edited"
        description={
          invoiceEditNotice
            ? `Only draft invoices can be edited. This invoice is currently ${invoiceEditNotice.status
                .replace("_", " ")
                .toLowerCase()}.`
            : ""
        }
      />
    </div>
  );
}
