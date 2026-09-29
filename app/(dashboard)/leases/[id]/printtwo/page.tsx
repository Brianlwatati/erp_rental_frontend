"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Lease, LeaseCharge } from "@/types/lease";

export default function LeaseContractPrintPage() {
  const params = useParams();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [charges, setCharges] = useState<LeaseCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "contract" | "all">(
    "all",
  );

  const fetchLeaseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [leaseRes, chargesRes] = await Promise.all([
        apiFetch<Lease>(`/leases/${leaseId}`),
        apiFetch<LeaseCharge[]>(`/leases/${leaseId}/charges`).catch(() => ({
          data: [],
        })),
      ]);

      setLease(leaseRes.data);
      setCharges(chargesRes.data || []);
    } catch (err: any) {
      console.error("Failed to load lease details:", err);
      setError(err.message || "Failed to load lease contract.");
    } finally {
      setLoading(false);
    }
  }, [leaseId]);

  useEffect(() => {
    if (leaseId) {
      fetchLeaseDetails();
    }
  }, [leaseId, fetchLeaseDetails]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "__________________";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (val?: string | number) => {
    const num = Number(val || 0);
    return `KES ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
        Loading lease agreement & legal contract...
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 print:hidden">
        <Link
          href="/leases"
          className="inline-flex items-center text-xs text-blue-600 font-semibold hover:underline"
        >
          &larr; Back to Leases
        </Link>
        <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error || "Lease agreement not found."}
        </div>
      </div>
    );
  }

  const tenantFullName =
    `${lease.tenant_first_name} ${lease.tenant_last_name}`.trim();
  const propertyFullAddress = `${lease.building_name}, Unit ${lease.unit_number} (${lease.property_name})`;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 text-slate-800 bg-white print:p-0 print:max-w-none print:shadow-none print:bg-transparent">
      {/* Top Controls Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <Link
            href="/leases"
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            &larr; Back to Leases
          </Link>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Lease Agreement & Contract ({lease.lease_number})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              Full Document
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "summary"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              Summary Sheet
            </button>
            <button
              onClick={() => setActiveTab("contract")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "contract"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              Legal Contract
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div className="space-y-8">
        {/* ==================== PART 1: SUMMARY SHEET ==================== */}
        {(activeTab === "all" || activeTab === "summary") && (
          <div className="border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 bg-white print:border-none print:p-0 print:shadow-none print:break-after-page">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                  Lease Summary & Financial Statement
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reference:{" "}
                  <span className="font-mono font-bold text-slate-800">
                    {lease.lease_number}
                  </span>
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase print:border-slate-300 print:text-slate-800">
                {lease.status}
              </span>
            </div>

            {/* Property & Tenant Quick Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Landlord / Property
                </p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {lease.property_name}
                </p>
                <p className="text-slate-600">
                  {lease.building_name} — Unit {lease.unit_number}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Tenant Details
                </p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {tenantFullName}
                </p>
                <p className="text-slate-600">
                  {lease.tenant_email} • {lease.tenant_phone}
                </p>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                Financial Schedule
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Monthly Base Rent
                  </p>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCurrency(lease.monthly_rent)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Due on Day {lease.billing_day} of month
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Security Deposit
                  </p>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCurrency(lease.deposit_amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Held until lease expiration
                  </p>
                </div>
                <div className="p-3 bg-slate-900 text-white rounded-lg">
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">
                    Total Monthly Commitment
                  </p>
                  <p className="text-base font-extrabold text-emerald-400 mt-1">
                    {formatCurrency(lease.rentpluscharges)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Rent + recurring utilities/fees
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Charges Table */}
            {charges.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Itemized Recurring Charges
                </h3>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2.5">Charge Name</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-center">Frequency</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {charges.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2.5 font-medium text-slate-900">
                          {c.name}
                        </td>
                        <td className="p-2.5 text-slate-500 uppercase text-[10px] font-semibold">
                          {c.charge_type}
                        </td>
                        <td className="p-2.5 text-center text-slate-600">
                          {c.recurring ? "Monthly" : "One-time"}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-900">
                          {formatCurrency(c.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== PART 2: FORMAL RESIDENTIAL LEASE AGREEMENT ==================== */}
        {(activeTab === "all" || activeTab === "contract") && (
          <div className="border border-slate-200 rounded-xl p-8 sm:p-10 shadow-sm space-y-6 bg-white text-slate-900 text-xs leading-relaxed print:border-none print:p-0 print:shadow-none">
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
                {tenantFullName}
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
                    {propertyFullAddress}
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
                  . The Tenant shall vacate the Property upon the expiration of
                  the term, unless the Parties agree in writing to extend the
                  term.
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
                  day of each calendar month. Total monthly obligations
                  including recurring service charges amount to{" "}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(lease.rentpluscharges)}
                  </span>
                  . Rent payments shall be made directly to the designated
                  property manager or corporate bank account of{" "}
                  <span className="font-semibold text-slate-900">
                    {lease.property_name}
                  </span>
                  .
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">
                  Security Deposit
                </span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  The Tenant shall deposit with the Landlord the sum of{" "}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(lease.deposit_amount)}
                  </span>{" "}
                  as a security deposit to be held by the Landlord for the term
                  of this Agreement. The security deposit shall be refunded to
                  the Tenant, less any valid deductions for damages or unpaid
                  rent, within{" "}
                  <span className="font-semibold text-slate-900">30 days</span>{" "}
                  after the Tenant vacates the Property.
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">
                  Use of Property
                </span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  The Tenant shall use the Property strictly for residential
                  purposes and shall comply with all laws, building bylaws, and
                  municipal regulations. The Tenant shall not alter, paint, or
                  structurally modify the Property without the Landlord’s prior
                  written consent.
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
                  The Tenant shall keep the Property clean, hygienic, and in
                  good condition and shall promptly notify the Landlord of any
                  necessary repairs. The Landlord shall handle repairs caused by
                  normal wear and tear, while the Tenant remains liable for any
                  accidental or intentional damage caused by the Tenant or their
                  guests.
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">Pets</span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  Pets are strictly forbidden on the Property unless the
                  Landlord grants prior written consent.
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">
                  Entry by Landlord
                </span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  The Landlord or authorized representatives may enter the
                  Property at reasonable hours upon giving at least 24 hours’
                  prior notice to inspect the premises or perform necessary
                  repairs.
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">
                  Assignment and Subletting
                </span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  The Tenant shall not assign this Agreement or sublet any
                  portion of the Property without the Landlord’s express written
                  consent.
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">Governing Law</span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  This Agreement shall be governed by and construed in
                  accordance with the laws of the Republic of Kenya.
                </p>
              </li>

              <li className="font-bold">
                <span className="text-slate-900 uppercase">
                  Entire Agreement
                </span>
                <p className="font-normal pl-4 mt-1 text-slate-700 leading-normal">
                  This Agreement constitutes the entire agreement between the
                  Parties and supersedes all prior negotiations, understandings,
                  and oral or written representations.
                </p>
              </li>
            </ol>

            {/* Execution & Signatures */}
            <div className="pt-8 space-y-12 border-t border-slate-200 print:pt-12">
              <p className="font-semibold text-slate-900">
                IN WITNESS WHEREOF, the Parties have executed this Agreement on
                the date first written above.
              </p>

              <div className="grid grid-cols-2 gap-12 pt-4">
                {/* Landlord Signature Block */}
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

                {/* Tenant Signature Block */}
                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Tenant Signature</p>
                    <p className="text-slate-600 font-medium">
                      {tenantFullName}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Date: ________________________
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
