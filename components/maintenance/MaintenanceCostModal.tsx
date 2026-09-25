"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";

export interface OptionItem {
  id: string;
  name: string;
}

export interface MaintenanceCostData {
  id?: string;
  maintenanceRequestId: string;
  vendorId?: string;
  description: string;
  amount: number;
  expenseId?: string;
}

interface MaintenanceCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  costRecord?: MaintenanceCostData | null;
  requestId: string;
  requestTitle?: string;
  vendors: OptionItem[];
  expenses?: OptionItem[];
}

export function MaintenanceCostModal({
  isOpen,
  onClose,
  onSuccess,
  costRecord,
  requestId,
  requestTitle = "Maintenance Work Order",
  vendors = [],
  expenses = [],
}: MaintenanceCostModalProps) {
  const [formData, setFormData] = useState<Partial<MaintenanceCostData>>({
    maintenanceRequestId: requestId,
    vendorId: "",
    description: "",
    amount: 0,
    expenseId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (costRecord) {
      setFormData({
        maintenanceRequestId: costRecord.maintenanceRequestId || requestId,
        vendorId: costRecord.vendorId || "",
        description: costRecord.description || "",
        amount: costRecord.amount || 0,
        expenseId: costRecord.expenseId || "",
      });
    } else {
      setFormData({
        maintenanceRequestId: requestId,
        vendorId: vendors[0]?.id || "",
        description: "",
        amount: 0,
        expenseId: "",
      });
    }
    setError(null);
  }, [costRecord, isOpen, requestId, vendors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      maintenanceRequestId: requestId,
      description: formData.description,
      amount: Number(formData.amount),
      vendorId: formData.vendorId || undefined,
      expenseId: formData.expenseId || undefined,
    };

    try {
      const endpoint = costRecord?.id
        ? `/maintenance-costs/${costRecord.id}`
        : "/maintenance-costs";
      const method = costRecord?.id ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to log maintenance cost:", err);
      setError(
        err.message ||
          "Failed to log cost entry. Please review amount and description.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {costRecord?.id
                ? "Edit Maintenance Cost"
                : "Log Maintenance Cost"}
            </h2>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">
              Request:{" "}
              <span className="font-medium text-slate-700">{requestTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 font-bold text-base leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Vendor Assignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor / Contractor
            </label>
            <select
              value={formData.vendorId || ""}
              onChange={(e) =>
                setFormData({ ...formData, vendorId: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value="">-- Direct Labor / Unassigned --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost Item Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Purchased replacement PVC pipes and sealant"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (KES) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Linked Rental Expense (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link General Ledger Expense (Optional)
            </label>
            <select
              value={formData.expenseId || ""}
              onChange={(e) =>
                setFormData({ ...formData, expenseId: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value="">-- No Ledger Entry Linked --</option>
              {expenses.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : costRecord?.id
                  ? "Update Cost"
                  : "Record Cost"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
