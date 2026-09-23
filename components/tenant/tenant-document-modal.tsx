"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api_client";
import { TenantDocument } from "@/types/tenant";

const tenantDocumentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentName: z.string().min(1, "Document name is required"),
  documentUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "Invalid URL format",
    ),
  expiresAt: z.string().optional(),
});

type TenantDocumentFormData = z.infer<typeof tenantDocumentSchema>;

interface TenantDocumentModalProps {
  tenantId: string;
  document: TenantDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TenantDocumentModal({
  tenantId,
  document,
  isOpen,
  onClose,
  onSuccess,
}: TenantDocumentModalProps) {
  const [formData, setFormData] = useState({
    documentType: document?.document_type || "",
    documentName: document?.document_name || "",
    documentUrl: document?.document_url || "",
    expiresAt: document?.expires_at ? document.expires_at.split("T")[0] : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      setFormData({
        documentType: document.document_type || "",
        documentName: document.document_name || "",
        documentUrl: document.document_url || "",
        expiresAt: document.expires_at ? document.expires_at.split("T")[0] : "",
      });
    } else {
      setFormData({
        documentType: "",
        documentName: "",
        documentUrl: "",
        expiresAt: "",
      });
    }
    setErrors({});
    setServerError(null);
  }, [document, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    const validation = tenantDocumentSchema.safeParse(formData);

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
        documentType: validation.data.documentType,
        documentName: validation.data.documentName,
        ...(validation.data.documentUrl && {
          documentUrl: validation.data.documentUrl,
        }),
        ...(validation.data.expiresAt && {
          expiresAt: validation.data.expiresAt,
        }),
      };

      if (document) {
        // Edit existing document endpoint
        await apiFetch(`/tenants/documents/${document.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // Create new document for specific tenant
        await apiFetch(`/tenants/${tenantId}/documents`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {document ? "Edit Document" : "Upload Tenant Document"}
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
          {/* Document Type */}
          <div>
            <label
              htmlFor="documentType"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Document Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white ${
                errors.documentType ? "border-rose-300" : "border-slate-300"
              }`}
            >
              <option value="">Select Type</option>
              <option value="NATIONAL_ID">National ID / Passport</option>
              <option value="LEASE_AGREEMENT">Lease Agreement</option>
              <option value="EMPLOYMENT_PROOF">
                Proof of Employment / Income
              </option>
              <option value="TAX_PIN">KRA / Tax Certificate</option>
              <option value="OTHER">Other Document</option>
            </select>
            {errors.documentType && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.documentType}
              </p>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label
              htmlFor="documentName"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Document Name / Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="documentName"
              name="documentName"
              type="text"
              placeholder="e.g. John_Doe_National_ID.pdf"
              value={formData.documentName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.documentName ? "border-rose-300" : "border-slate-300"
              }`}
            />
            {errors.documentName && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.documentName}
              </p>
            )}
          </div>

          {/* Document URL */}
          <div>
            <label
              htmlFor="documentUrl"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Document File URL
            </label>
            <input
              id="documentUrl"
              name="documentUrl"
              type="text"
              placeholder="https://storage.example.com/docs/file.pdf"
              value={formData.documentUrl}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                errors.documentUrl ? "border-rose-300" : "border-slate-300"
              }`}
            />
            {errors.documentUrl && (
              <p className="mt-1 text-xs text-rose-600">{errors.documentUrl}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div>
            <label
              htmlFor="expiresAt"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Expiration Date
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
                : document
                  ? "Update Document"
                  : "Add Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
