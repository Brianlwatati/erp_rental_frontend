"use client";

import React from "react";
import Link from "next/link";
import { Calendar, FileCheck, ExternalLink } from "lucide-react";
import { Lease } from "@/types/lease";

interface LeaseExpandedRowProps {
  lease: Lease;
}

export function LeaseExpandedRow({ lease }: LeaseExpandedRowProps) {
  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);

  const extraCharges = (lease.rentpluscharges || 0) - (lease.monthly_rent || 0);
  const includesDeposit = Boolean(lease.include_deposit_in_first_invoice);
  const depositAmount = Number(lease.deposit_amount) || 0;
  const totalRentAndCharges = Number(lease.rentpluscharges) || 0;

  const totalInitialPayable = includesDeposit
    ? totalRentAndCharges + depositAmount
    : totalRentAndCharges;

  return (
    <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-4 bg-slate-50/90 border-l-4 border-blue-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Extra Charges */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Extra Charges
          </span>
          <span className="text-sm font-bold text-slate-800 block">
            {formatCurrency(extraCharges)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Rent + Extra: {formatCurrency(totalRentAndCharges)}
          </span>
        </div>

        {/* Total Initial Payable */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Payable
          </span>
          <span className="text-sm font-bold text-slate-900 block">
            {formatCurrency(totalInitialPayable)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {includesDeposit
              ? `Includes Deposit (${formatCurrency(depositAmount)})`
              : `Excludes Deposit (${formatCurrency(depositAmount)})`}
          </span>
        </div>

        {/* Billing Terms */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Billing Terms
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Day {lease.billing_day || "1"} of month</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Deposit in First Invoice:{" "}
            <strong className="text-slate-700">
              {includesDeposit ? "Yes" : "No"}
            </strong>
          </span>
        </div>

        {/* Invoice Reference */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Invoice Reference
            </span>
            {lease.lease_invoice_id ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invoiced</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">Not invoiced yet</span>
            )}
          </div>

          {lease.lease_invoice_id && (
            <Link
              href={`/billing/${lease.lease_invoice_id}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Linked Invoice
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {lease.notes && (
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Description / Terms Notes
          </span>
          <p className="text-slate-600 text-xs leading-relaxed">
            {lease.notes}
          </p>
        </div>
      )}
    </div>
  );
}
