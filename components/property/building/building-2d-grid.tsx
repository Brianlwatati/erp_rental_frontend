"use client";

import { useMemo } from "react";
import { Building, Unit } from "@/types/property";

export function Building2DGrid({
  building,
  units,
  onUnitClick,
  onAddUnitClick,
}: {
  building: Building;
  units: Unit[];
  onUnitClick?: (unit: Unit) => void;
  onAddUnitClick?: (floor: number, gridColumn: number) => void;
}) {
  const unitsByFloor = useMemo(() => {
    const map = new Map<number, Unit[]>();

    units.forEach((unit) => {
      const floorList = map.get(unit.floor) || [];
      floorList.push(unit);
      map.set(unit.floor, floorList);
    });

    map.forEach((floorUnits) => {
      floorUnits.sort((a, b) => (a.grid_column ?? 0) - (b.grid_column ?? 0));
    });

    return map;
  }, [units]);

  const totalFloors = building.floors || 1;
  const floorNumbers = useMemo(() => {
    const floors: number[] = [];
    for (let floor = totalFloors - 1; floor >= 0; floor--) {
      floors.push(floor);
    }
    return floors;
  }, [totalFloors]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "VACANT":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "MAINTENANCE":
        return "bg-amber-100 text-amber-700 border-amber-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between space-y-4 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:space-y-0">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            2D Building Elevation &amp; Grid
          </h2>
          <p className="text-xs text-slate-500">
            {building.name} ({building.code}) • {totalFloors} Floors
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Vacant
          </span>
          <span className="flex items-center gap-1 text-blue-700">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Occupied
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Maintenance
          </span>
        </div>
      </div>

      <div className="overflow-x-auto lg:overflow-hidden pt-2">
        <div className="space-y-4">
          {floorNumbers.map((floorNum) => {
            const floorUnits = unitsByFloor.get(floorNum) || [];
            const hasUnits = floorUnits.length > 0;
            const nextGridColumn = hasUnits
              ? Math.max(...floorUnits.map((unit) => unit.grid_column ?? 0)) + 1
              : 0;

            return (
              <div key={floorNum} className="flex items-start gap-3">
                <div className="w-20 shrink-0 pr-2 pt-3 text-right">
                  <span className="block text-xs font-bold text-slate-700">
                    Floor {floorNum}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-400">
                    {floorUnits.length}{" "}
                    {floorUnits.length === 1 ? "unit" : "units"}
                  </span>
                </div>

                <div className="flex min-h-21 w-max min-w-full flex-nowrap items-center gap-3">
                  {floorUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => onUnitClick?.(unit)}
                      className={`group flex h-21 w-36 shrink-0 cursor-pointer flex-col justify-between rounded-lg border bg-white p-3 text-left shadow-sm transition-all hover:shadow-md ${
                        unit.status === "VACANT"
                          ? "border-emerald-200 hover:border-emerald-400"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <span className="flex w-full items-start justify-between gap-2">
                        <span className="break-all text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                          {unit.unit_number}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${getStatusBadge(
                            unit.status,
                          )}`}
                        >
                          {unit.status}
                        </span>
                      </span>

                      <span className="flex items-end justify-between font-mono text-[11px] text-slate-500">
                        <span>
                          KES {Number(unit.monthly_rent).toLocaleString()}
                        </span>
                        <span className="font-sans text-[9px] text-slate-400">
                          Col {unit.grid_column}
                        </span>
                      </span>
                    </button>
                  ))}

                  {!hasUnits && (
                    <div className="flex h-21 w-36 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2 text-center text-slate-400">
                      <span className="text-[11px] font-medium text-slate-500">
                        No Units
                      </span>
                      <span className="text-[9px] text-slate-400">
                        (Column 0)
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onAddUnitClick?.(floorNum, nextGridColumn)}
                    className="group print:hidden flex h-21 w-36 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-slate-500 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="text-lg font-bold transition-transform group-hover:scale-110">
                      +
                    </span>
                    <span className="mt-0.5 text-[11px] font-semibold">
                      Add Unit
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      (Col {nextGridColumn})
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
