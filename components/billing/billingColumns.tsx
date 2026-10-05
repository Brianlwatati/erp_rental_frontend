"use client";

import React from "react";
import Link from "next/link";
import { Column } from "@/components/ui/data-table";
import { Invoice } from "@/types/invoice";
import { formatBillingDate } from "@/lib/billing_dates";
import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";

interface ColumnHandlers {
  issuingId: string | null;
  onIssue: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onCancelPrompt: (invoice: Invoice) => void;
  onDeletePrompt: (invoice: Invoice) => void;
}

export function getBillingColumns({
  issuingId,
  onIssue,
  onPay,
  onEdit,
  onCancelPrompt,
  onDeletePrompt,
}: ColumnHandlers): Column<Invoice>[] {
  const formatCurrency = (amount?: number) =>
    `KES ${Number(amount || 0).toLocaleString()}`;

  return [
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
          {formatCurrency(invoice.total)}
        </span>
      ),
    },
    {
      header: "Paid",
      accessor: (invoice) => (
        <span className="font-medium text-emerald-600">
          {formatCurrency(invoice.amount_paid)}
        </span>
      ),
    },
    {
      header: "Balance",
      accessor: (invoice) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(invoice.balance)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (invoice) => <BillingStatusBadge status={invoice.status} />,
    },
    {
      header: "Actions",
      accessor: (invoice) => (
        <div className="flex min-w-max flex-wrap items-center justify-end gap-2">
          {invoice.status === "DRAFT" && (
            <button
              onClick={() => onIssue(invoice)}
              disabled={issuingId === invoice.id}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 disabled:opacity-50 cursor-pointer"
            >
              {issuingId === invoice.id ? "Issuing..." : "Issue"}
            </button>
          )}

          {(invoice.status === "ISSUED" ||
            invoice.status === "PARTIALLY_PAID") && (
            <button
              onClick={() => onPay(invoice)}
              className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 cursor-pointer"
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
            onClick={() => onEdit(invoice)}
            aria-disabled={invoice.status !== "DRAFT"}
            title={
              invoice.status !== "DRAFT"
                ? "Only draft invoices can be edited"
                : undefined
            }
            className={`text-xs font-semibold ${
              invoice.status !== "DRAFT"
                ? "cursor-not-allowed text-slate-400"
                : "text-blue-600 hover:text-blue-800 cursor-pointer"
            }`}
          >
            Edit
          </button>

          {invoice.status === "CANCELLED" ? (
            <button
              onClick={() => onDeletePrompt(invoice)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Delete
            </button>
          ) : invoice.status !== "PAID" &&
            invoice.status !== "PARTIALLY_PAID" ? (
            <button
              onClick={() => onCancelPrompt(invoice)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Cancel
            </button>
          ) : null}
        </div>
      ),
    },
  ];
}
