"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiFetch } from "@/lib/api_client";
import { Lease, LeaseCharge } from "@/types/lease";
import { Tenant } from "@/types/tenant";
import { Invoice, InvoiceCreateInput } from "@/types/invoice";
import { InvoiceItemFields, InvoiceItemInput } from "./InvoiceItemFields";
import {
  InvoiceDetailsFields,
  InvoiceFormData,
} from "./billingmodal/InvoiceDetailsFields";
import { InvoiceFinancialFields } from "./billingmodal/InvoiceFinancialFields";
import {
  addDaysToBillingDate,
  formatBillingDateInput,
} from "@/lib/billing_dates";

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

  const [formData, setFormData] = useState<InvoiceFormData>({
    tenantId: "",
    leaseId: "",
    invoiceNumber: "",
    invoiceDate: formatBillingDateInput(new Date()),
    dueDate: "",
    periodStart: "",
    periodEnd: "",
    discount: 0,
    tax: 0,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingCharges, setLoadingCharges] = useState(false);
  const [chargeLoadError, setChargeLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const chargeFetchVersion = useRef(0);

  // Sync state when modal opens or editing
  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setFormData({
          tenantId: invoice.tenant_id || "",
          leaseId: invoice.lease_id || "",
          invoiceNumber: invoice.invoice_number || "",
          invoiceDate: formatBillingDateInput(invoice.invoice_date || ""),
          dueDate: formatBillingDateInput(invoice.due_date || ""),
          periodStart: formatBillingDateInput(invoice.period_start || ""),
          periodEnd: formatBillingDateInput(invoice.period_end || ""),
          discount: Number(invoice.discount) || 0,
          tax: Number(invoice.tax) || 0,
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
        const today = formatBillingDateInput(new Date());
        const [year, month] = today.split("-").map(Number);
        const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = formatBillingDateInput(
          new Date(Date.UTC(year, month, 0)),
        );

        setFormData({
          tenantId: "",
          leaseId: "",
          invoiceNumber: "",
          invoiceDate: today,
          dueDate: addDaysToBillingDate(today, 7),
          periodStart: firstDay,
          periodEnd: lastDay,
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
      setChargeLoadError(null);
    } else {
      chargeFetchVersion.current += 1;
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
  const handleLeaseChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leaseId = e.target.value;
    const selectedLease = leases.find((l) => l.id === leaseId);
    const requestVersion = ++chargeFetchVersion.current;

    setFormData((prev) => ({
      ...prev,
      leaseId,
      tenantId: selectedLease?.tenant_id || prev.tenantId,
    }));
    setChargeLoadError(null);

    if (!selectedLease) {
      setLoadingCharges(false);
      setItems([
        {
          description: "Monthly Rent",
          itemType: "RENT",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ]);
      return;
    }

    const rent = Number(selectedLease.monthly_rent) || 0;
    const rentItem: InvoiceItemInput = {
      description: "Monthly Rent",
      itemType: "RENT",
      quantity: 1,
      unitPrice: rent,
      amount: rent,
    };
    setItems([rentItem]);
    setLoadingCharges(true);

    try {
      const response = await apiFetch<LeaseCharge[]>(
        `/leases/${leaseId}/charges`,
      );
      if (requestVersion !== chargeFetchVersion.current) return;

      const recurringItems = (response.data || [])
        .filter((charge) => charge.recurring)
        .map((charge): InvoiceItemInput => {
          const chargeType = charge.charge_type.toUpperCase();
          const supportedTypes = ["UTILITY", "SERVICE", "PARKING", "OTHER"];
          const amount = Number(charge.amount) || 0;

          return {
            description: charge.name,
            itemType: supportedTypes.includes(chargeType)
              ? chargeType
              : "OTHER",
            quantity: 1,
            unitPrice: amount,
            amount,
          };
        });

      setItems([rentItem, ...recurringItems]);
    } catch (err) {
      if (requestVersion !== chargeFetchVersion.current) return;
      console.error("Failed to load lease charges:", err);
      setChargeLoadError(
        "Unable to load lease charges. Select the lease again to retry.",
      );
    } finally {
      if (requestVersion === chargeFetchVersion.current) {
        setLoadingCharges(false);
      }
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

    const payloadToValidate: InvoiceCreateInput = {
      ...formData,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
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
          <InvoiceDetailsFields
            formData={formData}
            leases={leases}
            tenants={tenants}
            errors={errors}
            loadingCharges={loadingCharges}
            chargeLoadError={chargeLoadError}
            onLeaseChange={handleLeaseChange}
            onChange={handleChange}
          />

          {/* Dynamic Items */}
          <InvoiceItemFields
            items={items}
            onChange={setItems}
            errors={errors}
          />

          <InvoiceFinancialFields
            discount={formData.discount}
            tax={formData.tax}
            notes={formData.notes}
            subtotal={subtotal}
            total={total}
            onChange={handleChange}
          />

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
              disabled={loading || loadingCharges || chargeLoadError !== null}
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
