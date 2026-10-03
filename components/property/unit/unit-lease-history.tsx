import Link from "next/link";
import { FilePlus, FileText, LockKeyhole, Pencil, Printer } from "lucide-react";
import { Column, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { Lease } from "@/types/lease";

export function UnitLeaseHistory({
  leases,
  onEdit,
  onInvoice,
  invoicePreparingLeaseId,
}: {
  leases: Lease[];
  onEdit: (lease: Lease) => void;
  onInvoice: (lease: Lease) => void;
  invoicePreparingLeaseId: string | null;
}) {
  const columns: Column<Lease>[] = [
    {
      header: "Lease #",
      accessor: (lease) => (
        <div className="whitespace-nowrap">
          <span className="block font-mono font-bold text-slate-900">
            {lease.lease_number}
            {lease.lease_invoice_id != null && (
              <span className="ml-2 inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-amber-700">
                <LockKeyhole aria-hidden="true" className="mr-1 h-3 w-3" />
                Invoiced
              </span>
            )}
          </span>
          <span className="text-[11px] text-slate-500">
            {new Date(lease.start_date).toLocaleDateString()} –{" "}
            {lease.end_date
              ? new Date(lease.end_date).toLocaleDateString()
              : "Month-to-month"}
          </span>
        </div>
      ),
    },
    {
      header: "Tenant",
      accessor: (lease) => (
        <div>
          <span className="block font-semibold text-slate-800">
            {lease.tenant_first_name} {lease.tenant_last_name}
          </span>
          <span className="text-[11px] text-slate-500">
            {lease.tenant_email || "No email"}
          </span>
        </div>
      ),
    },
    {
      header: "Rent + Charges",
      accessor: (lease) =>
        new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
          maximumFractionDigits: 0,
        }).format(lease.rentpluscharges || 0),
    },
    {
      header: "Status",
      accessor: (lease) => <StatusBadge status={lease.status} />,
    },
    {
      header: "Actions",
      accessor: (lease) => {
        const isIssued = lease.lease_invoice_id != null;

        return (
          <div className="flex min-w-max items-center gap-3">
            <Link
              href={`/leases/${lease.id}/print`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
            >
              <Printer aria-hidden="true" className="h-3.5 w-3.5" />
              Print
            </Link>
            {!isIssued && (
              <button
                type="button"
                onClick={() => onInvoice(lease)}
                disabled={invoicePreparingLeaseId === lease.id}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline disabled:cursor-wait disabled:opacity-60"
              >
                <FilePlus aria-hidden="true" className="h-3.5 w-3.5" />
                {invoicePreparingLeaseId === lease.id
                  ? "Preparing..."
                  : "Invoice"}
              </button>
            )}
            {isIssued ? (
              <span
                aria-disabled="true"
                title="Details are unavailable for invoiced leases"
                className="inline-flex cursor-not-allowed items-center gap-1 text-xs font-semibold text-slate-400"
              >
                <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
                Details
              </span>
            ) : (
              <Link
                href={`/leases/${lease.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
              >
                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                Details
              </Link>
            )}
            <button
              type="button"
              onClick={() => onEdit(lease)}
              disabled={isIssued}
              title={
                isIssued
                  ? "This lease has already been invoiced and cannot be edited"
                  : undefined
              }
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isIssued
                  ? "cursor-not-allowed text-slate-400"
                  : "text-blue-600 hover:underline"
              }`}
            >
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Lease Agreements History ({leases.length})
        </h2>
      </div>
      <DataTable
        columns={columns}
        data={leases}
        emptyMessage="No leases associated with this unit yet."
      />
    </section>
  );
}
