"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { UnitType } from "@/types/property";

// Zod validation matching unitTypeCreateSchema
const unitTypeSchema = z.object({
  name: z.string().min(1, "Unit type name is required"),
  code: z.string().min(1, "Unit type code is required"),
  bedrooms: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? 0 : Number(val),
    z.number().min(0, "Bedrooms cannot be negative").default(0),
  ),
  bathrooms: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? 0 : Number(val),
    z.number().min(0, "Bathrooms cannot be negative").default(0),
  ),
  description: z.string().optional(),
});

type UnitTypeFormData = z.infer<typeof unitTypeSchema>;

interface UnitTypeModalProps {
  unitType: UnitType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitTypeModal({
  unitType,
  isOpen,
  onClose,
  onSuccess,
}: UnitTypeModalProps) {
  const [formData, setFormData] = useState({
    name: unitType?.name || "",
    code: unitType?.code || "",
    bedrooms: unitType?.bedrooms ?? 0,
    bathrooms: unitType?.bathrooms ?? 0,
    description: unitType?.description || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (unitType) {
      setFormData({
        name: unitType.name || "",
        code: unitType.code || "",
        bedrooms: unitType.bedrooms ?? 0,
        bathrooms: unitType.bathrooms ?? 0,
        description: unitType.description || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        bedrooms: 0,
        bathrooms: 0,
        description: "",
      });
    }
    setErrors({});
    setServerError(null);
  }, [unitType, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    const validation = unitTypeSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: validation.data.name,
        code: validation.data.code,
        bedrooms: validation.data.bedrooms,
        bathrooms: validation.data.bathrooms,
        ...(validation.data.description && {
          description: validation.data.description,
        }),
      };

      if (unitType) {
        // Edit Unit Type
        await apiFetch(`/unit-types/${unitType.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // Create Unit Type
        await apiFetch("/unit-types", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save unit type.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {unitType ? "Edit Unit Type" : "Add New Unit Type"}
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
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Unit Type Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. 2 Bedroom Deluxe / Studio"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-rose-300 focus:ring-rose-500"
                  : "border-slate-300 focus:ring-blue-500"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Code <span className="text-rose-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              placeholder="e.g. 2BR-DLX"
              value={formData.code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.code
                  ? "border-rose-300 focus:ring-rose-500"
                  : "border-slate-300 focus:ring-blue-500"
              }`}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bedrooms"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Bedrooms
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-xs text-rose-600">{errors.bedrooms}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="bathrooms"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Bathrooms
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-xs text-rose-600">{errors.bathrooms}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Optional notes or specification..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
                : unitType
                  ? "Update Unit Type"
                  : "Create Unit Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
