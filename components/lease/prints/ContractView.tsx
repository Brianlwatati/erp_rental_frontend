"use client";

import { Lease, LeaseCharge } from "@/types/lease";
import React from "react";

interface ContractViewProps {
  lease: Lease;
  charges: LeaseCharge[];
}

export default function ContractView({ lease, charges }: ContractViewProps) {
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
    <div className=" space-y-6 bg-white text-slate-900 text-xs leading-relaxed ">
      {/* Header */}
      <div className="text-center border-b border-slate-200 pb-4 space-y-1">
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
          Residential Lease Agreement
        </h1>
        <p className="text-slate-500 font-mono text-[11px]">
          Contract Ref: {lease.lease_number}
        </p>
      </div>

      <p className="text-justify">
        This Rental Agreement is made and entered into on{" "}
        <span className="font-semibold underline underline-offset-4">
          {formatDate(lease.created_at)}
        </span>{" "}
        by and between{" "}
        <span className="font-bold uppercase text-slate-900">
          {lease.property_name}
        </span>{" "}
        (“Landlord”), and{" "}
        <span className="font-bold uppercase text-slate-900">
          {lease.tenant_first_name} {lease.tenant_last_name}
        </span>{" "}
        (“Tenant”), collectively referred to as the “Parties.”
      </p>

      {/* Clauses List */}
      <ol className="space-y-4 list-decimal list-inside font-normal">
        <li className="font-bold">
          <span className="text-slate-900 uppercase">Property</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Landlord hereby rents to the Tenant, and the Tenant hereby
            leases from the Landlord, the property located at{" "}
            <span className="font-semibold text-slate-900">
              {lease.property_name}, Building {lease.building_name}, Unit{" "}
              {lease.unit_number}
            </span>{" "}
            (“Property”), for residential purposes only.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Term</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The term of this Agreement shall begin on{" "}
            <span className="font-semibold text-slate-900">
              {formatDate(lease.start_date)}
            </span>{" "}
            and shall end on{" "}
            <span className="font-semibold text-slate-900">
              {formatDate(lease.end_date)}
            </span>
            . The Tenant shall vacate the Property upon the expiration of the
            term, unless the Parties agree in writing to extend the term.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">
            Rent & Payment Schedule
          </span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Tenant shall pay rent to the Landlord in the amount of{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(lease.monthly_rent)}
            </span>{" "}
            per month, due on the{" "}
            <span className="font-semibold text-slate-900">
              {lease.billing_day}th
            </span>{" "}
            day of each calendar month. Total monthly obligations including
            recurring service charges amount to{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(lease.rentpluscharges)}
            </span>
            . Rent payments shall be made directly to the designated property
            manager or corporate bank account of{" "}
            <span className="font-semibold text-slate-900">
              {lease.property_name}
            </span>
            .
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Security Deposit</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Tenant shall deposit with the Landlord the sum of{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(lease.deposit_amount)}
            </span>{" "}
            as a security deposit to be held by the Landlord for the term of
            this Agreement. The security deposit shall be refunded to the
            Tenant, less any valid deductions for damages or unpaid rent, within{" "}
            <span className="font-semibold text-slate-900">30 days</span> after
            the Tenant vacates the Property.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Use of Property</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Tenant shall use the Property strictly for residential purposes
            and shall comply with all laws, building bylaws, and municipal
            regulations. The Tenant shall not alter, paint, or structurally
            modify the Property without the Landlord’s prior written consent.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">
            Utilities & Additional Charges
          </span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Tenant shall pay for all utilities and metered charges
            (including electricity, water, gas, garbage collection, and
            internet) unless specifically included in the monthly rent
            structure.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">
            Maintenance and Repairs
          </span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Tenant shall keep the Property clean, hygienic, and in good
            condition and shall promptly notify the Landlord of any necessary
            repairs. The Landlord shall handle repairs caused by normal wear and
            tear, while the Tenant remains liable for any accidental or
            intentional damage caused by the Tenant or their guests.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Pets</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            Pets are strictly forbidden on the Property unless the Landlord
            grants prior written consent.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Entry by Landlord</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Landlord or authorized representatives may enter the Property at
            reasonable hours upon giving at least 24 hours’ prior notice to
            inspect the premises or perform necessary repairs.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">
            Assignment and Subletting
          </span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            The Tenant shall not assign this Agreement or sublet any portion of
            the Property without the Landlord’s express written consent.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Governing Law</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            This Agreement shall be governed by and construed in accordance with
            the laws of the Republic of Kenya.
          </p>
        </li>

        <li className="font-bold">
          <span className="text-slate-900 uppercase">Entire Agreement</span>
          <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
            This Agreement constitutes the entire agreement between the Parties
            and supersedes all prior negotiations, understandings, and oral or
            written representations.
          </p>
        </li>
      </ol>

      {/* Execution & Signatures */}
      <div className="pt-8 space-y-12 border-t border-slate-200 print:pt-12">
        <p className="font-semibold text-slate-900">
          IN WITNESS WHEREOF, the Parties have executed this Agreement on the
          date first written above.
        </p>

        <div className="grid grid-cols-2 gap-12 pt-4">
          <div className="space-y-6">
            <div className="border-b border-slate-400 w-full" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">
                Landlord / Authorized Representative
              </p>
              <p className="text-slate-600 font-medium">
                {lease.property_name}
              </p>
              <p className="text-slate-400 text-[10px]">
                Date: ________________________
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-slate-400 w-full" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Tenant Signature</p>
              <p className="text-slate-600 font-medium">
                {lease.tenant_first_name} {lease.tenant_last_name}
              </p>
              <p className="text-slate-400 text-[10px]">
                Date: ________________________
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
