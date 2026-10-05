"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Payment } from "@/types/payment";
import { Column, DataTable } from "@/components/ui/data-table";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { EmptyPaymentState } from "@/components/payment/EmptyPaymentState";
import { Tenant } from "@/types/tenant";
import { Invoice } from "@/types/invoice";

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const preselectedInvoiceId = searchParams.get("invoiceId") || undefined;
  const preselectedTenantId = searchParams.get("tenantId") || undefined;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
            tenantId: invoice.tenant_id || apiInvoice.tenant_id || "",
            invoiceNumber:
              invoice.invoice_number || apiInvoice.invoice_number || "",
            dueDate: invoice.due_date || apiInvoice.due_date || "",
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const filteredPayments = payments.filter((payment) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      payment.payment_number?.toLowerCase().includes(query) ||
      payment.reference_number?.toLowerCase().includes(query) ||
      payment.payment_method?.toLowerCase().includes(query) ||
      payment.amount?.toString().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: Column<Payment>[] = [
    {
      header: "Payment No.",
      accessor: (payment) => (
        <Link
          href={`/payments/${payment.id}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {payment.payment_number}
        </Link>
      ),
    },
    {
      header: "Date",
      accessor: (payment) => payment.payment_date,
    },
    {
      header: "Method",
      accessor: (payment) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px]">
          {payment.payment_method}
        </span>
      ),
    },
    {
      header: "Ref Code",
      accessor: (payment) => (
        <span className="font-mono text-slate-600">
          {payment.reference_number || "—"}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: (payment) => (
        <span className="font-bold text-slate-900">
          KES {payment.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (payment) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            payment.status === "POSTED"
              ? "bg-emerald-50 text-emerald-700"
              : payment.status === "REVERSED"
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {payment.status}
        </span>
      ),
    },
    {
      header: "Details",
      accessor: (payment) => (
        <Link
          href={`/payments/${payment.id}`}
          className="text-xs font-semibold text-blue-700 hover:underline"
        >
          View details
        </Link>
      ),
    },
  ];

  return (
    <div className="p-0 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rental Payments</h1>
          <p className="text-xs text-slate-500">
            Track transactions, M-PESA receipts, and invoice allocations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-sm self-start sm:self-auto"
        >
          + Record Payment
        </button>
      </div>

      {/* Filter Controls — visible only when payment records exist */}
      {payments.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search payment #, ref code, amount, or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="POSTED">POSTED</option>
            <option value="PENDING">PENDING</option>
            <option value="REVERSED">REVERSED</option>
          </select>
        </div>
      )}

      {/* View Logic */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
          Loading payments...
        </div>
      ) : payments.length === 0 ? (
        /* Empty directory state */
        <EmptyPaymentState onRecordPayment={() => setIsModalOpen(true)} />
      ) : filteredPayments.length === 0 ? (
        /* Filter/search empty state */
        <EmptyPaymentState
          onRecordPayment={() => setIsModalOpen(true)}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onClearFilters={clearFilters}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredPayments}
          loading={false}
          emptyMessage="No payments found."
        />
      )}

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
