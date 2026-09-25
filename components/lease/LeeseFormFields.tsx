"use client";

import React from "react";
import { Building, Unit } from "@/types/property";
import { Tenant } from "@/types/tenant";

interface FormFieldsProps {
  formData: any;
  errors: Record<string, string>;
  buildings: Building[];
  availableUnits: Unit[];
  tenants: Tenant[];
  selectedBuildingId: string;
  tenantLocked: boolean;
  onBuildingChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onUnitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTenantChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

export function LeaseFormFields({
  formData,
  errors,
  buildings,
  availableUnits,
  tenants,
  selectedBuildingId,
  tenantLocked,
  onBuildingChange,
  onUnitChange,
  onTenantChange,
  onChange,
}: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Building Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Select Building
        </label>
        <select
          value={selectedBuildingId}
          onChange={onBuildingChange}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- All / Filter by Building --</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.property_name || "Property"})
            </option>
          ))}
        </select>
      </div>

      {/* Unit Selector */}
      <div>
        <label
          htmlFor="unitId"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Select Unit <span className="text-rose-500">*</span>
        </label>
        <select
          id="unitId"
          name="unitId"
          value={formData.unitId}
          onChange={onUnitChange}
          className={`w-full px-3 py-2 border rounded-lg text-xs bg-white ${
            errors.unitId ? "border-rose-300" : "border-slate-300"
          }`}
        >
          <option value="">Choose Unit</option>
          {availableUnits.map((u) => (
            <option key={u.id} value={u.id}>
              Unit {u.unit_number} ({u.building_name || "Building"})
            </option>
          ))}
        </select>
        {errors.unitId && (
          <p className="mt-1 text-xs text-rose-600">{errors.unitId}</p>
        )}
      </div>

      {/* Tenant Selector */}
      <div>
        <label
          htmlFor="tenantId"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Select Tenant <span className="text-rose-500">*</span>
        </label>
        <select
          id="tenantId"
          name="tenantId"
          value={formData.tenantId}
          onChange={onTenantChange}
          disabled={tenantLocked}
          className={`w-full px-3 py-2 border rounded-lg text-xs bg-white ${
            errors.tenantId ? "border-rose-300" : "border-slate-300"
          } ${tenantLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
        >
          <option value="">Choose Tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.first_name} {t.last_name}
            </option>
          ))}
        </select>
        {errors.tenantId && (
          <p className="mt-1 text-xs text-rose-600">{errors.tenantId}</p>
        )}
      </div>

      {/* Lease Number */}
      <div>
        <label
          htmlFor="leaseNumber"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Lease Number (Optional)
        </label>
        <input
          id="leaseNumber"
          name="leaseNumber"
          type="text"
          placeholder="Auto-generated if blank"
          value={formData.leaseNumber}
          onChange={onChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Lease Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={onChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
        >
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="TERMINATED">TERMINATED</option>
        </select>
      </div>

      {/* Monthly Rent */}
      <div>
        <label
          htmlFor="monthlyRent"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Monthly Rent (KES) <span className="text-rose-500">*</span>
        </label>
        <input
          id="monthlyRent"
          name="monthlyRent"
          type="number"
          placeholder="25000"
          value={formData.monthlyRent}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg text-xs ${
            errors.monthlyRent ? "border-rose-300" : "border-slate-300"
          }`}
        />
        {errors.monthlyRent && (
          <p className="mt-1 text-xs text-rose-600">{errors.monthlyRent}</p>
        )}
      </div>

      {/* Deposit Amount */}
      <div>
        <label
          htmlFor="depositAmount"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Deposit Amount (KES)
        </label>
        <input
          id="depositAmount"
          name="depositAmount"
          type="number"
          placeholder="25000"
          value={formData.depositAmount}
          onChange={onChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>

      {/* Start Date */}
      <div>
        <label
          htmlFor="startDate"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Start Date <span className="text-rose-500">*</span>
        </label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg text-xs ${
            errors.startDate ? "border-rose-300" : "border-slate-300"
          }`}
        />
        {errors.startDate && (
          <p className="mt-1 text-xs text-rose-600">{errors.startDate}</p>
        )}
      </div>

      {/* End Date */}
      <div>
        <label
          htmlFor="endDate"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          End Date (Optional)
        </label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={onChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>

      {/* Billing Day */}
      <div>
        <label
          htmlFor="billingDay"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Billing Day of Month (1 - 28)
        </label>
        <input
          id="billingDay"
          name="billingDay"
          type="number"
          min={1}
          max={28}
          value={formData.billingDay}
          onChange={onChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>

      {/* Notes */}
      <div className="sm:col-span-2">
        <label
          htmlFor="notes"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Notes / Special Terms
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Additional stipulations or remarks..."
          value={formData.notes}
          onChange={onChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>
    </div>
  );
}
