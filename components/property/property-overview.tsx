"use client";

import { Property } from "@/types/property";
import { StatusBadge } from "@/components/ui/badge";

export function PropertyOverviewTab({ property }: { property: Property }) {
  const buildingCount = property.buildings?.length || 0;
  const unitCount = property.units?.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Buildings */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Buildings
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {buildingCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: Total Units */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Units
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {unitCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: Code Badge */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Property Code
            </p>
            <p className="font-mono text-lg font-bold text-slate-800 mt-1">
              {property.code}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-xs">
            CODE
          </div>
        </div>

        {/* Metric 4: Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status
            </p>
            <div className="mt-1.5">
              <StatusBadge status={property.status} />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Property Attributes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Property Specifications
            </h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
              <dt className="text-xs text-slate-500 font-medium">
                Property Type
              </dt>
              <dd className="font-semibold text-slate-800 mt-0.5">
                {property.property_type || "N/A"}
              </dd>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
              <dt className="text-xs text-slate-500 font-medium">
                System Code
              </dt>
              <dd className="font-mono font-semibold text-slate-800 mt-0.5">
                {property.code}
              </dd>
            </div>
          </dl>
        </div>

        {/* Right Card: Location Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Location & Address
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between pb-2 border-b border-slate-50">
              <span className="text-slate-500">Address</span>
              <span className="font-medium text-slate-800 text-right">
                {property.address || "N/A"}
              </span>
            </div>

            <div className="flex items-start justify-between pb-2 border-b border-slate-50">
              <span className="text-slate-500">City</span>
              <span className="font-medium text-slate-800 text-right">
                {property.city || "N/A"}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500">County / Region</span>
              <span className="font-medium text-slate-800 text-right">
                {property.county || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Card */}
      {property.description && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            Description
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            {property.description}
          </p>
        </div>
      )}
    </div>
  );
}
