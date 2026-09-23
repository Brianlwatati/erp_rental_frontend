"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";

// Property Schema Definition matching your backend model
const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  code: z.string().min(1, "Property code is required"),
  propertyType: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  description: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    code: "",
    propertyType: "",
    address: "",
    city: "",
    county: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error on edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    // Client-side schema validation
    const validationResult = propertySchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setLoading(false);
      return;
    }

    try {
      // Clean up optional empty strings to avoid sending blank strings
      const payload = Object.fromEntries(
        Object.entries(validationResult.data).filter(([_, v]) => v !== ""),
      );

      // Sends POST request to http://127.0.0.1:4000/api/v1/properties
      await apiFetch("/properties", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Redirect back to properties list
      router.push("/properties");
    } catch (err: any) {
      setServerError(
        err.message || "Failed to create property. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Add New Property
          </h1>
          <p className="text-sm text-slate-500">
            Register a new property building or complex to your organization.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
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
            {/* Property Name */}
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

            {/* Property Code */}
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

            {/* Property Type */}
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

            {/* City */}
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

            {/* County */}
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

            {/* Address */}
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

            {/* Description */}
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
              onClick={() => router.push("/properties")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
