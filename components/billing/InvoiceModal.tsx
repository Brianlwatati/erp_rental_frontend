"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { InvoiceCreateInput } from "@/types/invoice";
import { InvoiceItemFields, InvoiceItemInput } from "./InvoiceItemFields";

type InvoiceValidationResult =
  | { success: true; data: InvoiceCreateInput }
  | {
      success: false;
      error: { issues: Array<{ path: string[]; message: string }> };
    };

function validateInvoicePayload(
  payload: InvoiceCreateInput,
): InvoiceValidationResult {
  const issues: Array<{ path: string[]; message: string }> = [];

  const requiredFields: Array<keyof InvoiceCreateInput> = [
    "tenantId",
    "leaseId",
    "invoiceDate",
    "dueDate",
    "periodStart",
    "periodEnd",
  ];

  requiredFields.forEach((field) => {
    if (!payload[field]) {
      issues.push({ path: [field], message: "This field is required." });
    }
  });

  if (payload.items.length === 0) {
    issues.push({ path: ["items"], message: "Add at least one line item." });
  }

  payload.items.forEach((item, index) => {
    if (!item.description.trim()) {
      issues.push({
        path: ["items", String(index), "description"],
        message: "Description is required.",
      });
    }
    if (!item.itemType) {
      issues.push({
        path: ["items", String(index), "itemType"],
        message: "Item type is required.",
      });
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      issues.push({
        path: ["items", String(index), "quantity"],
        message: "Quantity must be greater than zero.",
      });
    }
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      issues.push({
        path: ["items", String(index), "unitPrice"],
        message: "Unit price cannot be negative.",
      });
    }
  });

  return issues.length > 0
    ? { success: false, error: { issues } }
    : { success: true, data: payload };
}

export interface Invoice {
  id: string;
  company_id?: string;
  tenant_id: string;
  lease_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_paid: number;
  balance: number;
  status:
    | "DRAFT"
    | "ISSUED"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  notes?: string;
  items?: InvoiceItemInput[];
}

interface InvoiceModalProps {
  invoice: Invoice | null;
  leases: Lease[];
  tenants: Tenant[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceModal({
  invoice,
  leases,
  tenants,
  isOpen,
  onClose,
  onSuccess,
}: InvoiceModalProps) {
  const [items, setItems] = useState<InvoiceItemInput[]>([
    {
      description: "Monthly Rent",
      itemType: "RENT",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    },
  ]);

  const [formData, setFormData] = useState({
    tenantId: "",
    leaseId: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    periodStart: "",
    periodEnd: "",
    discount: 0,
    tax: 0,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync state when modal opens or editing
  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setFormData({
          tenantId: invoice.tenant_id || "",
          leaseId: invoice.lease_id || "",
          invoiceNumber: invoice.invoice_number || "",
          invoiceDate: invoice.invoice_date?.split("T")[0] || "",
          dueDate: invoice.due_date?.split("T")[0] || "",
          periodStart: invoice.period_start?.split("T")[0] || "",
          periodEnd: invoice.period_end?.split("T")[0] || "",
          discount: invoice.discount || 0,
          tax: invoice.tax || 0,
          notes: invoice.notes || "",
        });

        if (invoice.items && invoice.items.length > 0) {
          setItems(
            invoice.items.map((item) => ({
              description: item.description,
              itemType: item.itemType || (item as any).item_type || "RENT",
              quantity: item.quantity,
              unitPrice: item.unitPrice || (item as any).unit_price || 0,
              amount:
                (item.quantity || 1) *
                (item.unitPrice || (item as any).unit_price || 0),
            })),
          );
        }
      } else {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setFormData({
          tenantId: "",
          leaseId: "",
          invoiceNumber: "",
          invoiceDate: today.toISOString().split("T")[0],
          dueDate: new Date(today.setDate(today.getDate() + 7))
            .toISOString()
            .split("T")[0],
          periodStart: firstDay.toISOString().split("T")[0],
          periodEnd: lastDay.toISOString().split("T")[0],
          discount: 0,
          tax: 0,
          notes: "",
        });
        setItems([
          {
            description: "Monthly Rent",
            itemType: "RENT",
            quantity: 1,
            unitPrice: 0,
            amount: 0,
          },
        ]);
      }
      setErrors({});
      setServerError(null);
    }
  }, [invoice, isOpen]);

  // Derived financial summary
  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) =>
        acc + (item.amount ?? (item.quantity || 0) * (item.unitPrice || 0)),
      0,
    );
  }, [items]);

  const total = useMemo(() => {
    const disc = Number(formData.discount) || 0;
    const tx = Number(formData.tax) || 0;
    return Math.max(0, subtotal - disc + tx);
  }, [subtotal, formData.discount, formData.tax]);

  // Handle Lease changes and auto-bind Tenant & Rent price
  const handleLeaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leaseId = e.target.value;
    const selectedLease = leases.find((l) => l.id === leaseId);

    setFormData((prev) => ({
      ...prev,
      leaseId,
      tenantId: selectedLease?.tenant_id || prev.tenantId,
    }));

    if (selectedLease?.monthly_rent) {
      setItems((prevItems) => {
        const updated = [...prevItems];
        if (updated.length > 0 && updated[0].itemType === "RENT") {
          updated[0].unitPrice = selectedLease.monthly_rent;
          updated[0].amount = selectedLease.monthly_rent * updated[0].quantity;
        }
        return updated;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    const payloadToValidate = {
      ...formData,
      items: items.map((i) => ({
        description: i.description,
        itemType: i.itemType,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };

    const validation = validateInvoicePayload(payloadToValidate);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(
        (issue: { path: any[]; message: string }) => {
          const pathStr = issue.path.join(".");
          fieldErrors[pathStr] = issue.message;
        },
      );
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (invoice) {
        await apiFetch(`/invoices/${invoice.id}`, {
          method: "PUT",
          body: JSON.stringify(validation.data),
        });
      } else {
        await apiFetch("/invoices", {
          method: "POST",
          body: JSON.stringify(validation.data),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save invoice.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {invoice ? "Edit Rental Invoice" : "Create Rental Invoice"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lease Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Lease <span className="text-rose-500">*</span>
              </label>
              <select
                name="leaseId"
                value={formData.leaseId}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="">Choose Active Lease</option>
                {leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    Unit {l.unit?.unit_number} - {l.tenant?.first_name}{" "}
                    {l.tenant?.last_name}
                  </option>
                ))}
              </select>
              {errors.leaseId && (
                <p className="mt-1 text-xs text-rose-600">{errors.leaseId}</p>
              )}
            </div>

            {/* Tenant Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tenant <span className="text-rose-500">*</span>
              </label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
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

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-rose-600">{errors.dueDate}</p>
              )}
            </div>

            {/* Billing Period Start */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Period Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="periodStart"
                value={formData.periodStart}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              {errors.periodStart && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.periodStart}
                </p>
              )}
            </div>

            {/* Billing Period End */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Period End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="periodEnd"
                value={formData.periodEnd}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              {errors.periodEnd && (
                <p className="mt-1 text-xs text-rose-600">{errors.periodEnd}</p>
              )}
            </div>
          </div>

          {/* Dynamic Items */}
          <InvoiceItemFields
            items={items}
            onChange={setItems}
            errors={errors}
          />

          {/* Discounts & Taxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount (KES)
              </label>
              <input
                type="number"
                name="discount"
                min="0"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tax (KES)
              </label>
              <input
                type="number"
                name="tax"
                min="0"
                value={formData.tax}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Live Calculated Totals Card */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600">
              Subtotal: KES {subtotal.toLocaleString()}
            </span>
            <span className="text-slate-600">
              Tax/Disc: +{formData.tax} / -{formData.discount}
            </span>
            <span className="text-sm font-bold text-slate-900">
              Total: KES {total.toLocaleString()}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Payment instructions or terms..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : invoice
                  ? "Update Invoice"
                  : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
