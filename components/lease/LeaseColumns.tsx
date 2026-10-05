"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Column } from "@/components/ui/data-table";
import { Lease } from "@/types/lease";

interface ColumnHandlers {
  onEdit: (lease: Lease) => void;
}

export function getLeaseColumns({ onEdit }: ColumnHandlers): Column<Lease>[] {
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
            {row.status === "TERMINATED" ? (
              <span className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                Terminated
              </span>
            ) : row.lease_invoice_id != null ? (
              <span
                title="This lease has been invoiced and is locked from editing."
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
              >
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                Invoiced
              </span>
            ) : null}
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
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          {row.status === "TERMINATED" ? (
            <span
              aria-disabled="true"
              className="cursor-not-allowed text-xs font-semibold text-slate-400"
            >
              Edit Charges
            </span>
          ) : row.lease_invoice_id != null ? (
            <span
              aria-disabled="true"
              title="Details are unavailable for invoiced leases as they cannot be changed"
              className="cursor-not-allowed text-xs font-semibold text-slate-400 inline-flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              Edit Charges
            </span>
          ) : (
            <Link
              href={`/leases/${row.id}`}
              className="text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Edit Charges
            </Link>
          )}

          {row.status === "TERMINATED" ? (
            <span
              aria-disabled="true"
              title="Terminated leases cannot be edited"
              className="cursor-not-allowed text-xs font-semibold text-slate-400"
            >
              Edit
            </span>
          ) : (
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
          )}
        </div>
      ),
    },
  ];
}
