"use client";

import React from "react";
import Link from "next/link";
import {
  Building,
  Home,
  Users,
  Wrench,
  ChevronRight,
  Plus,
} from "lucide-react";

export interface BuildingData {
  id: string;
  name: string;
  code?: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  pending_maintenance?: number;
}

interface BuildingCardProps {
  building: BuildingData;
  propertyId: string;
  onAddUnit: (buildingId: string) => void;
}

export function BuildingCard({
  building,
  propertyId,
  onAddUnit,
}: BuildingCardProps) {
  const occupancyRate =
    building.total_units > 0
      ? Math.round((building.occupied_units / building.total_units) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {building.name}
            </h3>
            {building.code && (
              <span className="text-[11px] font-semibold text-slate-400">
                Code: {building.code}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onAddUnit(building.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Unit
        </button>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Units
          </span>
          <span className="text-sm font-bold text-slate-800">
            {building.total_units}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Occupied
          </span>
          <span className="text-sm font-bold text-emerald-600">
            {building.occupied_units}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Vacant
          </span>
          <span className="text-sm font-bold text-amber-600">
            {building.vacant_units}
          </span>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[11px] font-semibold">
          <span className="text-slate-500">Occupancy Rate</span>
          <span className="text-slate-800">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              occupancyRate >= 80
                ? "bg-emerald-500"
                : occupancyRate >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1" title="Active Tenants">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {building.occupied_units}
          </span>
          {Boolean(building.pending_maintenance) && (
            <span
              className="flex items-center gap-1 text-amber-600 font-medium"
              title="Pending Maintenance"
            >
              <Wrench className="w-3.5 h-3.5" />
              {building.pending_maintenance}
            </span>
          )}
        </div>

        <Link
          href={`/properties/${propertyId}/buildings/${building.id}`}
          className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 transition"
        >
          View Units <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
