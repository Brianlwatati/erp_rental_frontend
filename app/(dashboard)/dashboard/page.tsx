"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";
import {
  Building2,
  Home,
  Users,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Receipt,
  Wrench,
} from "lucide-react";

export interface OverviewData {
  totalProperties: number;
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  totalTenants: number;
  totalRevenue: number;
  totalExpenses: number;
  totalDue: number;
  netIncome?: number;
  pendingMaintenance?: number;
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Single API call returning aggregated metrics object
    apiFetch<OverviewData>("/overview")
      .then((res) => {
        // Fallback calculation for netIncome if not pre-calculated by API
        const overviewObj = res.data;
        if (overviewObj && overviewObj.netIncome === undefined) {
          overviewObj.netIncome =
            Number(overviewObj.totalRevenue || 0) -
            Number(overviewObj.totalExpenses || 0);
        }
        setData(overviewObj);
      })
      .catch((err) => {
        console.error("Failed to load overview data:", err);
        setError("Failed to load overview metrics.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500 animate-pulse">
        Loading portfolio analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
        {error || "Unable to display overview analytics."}
      </div>
    );
  }

  // Check if portfolio is empty (no properties, buildings, or units created yet)
  const isEmptyState =
    (data.totalProperties || 0) === 0 &&
    (data.totalBuildings || 0) === 0 &&
    (data.totalUnits || 0) === 0 &&
    (data.totalTenants || 0) === 0;

  const calculatedNetIncome =
    data.netIncome !== undefined
      ? data.netIncome
      : (data.totalRevenue || 0) - (data.totalExpenses || 0);

  // Render Welcome view if the account has no properties/data yet
  if (isEmptyState) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Welcome Header Banner */}
        <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to Your Property Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Let&apos;s start building your portfolio
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your real estate management hub is setup and ready. Add your first
              property or unit to unlock real-time financial tracking, occupancy
              analytics, and tenant insights.
            </p>
            <div className="pt-2">
              <Link
                href="/properties/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Your First Property
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Steps */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Quick Onboarding Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                1. Add Properties & Units
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create buildings or estates and set up your rental units with
                default pricing.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
              >
                Go to Properties <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                2. Onboard Tenants & Leases
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Register tenants, assign them to active leases, and configure
                security deposits.
              </p>
              <Link
                href="/tenants"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline pt-1"
              >
                Go to Tenants <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                3. Track Invoices & Payments
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate monthly rent invoices, record payment receipts, and
                view reports.
              </p>
              <Link
                href="/billing"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-1"
              >
                Go to Billing <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Executive Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time performance metrics across properties, occupancy, revenue,
          and expenses.
        </p>
      </div>

      {/* Grid Row 1: Operations & Occupancy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Properties
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.totalProperties || 0}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            Active real estate assets
          </p>
        </div>

        {/* Buildings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Buildings
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.totalBuildings || 0}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            Total rental spaces managed
          </p>
        </div>

        {/* Total Tenants */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Tenants
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.totalTenants || 0}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            Currently active lease holders
          </p>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Occupancy Rate
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  (data.occupancyRate || 0) >= 80
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {(data.occupancyRate || 0).toFixed(2)}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {(data.occupancyRate || 0).toFixed(2)}%
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            {data.occupiedUnits || 0} of {data.totalUnits || 0} units occupied
          </p>
        </div>
      </div>

      {/* Grid Row 2: Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Due */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Due
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            KES{" "}
            {(data.totalDue || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Outstanding rental payments
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Revenue
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            KES{" "}
            {(data.totalRevenue || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Total rental & fee collections
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Expenses
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            KES{" "}
            {(data.totalExpenses || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Operational & maintenance outlays
          </p>
        </div>

        {/* Net Operating Income */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Net Operating Income
          </p>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              calculatedNetIncome >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            KES{" "}
            {calculatedNetIncome.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Revenue minus recorded expenses
          </p>
        </div>
      </div>
    </div>
  );
}
