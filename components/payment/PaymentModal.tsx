"use client";

import React, { useState, useEffect, useMemo } from "react";
import { paymentCreateSchema, PaymentCreateInput } from "@/types/payment";
import { apiFetch } from "@/lib/api_client";
import { Tenant } from "@/types/tenant";
import { Invoice } from "@/types/invoice";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenants: Tenant[];
  unpaidInvoices: Invoice[];
  preselectedTenantId?: string;
  preselectedInvoiceId?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  tenants,
  unpaidInvoices,
  preselectedTenantId,
  preselectedInvoiceId,
}: PaymentModalProps) {
  const [formData, setFormData] = useState({
    tenantId: preselectedTenantId || "",
    paymentNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: 0,
    paymentMethod: "MPESA" as const,
    referenceNumber: "",
    notes: "",
  });

  const [allocations, setAllocations] = useState<
    { invoiceId: string; amount: number }[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Filter open invoices for selected tenant
  const tenantInvoices = useMemo(() => {
    if (!formData.tenantId) return [];
    console.log("Filtering invoices for tenant:", formData.tenantId);
    return unpaidInvoices.filter((inv) => inv.tenantId === formData.tenantId);
  }, [formData.tenantId, unpaidInvoices]);

  useEffect(() => {
    if (isOpen) {
      const initialTenant = preselectedTenantId || "";
      setFormData({
        tenantId: initialTenant,
        paymentNumber: "",
        paymentDate: new Date().toISOString().split("T")[0],
        amount: 0,
        paymentMethod: "MPESA",
        referenceNumber: "",
        notes: "",
      });

      if (preselectedInvoiceId) {
        const inv = unpaidInvoices.find((i) => i.id === preselectedInvoiceId);
        if (inv) {
          setFormData((prev) => ({
            ...prev,
            tenantId: inv.tenantId,
            amount: inv.balance,
          }));
          setAllocations([{ invoiceId: inv.id, amount: inv.balance }]);
        }
      } else {
        setAllocations([]);
      }
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, preselectedTenantId, preselectedInvoiceId, unpaidInvoices]);

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value;
    setFormData((prev) => ({ ...prev, tenantId }));
    setAllocations([]); // Reset allocations when tenant changes
  };

  const handleAllocationChange = (
    invoiceId: string,
    allocatedAmount: number,
  ) => {
    setAllocations((prev) => {
      const existing = prev.find((a) => a.invoiceId === invoiceId);
      if (allocatedAmount <= 0) {
        return prev.filter((a) => a.invoiceId !== invoiceId);
      }
      if (existing) {
        return prev.map((a) =>
          a.invoiceId === invoiceId ? { ...a, amount: allocatedAmount } : a,
        );
      }
      return [...prev, { invoiceId, amount: allocatedAmount }];
    });
  };

  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [allocations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    const payload: PaymentCreateInput = {
      tenantId: formData.tenantId,
      paymentNumber: formData.paymentNumber || undefined,
      paymentDate: formData.paymentDate || undefined,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber || undefined,
      notes: formData.notes || undefined,
      allocations: allocations.length > 0 ? allocations : undefined,
    };

    const validation = paymentCreateSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    if (totalAllocated > payload.amount) {
      setServerError(
        "Total allocated amount cannot exceed the payment amount.",
      );
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/payments", {
        method: "POST",
        body: JSON.stringify(validation.data),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
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
            {/* Tenant Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tenant <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.tenantId}
                onChange={handleTenantChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="">Select Tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name} ({t.email})
                  </option>
                ))}
              </select>
              {errors.tenantId && (
                <p className="mt-1 text-xs text-rose-600">{errors.tenantId}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="MPESA">M-PESA</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Total Amount Received */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Received (KES) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Reference Number (M-PESA code, Check No, etc.) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ref / Trans Code
              </label>
              <input
                type="text"
                placeholder="e.g. QKH7890XYZ"
                value={formData.referenceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Allocation Section */}
          {tenantInvoices.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Invoice Allocations
                </label>
                <span className="text-xs text-slate-500">
                  Allocated:{" "}
                  <strong className="text-slate-900">
                    KES {totalAllocated.toLocaleString()}
                  </strong>{" "}
                  / KES {formData.amount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {tenantInvoices.map((inv) => {
                  const currentAlloc =
                    allocations.find((a) => a.invoiceId === inv.id)?.amount ||
                    0;
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {inv.invoiceNumber}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Due: {inv.dueDate} | Balance: KES{" "}
                          {inv.balance.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          placeholder="0.00"
                          max={inv.balance}
                          value={currentAlloc || ""}
                          onChange={(e) =>
                            handleAllocationChange(
                              inv.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full text-right p-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional payment details..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Post Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
