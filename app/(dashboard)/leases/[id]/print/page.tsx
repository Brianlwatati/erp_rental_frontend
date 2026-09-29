"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Lease, LeaseCharge } from "@/types/lease";
import ContractView from "@/components/lease/prints/ContractView";
import SummaryView from "@/components/lease/prints/SummaryView";

export default function LeaseDetailPagePrint() {
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
      setError(err.message || "Failed to load lease information.");
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

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
        Preparing printable lease document...
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

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 text-slate-800 bg-white print:p-0 print:max-w-none print:shadow-none print:bg-transparent">
      {/* CSS to hide everything outside #printable-section when printing */}
      <style jsx global>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-section,
            #printable-section * {
              visibility: visible;
            }
            #printable-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

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

      {/* Printable Document Container */}
      <div
        id="printable-section"
        className="border border-slate-200 rounded-xl p-8 shadow-sm space-y-8 bg-white print:border-none print:p-0 print:shadow-none"
      >
        {/* Summary Sheet */}
        {(activeTab === "all" || activeTab === "summary") && (
          <SummaryView lease={lease} charges={charges} />
        )}

        {/* Legal Contract Clauses */}
        {(activeTab === "all" || activeTab === "contract") && (
          <ContractView lease={lease} charges={charges} />
        )}
      </div>
    </div>
  );
}
