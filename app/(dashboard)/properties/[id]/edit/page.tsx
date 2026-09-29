"use client";

import React, { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { Property } from "@/types/property";

const propertyEditSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  code: z.string().min(1, "Property code is required"),
  propertyType: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

type PropertyFormData = z.infer<typeof propertyEditSchema>;

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    code: "",
    propertyType: "",
    address: "",
    city: "",
    county: "",
    description: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch<Property>(`/properties/${id}`);
      const property = response.data;

      setFormData({
        name: property.name || "",
        code: property.code || "",
        propertyType: property.property_type || "",
        address: property.address || "",
        city: property.city || "",
        county: property.county || "",
        description: property.description || "",
        status: property.status || "ACTIVE",
      });
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Failed to load property details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

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
    setSaving(true);
    setServerError(null);

    const validationResult = propertyEditSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setSaving(false);
      return;
    }

    try {
      const payload = Object.fromEntries(
        Object.entries(validationResult.data).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined,
        ),
      ) as Record<string, string | undefined>;

      const normalizedPayload: Record<string, string | undefined> = {
        ...payload,
      };

      if (normalizedPayload.propertyType) {
        normalizedPayload.property_type = normalizedPayload.propertyType;
        delete normalizedPayload.propertyType;
      } else {
        delete normalizedPayload.propertyType;
      }

      await apiFetch(`/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(normalizedPayload),
      });

      router.push(`/properties/${id}`);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Failed to update property. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading property details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Property
          </h1>
          <p className="text-sm text-slate-500">
            Update the details of your property below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/properties/${id}`)}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          &larr; Back
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
        {serverError && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Property Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Parkview Apartments"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-700"
              >
                Property Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="e.g. PVA-001"
                value={formData.code}
                onChange={handleChange}
                className={`mt-1 w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 ${
                  errors.code
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="propertyType"
                className="block text-sm font-medium text-slate-700"
              >
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Property Type</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="MIXED_USE">Mixed Use</option>
                <option value="INDUSTRIAL">Industrial</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || "ACTIVE"}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Nairobi"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="county"
                className="block text-sm font-medium text-slate-700"
              >
                County / State
              </label>
              <input
                id="county"
                name="county"
                type="text"
                placeholder="e.g. Nairobi County"
                value={formData.county}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-700"
              >
                Street Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="e.g. 123 Lenana Road, Kilimani"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Optional notes or details about the property..."
                value={formData.description}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push(`/properties/${id}`)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
