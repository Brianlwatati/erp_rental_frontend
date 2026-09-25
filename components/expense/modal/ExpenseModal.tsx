"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";
import { Expense, ExpenseCategory } from "@/types/expense";
import { Vendor } from "./VendorModal";

interface OptionItem {
  id: string;
  name: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null;
  categories: ExpenseCategory[];
  vendors: Vendor[];
  properties?: OptionItem[];
  buildings?: OptionItem[];
  units?: OptionItem[];
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expense,
  categories,
  vendors,
  properties = [],
  buildings = [],
  units = [],
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<Partial<Expense>>({
    description: "",
    amount: 0,
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK",
    status: "POSTED",
    expenseNumber: "",
    referenceNumber: "",
    expenseCategoryId: "",
    vendorId: "",
    propertyId: "",
    buildingId: "",
    unitId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount || 0,
        expenseDate: expense.expenseDate
          ? new Date(expense.expenseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        paymentMethod: expense.paymentMethod || "BANK",
        status: expense.status || "POSTED",
        expenseNumber: expense.expenseNumber || "",
        referenceNumber: expense.referenceNumber || "",
        expenseCategoryId: expense.expenseCategoryId || "",
        vendorId: expense.vendorId || "",
        propertyId: expense.propertyId || "",
        buildingId: expense.buildingId || "",
        unitId: expense.unitId || "",
      });
    } else {
      // Auto-generate expense number draft placeholder
      const autoNum = `EXP-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({
        description: "",
        amount: 0,
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMethod: "BANK",
        status: "POSTED",
        expenseNumber: autoNum,
        referenceNumber: "",
        expenseCategoryId: categories[0]?.id || "",
        vendorId: vendors[0]?.id || "",
        propertyId: "",
        buildingId: "",
        unitId: "",
      });
    }
    setError(null);
  }, [expense, isOpen, categories, vendors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Prepare payload matching Zod types (ensure number for amount and strip empty strings)
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      propertyId: formData.propertyId || undefined,
      buildingId: formData.buildingId || undefined,
      unitId: formData.unitId || undefined,
      expenseCategoryId: formData.expenseCategoryId || undefined,
      vendorId: formData.vendorId || undefined,
      referenceNumber: formData.referenceNumber || undefined,
    };

    try {
      const endpoint = expense?.id ? `/expenses/${expense.id}` : "/expenses";
      const method = expense?.id ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save expense:", err);
      setError(
        err.message || "Failed to record expense. Please check input values.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">
            {expense?.id ? "Edit Expense Record" : "Record New Expense"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 font-bold text-base leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Expense Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense #
              </label>
              <input
                type="text"
                value={formData.expenseNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, expenseNumber: e.target.value })
                }
                placeholder="EXP-10001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.expenseDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Monthly Lift Servicing & Maintenance"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>

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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold outline-none"
              />
            </div>
          </div>

          {/* Category & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.expenseCategoryId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expenseCategoryId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code} - {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor / Supplier
              </label>
              <select
                value={formData.vendorId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, vendorId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none"
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map((ven) => (
                  <option key={ven.id} value={ven.id}>
                    {ven.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method, Reference Number & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod || "BANK"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none"
              >
                <option value="BANK">BANK</option>
                <option value="MPESA">MPESA</option>
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference / Tx Code
              </label>
              <input
                type="text"
                placeholder="e.g. QX910283"
                value={formData.referenceNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || "POSTED"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="POSTED">POSTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Optional Entity Allocation (Property / Building / Unit) */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Allocation (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Property
                </label>
                <select
                  value={formData.propertyId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="">General Property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Building
                </label>
                <select
                  value={formData.buildingId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="">N/A</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Unit
                </label>
                <select
                  value={formData.unitId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, unitId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="">N/A</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
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
                : expense?.id
                  ? "Update Expense"
                  : "Post Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
