import Link from "next/link";
import { Column, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { Lease } from "@/types/lease";

export function UnitLeaseHistory({
  leases,
  onEdit,
}: {
  leases: Lease[];
  onEdit: (lease: Lease) => void;
}) {
  const columns: Column<Lease>[] = [
    {
      header: "Lease #",
      accessor: (lease) => (
        <div className="whitespace-nowrap">
          <span className="block font-mono font-bold text-slate-900">
            {lease.lease_number}
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
      header: "Billing Day",
      accessor: (lease) => `Day ${lease.billing_day}`,
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
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
            >
              Print
            </Link>
            {isIssued ? (
              <span
                aria-disabled="true"
                title="Details are unavailable for invoiced leases"
                className="cursor-not-allowed text-xs font-semibold text-slate-400"
              >
                Details
              </span>
            ) : (
              <Link
                href={`/leases/${lease.id}`}
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:underline"
              >
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
              className={`text-xs font-semibold ${
                isIssued
                  ? "cursor-not-allowed text-slate-400"
                  : "text-blue-600 hover:underline"
              }`}
            >
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
