"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api_client";

export interface OverviewData {
  totalProperties: number;
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  totalTenants: number;
  totalRevenue: number;
  totalExpenses: number;
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

  const calculatedNetIncome =
    data.netIncome !== undefined
      ? data.netIncome
      : (data.totalRevenue || 0) - (data.totalExpenses || 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
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

        {/* Buildings & Units */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Buildings
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.totalBuildings || 0}{" "}
              {/* <span className="text-slate-400 font-normal text-lg">
                / {data.totalUnits || 0}
              </span> */}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            Total rental spaces managed
          </p>
        </div>

        {/* Total Tenants */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
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
                {data.occupancyRate || 0}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.occupancyRate || 0}%
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            {data.occupiedUnits || 0} of {data.totalUnits || 0} units occupied
          </p>
        </div>
      </div>

      {/* Grid Row 2: Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
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
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm">
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
