"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";

export interface OptionItem {
  id: string;
  name: string;
}

export interface MaintenanceRequestData {
  id?: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdBy?: string;
}

interface MaintenanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request?: MaintenanceRequestData | null;
  properties: OptionItem[];
  units?: OptionItem[];
  tenants?: OptionItem[];
}

export function MaintenanceRequestModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  properties,
  units = [],
  tenants = [],
}: MaintenanceRequestModalProps) {
  const [formData, setFormData] = useState<Partial<MaintenanceRequestData>>({
    propertyId: "",
    unitId: "",
    tenantId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      setFormData({
        propertyId: request.propertyId || "",
        unitId: request.unitId || "",
        tenantId: request.tenantId || "",
        title: request.title || "",
        description: request.description || "",
        priority: request.priority || "MEDIUM",
      });
    } else {
      setFormData({
        propertyId: properties[0]?.id || "",
        unitId: "",
        tenantId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
      });
    }
    setError(null);
  }, [request, isOpen, properties]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Sanitize payload: replace empty strings with undefined for optional fields
    const payload = {
      propertyId: formData.propertyId,
      title: formData.title,
      priority: formData.priority || "MEDIUM",
      unitId: formData.unitId || undefined,
      tenantId: formData.tenantId || undefined,
      description: formData.description || undefined,
    };

    try {
      const endpoint = request?.id
        ? `/maintenance-requests/${request.id}`
        : "/maintenance-requests";
      const method = request?.id ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save maintenance request:", err);
      setError(
        err.message ||
          "Failed to submit request. Please check required fields.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">
            {request?.id
              ? "Edit Maintenance Request"
              : "New Maintenance Request"}
          </h2>
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

          {/* Property Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.propertyId || ""}
              onChange={(e) =>
                setFormData({ ...formData, propertyId: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value="">-- Select Property --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit & Tenant Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit (Optional)
              </label>
              <select
                value={formData.unitId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, unitId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Common Area / None</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reported By Tenant (Optional)
              </label>
              <select
                value={formData.tenantId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tenantId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Property Staff / None</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Title & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Water leak in kitchen sink"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority || "MEDIUM"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target
                      .value as MaintenanceRequestData["priority"],
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of the issue or instructions for maintenance crew..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
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
                : request?.id
                  ? "Update Request"
                  : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
