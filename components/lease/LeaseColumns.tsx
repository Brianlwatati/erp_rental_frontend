"use client";

import React from "react";
import Link from "next/link";
import { Lock, Printer, FileCheck } from "lucide-react";
import { Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { Lease } from "@/types/lease";

interface ColumnHandlers {
  onEdit: (lease: Lease) => void;
  onCreateInvoice: (lease: Lease) => void;
}

export function getLeaseColumns({
  onEdit,
  onCreateInvoice,
}: ColumnHandlers): Column<Lease>[] {
  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);

  return [
    {
      header: "Lease #",
      accessor: (row) => (
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 block">
              {row.lease_number}
            </span>
            {row.lease_invoice_id != null && (
              <span
                title="This lease has been invoiced and is locked from editing."
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
              >
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                Invoiced
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(row.start_date).toLocaleDateString()} &ndash;{" "}
            {row.end_date
              ? new Date(row.end_date).toLocaleDateString()
              : "Ongoing"}
          </span>
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: (row) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-800 block">
            Unit {row.unit_number || row.unit_id.slice(0, 6)}
          </span>
          <span className="text-xs text-slate-500 text-nowrap">
            {row.building_name || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Tenant",
      accessor: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">
            {row.tenant_first_name || row.tenant_last_name
              ? `${row.tenant_first_name || ""} ${row.tenant_last_name || ""}`
              : "—"}
          </span>
          {row.tenant_email && (
            <span className="text-xs text-slate-500 block">
              {row.tenant_email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Monthly Rent",
      accessor: (row) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(row.monthly_rent)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link
            href={`/leases/${row.id}/print`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
          >
            <Printer aria-hidden="true" className="h-3.5 w-3.5" />
            View
          </Link>

          {row.lease_invoice_id == null && (
            <button
              type="button"
              onClick={() => onCreateInvoice(row)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              <FileCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Invoice
            </button>
          )}

          {row.lease_invoice_id != null ? (
            <span
              aria-disabled="true"
              title="Details are unavailable for invoiced leases as they cannot be changed"
              className="cursor-not-allowed text-xs font-semibold text-slate-400 inline-flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              L.Charges
            </span>
          ) : (
            <Link
              href={`/leases/${row.id}`}
              className="text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              L.Charges
            </Link>
          )}

          <button
            onClick={() => onEdit(row)}
            aria-disabled={row.lease_invoice_id != null}
            title={
              row.lease_invoice_id != null
                ? "This lease has already been invoiced and cannot be edited or modified"
                : undefined
            }
            className={`text-xs font-semibold inline-flex items-center gap-1 ${
              row.lease_invoice_id != null
                ? "cursor-not-allowed text-slate-400"
                : "text-blue-600 hover:underline cursor-pointer"
            }`}
          >
            {row.lease_invoice_id != null && (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
            Edit
          </button>
        </div>
      ),
    },
  ];
}
