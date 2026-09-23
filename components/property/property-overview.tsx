"use client";

import { Property } from "@/types/property";
import { StatusBadge } from "@/components/ui/badge";

export function PropertyOverviewTab({ property }: { property: Property }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Property Details
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Code:</span>{" "}
              <span className="font-mono font-semibold text-slate-800">
                {property.code}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Type:</span>{" "}
              <span className="font-semibold text-slate-800">
                {property.property_type || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              <StatusBadge status={property.status} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Location
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Address:</span>{" "}
              <span className="font-medium text-slate-800">
                {property.address || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">City:</span>{" "}
              <span className="font-medium text-slate-800">
                {property.city || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">County:</span>{" "}
              <span className="font-medium text-slate-800">
                {property.county || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Asset Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Total Buildings:</span>{" "}
              <span className="font-semibold text-slate-800">
                {property.buildings?.length || 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Total Units:</span>{" "}
              <span className="font-semibold text-slate-800">
                {property.units?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {property.description && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {property.description}
          </p>
        </div>
      )}
    </div>
  );
}
