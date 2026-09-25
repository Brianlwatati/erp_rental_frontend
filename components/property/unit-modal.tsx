"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { Unit, Building, UnitType } from "@/types/property";

// Client-side schema aligned with unitCreateSchema
const unitFormSchema = z.object({
  buildingId: z.string().min(1, "Building selection is required"),
  unitTypeId: z.string().optional(),
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().optional(),
  ),
  monthlyRent: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(0, "Rent must be positive"),
  ),
  depositAmount: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? 0 : Number(val),
    z.number().min(0, "Deposit must be positive").default(0),
  ),
  status: z
    .enum(["VACANT", "INACTIVE", "OCCUPIED", "RESERVED", "MAINTENANCE"])
    .default("VACANT"),
  description: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

interface UnitModalProps {
  buildings: Building[];
  unitTypes: UnitType[];
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBuildingId?: string;
}

export function UnitModal({
  buildings,
  unitTypes,
  unit,
  isOpen,
  onClose,
  onSuccess,
  defaultBuildingId,
}: UnitModalProps) {
  const [formData, setFormData] = useState({
    buildingId:
      unit?.building_id || defaultBuildingId || buildings[0]?.id || "",
    unitTypeId: unit?.unit_type_id || "",
    unitNumber: unit?.unit_number || "",
    floor: unit?.floor ?? "",
    monthlyRent: unit?.monthly_rent ?? "",
    depositAmount: unit?.deposit_amount ?? 0,
    status: unit?.status || "VACANT",
    description: unit?.description || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        buildingId: unit.building_id,
        unitTypeId: unit.unit_type_id || "",
        unitNumber: unit.unit_number || "",
        floor: unit.floor ?? "",
        monthlyRent: unit.monthly_rent ?? "",
        depositAmount: unit.deposit_amount ?? 0,
        status: unit.status || "VACANT",
        description: unit.description || "",
      });
    } else {
      setFormData({
        buildingId: defaultBuildingId || buildings[0]?.id || "",
        unitTypeId: "",
        unitNumber: "",
        floor: "",
        monthlyRent: "",
        depositAmount: 0,
        status: "VACANT",
        description: "",
      });
    }
    setErrors({});
    setServerError(null);
  }, [unit, isOpen, defaultBuildingId, buildings]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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

    const validation = unitFormSchema.safeParse(formData);

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
      const { buildingId, ...unitData } = validation.data;

      // Clean payload according to unitCreateSchema
      const payload = {
        unitNumber: unitData.unitNumber,
        monthlyRent: unitData.monthlyRent,
        depositAmount: unitData.depositAmount,
        status: unitData.status,
        ...(unitData.unitTypeId && { unitTypeId: unitData.unitTypeId }),
        ...(unitData.floor !== undefined && { floor: unitData.floor }),
        ...(unitData.description && { description: unitData.description }),
      };

      if (unit) {
        // Edit existing unit
        await apiFetch(`/units/${unit.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // Create unit under selected building
        await apiFetch(`/units/building/${buildingId}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save unit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {unit ? "Edit Unit" : "Add New Unit"}
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
            {/* Building Selection */}
            <div className="sm:col-span-2">
              <label
                htmlFor="buildingId"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Building <span className="text-rose-500">*</span>
              </label>
              <select
                id="buildingId"
                name="buildingId"
                disabled={!!unit}
                value={formData.buildingId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  errors.buildingId ? "border-rose-300" : "border-slate-300"
                }`}
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              {errors.buildingId && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.buildingId}
                </p>
              )}
            </div>

            {/* Unit Number */}
            <div>
              <label
                htmlFor="unitNumber"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Unit Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="unitNumber"
                name="unitNumber"
                type="text"
                placeholder="e.g. A-101"
                value={formData.unitNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  errors.unitNumber ? "border-rose-300" : "border-slate-300"
                }`}
              />
              {errors.unitNumber && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.unitNumber}
                </p>
              )}
            </div>

            {/* Unit Type */}
            <div>
              <label
                htmlFor="unitTypeId"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Unit Type
              </label>
              <select
                id="unitTypeId"
                name="unitTypeId"
                value={formData.unitTypeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Select Type</option>
                {unitTypes.map((ut) => (
                  <option key={ut.id} value={ut.id}>
                    {ut.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div>
              <label
                htmlFor="floor"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Floor Number
              </label>
              <input
                id="floor"
                name="floor"
                type="number"
                placeholder="e.g. 1"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="VACANT">VACANT</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="RESERVED">RESERVED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* Monthly Rent */}
            <div>
              <label
                htmlFor="monthlyRent"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Monthly Rent <span className="text-rose-500">*</span>
              </label>
              <input
                id="monthlyRent"
                name="monthlyRent"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.monthlyRent}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  errors.monthlyRent ? "border-rose-300" : "border-slate-300"
                }`}
              />
              {errors.monthlyRent && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.monthlyRent}
                </p>
              )}
            </div>

            {/* Deposit Amount */}
            <div>
              <label
                htmlFor="depositAmount"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Deposit Amount
              </label>
              <input
                id="depositAmount"
                name="depositAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.depositAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Optional notes or details..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
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
              {loading ? "Saving..." : unit ? "Update Unit" : "Create Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
