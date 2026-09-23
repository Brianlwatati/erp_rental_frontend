"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { Building } from "@/types/property";

// Zod schema matching your backend definition
const buildingCreateSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  code: z.string().min(1, "Building code is required"),
  floors: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().min(0, "Floors must be 0 or greater").optional(),
  ),
  description: z.string().optional(),
});

type BuildingFormData = z.infer<typeof buildingCreateSchema>;

interface BuildingModalProps {
  propertyId: string;
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuildingModal({
  propertyId,
  building,
  isOpen,
  onClose,
  onSuccess,
}: BuildingModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    floors: string | number;
    description: string;
  }>({
    name: "",
    code: "",
    floors: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name || "",
        code: building.code || "",
        floors: building.floors ?? "",
        description: building.description || "",
      });
    } else {
      setFormData({ name: "", code: "", floors: "", description: "" });
    }
    setErrors({});
    setServerError(null);
  }, [building, isOpen]);

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

    // Validate with Zod
    const validation = buildingCreateSchema.safeParse(formData);

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
      // Clean up optional fields
      const payload = {
        name: validation.data.name,
        code: validation.data.code,
        ...(validation.data.floors !== undefined && {
          floors: validation.data.floors,
        }),
        ...(validation.data.description && {
          description: validation.data.description,
        }),
      };

      if (building) {
        // Edit existing building
        await apiFetch(`/buildings/${building.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // Create new building under property
        await apiFetch(`/buildings/property/${propertyId}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save building.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {building ? "Edit Building" : "Add New Building"}
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
              Building Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Block A / West Wing"
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
              Building Code <span className="text-rose-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              placeholder="e.g. BLK-A"
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

          <div>
            <label
              htmlFor="floors"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Floors
            </label>
            <input
              id="floors"
              name="floors"
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={formData.floors}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.floors
                  ? "border-rose-300 focus:ring-rose-500"
                  : "border-slate-300 focus:ring-blue-500"
              }`}
            />
            {errors.floors && (
              <p className="mt-1 text-xs text-rose-600">{errors.floors}</p>
            )}
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
              placeholder="Optional notes or details..."
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
                : building
                  ? "Update Building"
                  : "Create Building"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
