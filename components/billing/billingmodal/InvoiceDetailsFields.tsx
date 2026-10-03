import type { ChangeEventHandler } from "react";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";

export interface InvoiceFormData {
  tenantId: string;
  leaseId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  discount: number | string;
  tax: number | string;
  notes: string;
}

interface InvoiceDetailsFieldsProps {
  formData: InvoiceFormData;
  leases: Lease[];
  tenants: Tenant[];
  errors: Record<string, string>;
  loadingCharges: boolean;
  chargeLoadError: string | null;
  isEditing: boolean;
  onLeaseChange: ChangeEventHandler<HTMLSelectElement>;
  onChange: ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
}

export function InvoiceDetailsFields({
  formData,
  leases,
  tenants,
  errors,
  loadingCharges,
  chargeLoadError,
  isEditing,
  onLeaseChange,
  onChange,
}: InvoiceDetailsFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Select Lease <span className="text-rose-500">*</span>
        </label>
        <select
          name="leaseId"
          value={formData.leaseId}
          onChange={onLeaseChange}
          disabled={isEditing}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="">Choose Active Lease</option>
          {leases.map((lease) => (
            <option
              key={lease.id}
              value={lease.id}
              disabled={lease.lease_invoice_id != null}
            >
              Unit {lease.unit_number} - {lease.building_name}:{" "}
              {lease.tenant_first_name} {lease.tenant_last_name}
            </option>
          ))}
        </select>
        {loadingCharges && (
          <p className="mt-1 text-xs text-slate-500">
            Loading invoice line items...
          </p>
        )}
        {chargeLoadError && (
          <p className="mt-1 text-xs text-rose-600">{chargeLoadError}</p>
        )}
        {errors.leaseId && (
          <p className="mt-1 text-xs text-rose-600">{errors.leaseId}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Tenant <span className="text-rose-500">*</span>
        </label>
        <select
          name="tenantId"
          value={formData.tenantId}
          onChange={onChange}
          disabled={isEditing}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="">Choose Tenant</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.first_name} {tenant.last_name}
            </option>
          ))}
        </select>
        {errors.tenantId && (
          <p className="mt-1 text-xs text-rose-600">{errors.tenantId}</p>
        )}
      </div>

      <DateField
        name="invoiceDate"
        label="Invoice Date"
        value={formData.invoiceDate}
        disabled={isEditing}
        onChange={onChange}
      />
      <DateField
        name="dueDate"
        label="Due Date"
        value={formData.dueDate}
        error={errors.dueDate}
        required
        onChange={onChange}
      />
      <DateField
        name="periodStart"
        label="Period Start Date"
        value={formData.periodStart}
        error={errors.periodStart}
        required
        disabled={isEditing}
        onChange={onChange}
      />
      <DateField
        name="periodEnd"
        label="Period End Date"
        value={formData.periodEnd}
        error={errors.periodEnd}
        required
        disabled={isEditing}
        onChange={onChange}
      />
    </div>
  );
}

interface DateFieldProps {
  name: "invoiceDate" | "dueDate" | "periodStart" | "periodEnd";
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

function DateField({
  name,
  label,
  value,
  error,
  required = false,
  disabled = false,
  onChange,
}: DateFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="date"
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
