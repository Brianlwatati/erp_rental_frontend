"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api_client";
import { Lease, LeaseCharge } from "@/types/lease";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";

export default function LeaseDetailPage() {
  const params = useParams();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [charges, setCharges] = useState<LeaseCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Charge form states
  const [chargeName, setChargeName] = useState("");
  const [chargeType, setChargeType] = useState("UTILITY");
  const [chargeAmount, setChargeAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [savingCharge, setSavingCharge] = useState(false);

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

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeName || !chargeAmount) return;

    try {
      setSavingCharge(true);
      await apiFetch(`/leases/${leaseId}/charges`, {
        method: "POST",
        body: JSON.stringify({
          name: chargeName,
          chargeType,
          amount: parseFloat(chargeAmount),
          recurring: isRecurring,
        }),
      });

      setChargeName("");
      setChargeAmount("");
      fetchLeaseDetails();
    } catch (err) {
      console.error("Failed to add charge:", err);
    } finally {
      setSavingCharge(false);
    }
  };

  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm("Are you sure you want to remove this charge?")) return;
    try {
      await apiFetch(`/leases/charges/${chargeId}`, { method: "DELETE" });
      fetchLeaseDetails();
    } catch (err) {
      console.error("Failed to delete charge:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading lease agreement details...
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="p-0 max-w-7xl mx-auto space-y-4">
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

  const chargeColumns: Column<LeaseCharge>[] = [
    {
      header: "Charge Name",
      accessor: (row) => (
        <span className="font-semibold text-slate-900">{row.name}</span>
      ),
    },
    {
      header: "Category",
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.charge_type}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-bold text-slate-900">
          {new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(row.amount)}
        </span>
      ),
    },
    {
      header: "Frequency",
      accessor: (row) => (
        <span
          className={`text-xs font-medium ${row.recurring ? "text-blue-600" : "text-slate-500"}`}
        >
          {row.recurring ? "Recurring Monthly" : "One-time"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => handleDeleteCharge(row.id)}
          className="text-xs font-semibold text-rose-600 hover:underline"
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="p-0 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <Link
          href="/leases"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
        >
          &larr; Back to Leases Directory
        </Link>

        {/* Lease Summary Header Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                Lease {lease.lease_number}
              </h1>
              <StatusBadge status={lease.status} />
            </div>
            <p className="text-xs text-slate-500">
              Assigned to{" "}
              <strong className="text-slate-800">
                {lease.tenant_first_name && lease.tenant_last_name
                  ? `${lease.tenant_first_name} ${lease.tenant_last_name}`
                  : "Tenant"}
              </strong>{" "}
              in Unit{" "}
              <strong className="text-slate-800">
                {lease.unit_number || "Unit"}
              </strong>
            </p>
          </div>

          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <span className="text-slate-400 block">Monthly Rent</span>
              <span className="font-bold text-slate-900 text-sm">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(lease.monthly_rent)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Deposit Paid</span>
              <span className="font-bold text-slate-900 text-sm">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(lease.deposit_amount)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Billing Day</span>
              <span className="font-bold text-slate-900 text-sm">
                Every {lease.billing_day}th
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lease Charges Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Additional Charges & Utilities
          </h3>
          <p className="text-xs text-slate-500">
            Define recurring utility fees, parking rents, or one-off
            administrative charges associated with this lease.
          </p>
        </div>

        {/* Add Charge Inline Form */}
        <form
          onSubmit={handleAddCharge}
          className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3"
        >
          <span className="text-xs font-bold text-slate-700 block">
            Add New Charge
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Charge Name (e.g. Garbage Fee)"
              value={chargeName}
              onChange={(e) => setChargeName(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              required
            />
            <select
              value={chargeType}
              onChange={(e) => setChargeType(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="UTILITY">UTILITY</option>
              <option value="PARKING">PARKING</option>
              <option value="SERVICE">SERVICE</option>
              <option value="OTHER">OTHER</option>
            </select>
            <input
              type="number"
              placeholder="Amount (KES)"
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              required
            />
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Recurring
              </label>
              <button
                type="submit"
                disabled={savingCharge}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {savingCharge ? "Adding..." : "+ Add Charge"}
              </button>
            </div>
          </div>
        </form>

        <DataTable
          columns={chargeColumns}
          data={charges}
          emptyMessage="No extra charges registered for this lease."
        />
      </div>
    </div>
  );
}
