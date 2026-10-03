import {
  ArrowLeft,
  Bath,
  Bed,
  DollarSign,
  FilePlus,
  Home,
  KeyRound,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Unit } from "@/types/property";

export function UnitDetailHeader({
  unit,
  leaseSetupLoading,
  onBack,
  onCreateLease,
}: {
  unit: Unit;
  leaseSetupLoading: boolean;
  onBack: () => void;
  onCreateLease: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <button
          type="button"
          onClick={onBack}
          className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Back to Units
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Unit {unit.unit_number}
          </h1>
          <StatusBadge status={unit.status} />
        </div>
        <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{unit.property_name || "Unassigned Property"}</span>
          {unit.property_code && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              {unit.property_code}
            </span>
          )}
          <span aria-hidden="true">•</span>
          <span>{unit.building_name || "Unassigned Building"}</span>
          {unit.building_code && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              {unit.building_code}
            </span>
          )}
        </p>
      </div>

      {unit.status === "VACANT" && (
        <button
          type="button"
          onClick={onCreateLease}
          disabled={leaseSetupLoading}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <FilePlus aria-hidden="true" className="h-4 w-4" />
          {leaseSetupLoading ? "Preparing lease..." : "Draft Lease"}
        </button>
      )}
    </div>
  );
}

export function VacantUnitNotice({
  leaseSetupLoading,
  error,
  onCreateLease,
}: {
  leaseSetupLoading: boolean;
  error: string | null;
  onCreateLease: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-blue-200/70 bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <KeyRound aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-blue-950">
              Unit Ready for Occupancy
            </h2>
            <p className="mt-0.5 text-xs text-blue-700/80">
              This unit is currently marked as <strong>VACANT</strong>. You can
              initiate a new tenant lease agreement now.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateLease}
          disabled={leaseSetupLoading}
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {leaseSetupLoading ? "Preparing lease..." : "Create Lease"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </>
  );
}

export function UnitSummaryCards({ unit }: { unit: Unit }) {
  const cards = [
    {
      label: "Monthly Rent",
      value: `$${unit.monthly_rent?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Deposit Required",
      value: `$${unit.deposit_amount?.toLocaleString() || "0"}`,
      icon: ShieldCheck,
      color: "indigo",
    },
    {
      label: "Floor Level",
      value: `Floor ${unit.floor}`,
      icon: Layers,
      color: "amber",
    },
    {
      label: "Bedrooms & Bath",
      value: `${unit.unit_type_bedrooms ?? 0} Bed • ${unit.unit_type_bathrooms || "0"} Bath`,
      icon: Bed,
      color: "blue",
    },
  ];

  const iconColors = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <p className="mt-1 wrap-break-word text-xl font-bold text-slate-900">
              {value}
            </p>
          </div>
          <div
            className={`ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconColors[color as keyof typeof iconColors]}`}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UnitSpecifications({ unit }: { unit: Unit }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Home aria-hidden="true" className="h-4 w-4" />
        </span>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Unit Specifications
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
          <p className="text-[11px] font-medium text-slate-400">Unit Number</p>
          <p className="mt-0.5 text-sm font-bold text-slate-800">
            {unit.unit_number}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
          <p className="text-[11px] font-medium text-slate-400">Unit Type</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
            {unit.unit_type_name || "Standard"}
            {unit.unit_type_code && (
              <span className="ml-1 text-[10px] text-slate-400">
                ({unit.unit_type_code})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Bedrooms</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {unit.unit_type_bedrooms ?? 0}
            </p>
          </div>
          <Bed aria-hidden="true" className="h-4 w-4 text-slate-400" />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Bathrooms</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {unit.unit_type_bathrooms || "0"}
            </p>
          </div>
          <Bath aria-hidden="true" className="h-4 w-4 text-slate-400" />
        </div>
        <div className="col-span-2 rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
          <p className="text-[11px] font-medium text-slate-400">
            Floor &amp; Position
          </p>
          <p className="mt-0.5 font-semibold text-slate-800">
            Floor {unit.floor}
            {unit.building_floors ? ` (out of ${unit.building_floors})` : ""}
            {unit.grid_column !== undefined
              ? ` • Column ${unit.grid_column}`
              : ""}
          </p>
        </div>
      </div>

      {unit.description && (
        <div className="border-t border-slate-100 pt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Description
          </p>
          <p className="text-xs leading-relaxed text-slate-600">
            {unit.description}
          </p>
        </div>
      )}
    </section>
  );
}
