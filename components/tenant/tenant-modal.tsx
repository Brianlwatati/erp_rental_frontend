"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { Tenant } from "@/types/tenant";

const tenantFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email address",
    ),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "BLACKLISTED"])
    .optional()
    .default("ACTIVE"),
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

interface TenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TenantModal({
  tenant,
  isOpen,
  onClose,
  onSuccess,
}: TenantModalProps) {
  const [formData, setFormData] = useState({
    firstName: tenant?.first_name || "",
    lastName: tenant?.last_name || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    nationalId: tenant?.national_id || "",
    address: tenant?.address || "",
    emergencyContactName: tenant?.emergency_contact_name || "",
    emergencyContactPhone: tenant?.emergency_contact_phone || "",
    status: tenant?.status || "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData({
        firstName: tenant.first_name || "",
        lastName: tenant.last_name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        nationalId: tenant.national_id || "",
        address: tenant.address || "",
        emergencyContactName: tenant.emergency_contact_name || "",
        emergencyContactPhone: tenant.emergency_contact_phone || "",
        status: tenant.status || "ACTIVE",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationalId: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        status: "ACTIVE",
      });
    }
    setErrors({});
    setServerError(null);
  }, [tenant, isOpen]);

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

    const validation = tenantFormSchema.safeParse(formData);

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
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        ...(validation.data.email && { email: validation.data.email }),
        ...(validation.data.phone && { phone: validation.data.phone }),
        ...(validation.data.nationalId && {
          nationalId: validation.data.nationalId,
        }),
        ...(validation.data.address && { address: validation.data.address }),
        ...(validation.data.emergencyContactName && {
          emergencyContactName: validation.data.emergencyContactName,
        }),
        ...(validation.data.emergencyContactPhone && {
          emergencyContactPhone: validation.data.emergencyContactPhone,
        }),
        status: validation.data.status,
      };

      if (tenant) {
        await apiFetch(`/tenants/${tenant.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/tenants", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save tenant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {tenant ? "Edit Tenant" : "Add New Tenant"}
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
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  errors.firstName ? "border-rose-300" : "border-slate-300"
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  errors.lastName ? "border-rose-300" : "border-slate-300"
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  errors.email ? "border-rose-300" : "border-slate-300"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+254 700 000000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* National ID */}
            <div>
              <label
                htmlFor="nationalId"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                National ID / Passport No.
              </label>
              <input
                id="nationalId"
                name="nationalId"
                type="text"
                placeholder="12345678"
                value={formData.nationalId}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="BLACKLISTED">BLACKLISTED</option>
              </select>
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label
                htmlFor="emergencyContactName"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Emergency Contact Name
              </label>
              <input
                id="emergencyContactName"
                name="emergencyContactName"
                type="text"
                placeholder="Jane Doe"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label
                htmlFor="emergencyContactPhone"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Emergency Contact Phone
              </label>
              <input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                placeholder="+254 700 000000"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Postal Address / Location
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                placeholder="P.O. Box 1234, Nairobi..."
                value={formData.address}
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
              {loading
                ? "Saving..."
                : tenant
                  ? "Update Tenant"
                  : "Create Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
