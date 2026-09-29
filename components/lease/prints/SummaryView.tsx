"use client";

import { Lease, LeaseCharge } from "@/types/lease";

interface SummaryViewProps {
  lease: Lease;
  charges: LeaseCharge[];
}

export default function SummaryView({ lease, charges }: SummaryViewProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (val?: string | number) => {
    const num = Number(val || 0);
    return `KES ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="print:break-after-page space-y-6">
      <div className="flex items-start justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            Lease Financial Statement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official Record • Generated on{" "}
            {new Date().toLocaleDateString("en-US")}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider print:border-slate-300 print:text-slate-800 print:bg-slate-100">
            {lease.status}
          </span>
          <p className="text-xs font-mono font-bold text-slate-700 mt-2">
            Ref: {lease.lease_number}
          </p>
        </div>
      </div>

      {/* Property & Unit Details */}
      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-100 print:bg-slate-50/50 print:border-slate-200">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Property Information
          </h3>
          <p className="text-sm font-bold text-slate-900">
            {lease.property_name}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Code:{" "}
            <span className="font-mono text-slate-800">
              {lease.property_code}
            </span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Building:{" "}
            <span className="font-medium text-slate-800">
              {lease.building_name}
            </span>{" "}
            ({lease.building_code})
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Unit Specification
          </h3>
          <p className="text-sm font-bold text-slate-900">
            Unit {lease.unit_number}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Billing Cycle: Day {lease.billing_day} of every month
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Deposit in First Invoice:{" "}
            {lease.include_deposit_in_first_invoice ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Tenant & Lease Term Grid */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            Tenant Details
          </h3>
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-bold text-slate-900">
                {lease.tenant_first_name} {lease.tenant_last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium text-slate-800">
                {lease.tenant_email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-medium text-slate-800">
                {lease.tenant_phone}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            Lease Duration
          </h3>
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Start Date:</span>
              <span className="font-semibold text-slate-900">
                {formatDate(lease.start_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">End Date:</span>
              <span className="font-semibold text-slate-900">
                {formatDate(lease.end_date)}
              </span>
            </div>
            {lease.termination_date && (
              <div className="flex justify-between text-rose-600">
                <span>Terminated:</span>
                <span className="font-semibold">
                  {formatDate(lease.termination_date)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charges Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
          Recurring Additional Charges
        </h3>

        {charges.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No additional recurring charges recorded.
          </p>
        ) : (
          <div className="overflow-hidden border border-slate-200 rounded-lg print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 print:bg-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Charge Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-center">Frequency</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {charges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {charge.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                      {charge.charge_type}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-600">
                      {charge.recurring ? "Monthly" : "One-time"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(charge.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="border- border-slate-200 py-5 flex flex-col items-end space-y-2">
        <div className="w-full sm:w-80 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Base Monthly Rent:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(lease.monthly_rent)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Security Deposit:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(lease.deposit_amount)}
            </span>
          </div>
          {charges.length > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Total Additional Charges:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(
                  charges.reduce((acc, c) => acc + Number(c.amount || 0), 0),
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2 mt-1">
            <span>Total Monthly Commitment:</span>
            <span className="text-emerald-700 print:text-slate-900">
              {formatCurrency(lease.rentpluscharges)}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="pt-12 grid grid-cols-2 gap-12 text-xs border-t border-slate-200 print:pt-16">
        <div className="space-y-8">
          <div className="border-b border-slate-400 w-full" />
          <div>
            <p className="font-bold text-slate-900">
              Lessor / Property Manager Signature
            </p>
            <p className="text-slate-500 mt-0.5">
              Date: ________________________
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="border-b border-slate-400 w-full" />
          <div>
            <p className="font-bold text-slate-900">
              Tenant Signature ({lease.tenant_first_name}{" "}
              {lease.tenant_last_name})
            </p>
            <p className="text-slate-500 mt-0.5">
              Date: ________________________
            </p>
          </div>
        </div>

        <div className="pb-5"></div>
      </div>
    </div>
  );
}
