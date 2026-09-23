"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { Lease } from "@/types/lease";
import { Building, Unit } from "@/types/property";
import { Tenant } from "@/types/tenant";
import { LeaseFormFields } from "./LeeseFormFields";

const leaseFormSchema = z.object({
  unitId: z.string().min(1, "Unit selection is required"),
  tenantId: z.string().min(1, "Tenant selection is required"),
  leaseNumber: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  monthlyRent: z.coerce.number().min(0, "Rent must be positive"),
  depositAmount: z.coerce
    .number()
    .min(0, "Deposit must be positive")
    .default(0),
  billingDay: z.coerce.number().min(1).max(28).default(1),
  status: z
    .enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"])
    .default("ACTIVE"),
  notes: z.string().optional(),
});

interface LeaseModalProps {
  lease: Lease | null;
  buildings: Building[];
  tenants: Tenant[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeaseModal({
  buildings,
  lease,
  tenants,
  isOpen,
  onClose,
  onSuccess,
}: LeaseModalProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    unitId: "",
    tenantId: "",
    leaseNumber: "",
    startDate: "",
    endDate: "",
    monthlyRent: "" as number | string,
    depositAmount: 0,
    billingDay: 1,
    status: "ACTIVE",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync initial state whenever lease or open status changes
  useEffect(() => {
    if (isOpen) {
      if (lease) {
        setSelectedBuildingId(lease.unit?.building?.id || "");
        setFormData({
          unitId: lease.unit_id || "",
          tenantId: lease.tenant_id || "",
          leaseNumber: lease.lease_number || "",
          startDate: lease.start_date ? lease.start_date.split("T")[0] : "",
          endDate: lease.end_date ? lease.end_date.split("T")[0] : "",
          monthlyRent: lease.monthly_rent ?? "",
          depositAmount: lease.deposit_amount ?? 0,
          billingDay: lease.billing_day ?? 1,
          status: lease.status || "ACTIVE",
          notes: lease.notes || "",
        });
      } else {
        setSelectedBuildingId("");
        setUnits([]);
        setFormData({
          unitId: "",
          tenantId: "",
          leaseNumber: "",
          startDate: "",
          endDate: "",
          monthlyRent: "",
          depositAmount: 0,
          billingDay: 1,
          status: "ACTIVE",
          notes: "",
        });
      }
      setErrors({});
      setServerError(null);
    }
  }, [lease, isOpen]);

  // Fetch units whenever selectedBuildingId changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function fetchUnits() {
      if (!selectedBuildingId) {
        setUnits([]);
        return;
      }

      setUnitsLoading(true);
      try {
        const response = await apiFetch(
          `/units/building/${selectedBuildingId}`,
        );
        if (isMounted) {
          const data = response.data;
          setUnits(Array.isArray(data) ? (data as Unit[]) : []);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to fetch units for building:", err);
          setUnits([]);
        }
      } finally {
        if (isMounted) {
          setUnitsLoading(false);
        }
      }
    }

    fetchUnits();

    return () => {
      isMounted = false;
    };
  }, [selectedBuildingId, isOpen]);

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const buildingId = e.target.value;
    setSelectedBuildingId(buildingId);
    // Reset unit selection when changing building
    setFormData((prev) => ({
      ...prev,
      unitId: "",
      monthlyRent: "",
      depositAmount: 0,
    }));
  };

  const handleUnitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = e.target.value;
    const selectedUnit = units.find((u) => u.id === unitId);

    setFormData((prev) => ({
      ...prev,
      unitId,
      monthlyRent: selectedUnit?.monthly_rent ?? prev.monthlyRent,
      depositAmount: selectedUnit?.deposit_amount ?? prev.depositAmount,
    }));

    if (errors.unitId) {
      setErrors((prev) => ({ ...prev, unitId: "" }));
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

    const validation = leaseFormSchema.safeParse(formData);

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
        unitId: validation.data.unitId,
        tenantId: validation.data.tenantId,
        ...(validation.data.leaseNumber && {
          leaseNumber: validation.data.leaseNumber,
        }),
        startDate: validation.data.startDate,
        ...(validation.data.endDate && { endDate: validation.data.endDate }),
        monthlyRent: validation.data.monthlyRent,
        depositAmount: validation.data.depositAmount,
        billingDay: validation.data.billingDay,
        status: validation.data.status,
        ...(validation.data.notes && { notes: validation.data.notes }),
      };

      if (lease) {
        await apiFetch(`/leases/${lease.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/leases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save lease agreement.");
    } finally {
      setLoading(false);
    }
  };

  // Guard return placed after all hook declarations
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {lease ? "Edit Lease Agreement" : "Create New Lease"}
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
          <LeaseFormFields
            formData={formData}
            errors={errors}
            buildings={buildings}
            availableUnits={units}
            // unitsLoading={unitsLoading}
            tenants={tenants}
            selectedBuildingId={selectedBuildingId}
            onBuildingChange={handleBuildingChange}
            onUnitChange={handleUnitSelect}
            onChange={handleChange}
          />

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
              {loading ? "Saving..." : lease ? "Update Lease" : "Create Lease"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
