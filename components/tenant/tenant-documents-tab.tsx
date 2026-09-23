"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api_client";
import { TenantDocument } from "@/types/tenant";
import { DataTable, Column } from "@/components/ui/data-table";
import { TenantDocumentModal } from "./tenant-document-modal";

export function TenantDocumentsTab({ tenantId }: { tenantId: string }) {
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] =
    useState<TenantDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<TenantDocument[]>(
        `/tenants/${tenantId}/documents`,
      );
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load tenant documents:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleNew = () => {
    setSelectedDocument(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doc: TenantDocument) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await apiFetch(`/tenants/documents/${docId}`, { method: "DELETE" });
      fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const columns: Column<TenantDocument>[] = [
    {
      header: "Document Name",
      accessor: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">
            {row.document_name}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            ID: {row.id.slice(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row) => (
        <span className="font-medium text-xs text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded">
          {row.document_type.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Expires At",
      accessor: (row) => {
        if (!row.expires_at) return <span className="text-slate-400">—</span>;

        const isExpired = new Date(row.expires_at) < new Date();
        return (
          <span
            className={`text-xs font-medium ${isExpired ? "text-rose-600 font-bold" : "text-slate-700"}`}
          >
            {new Date(row.expires_at).toLocaleDateString()}
            {isExpired && " (Expired)"}
          </span>
        );
      },
    },
    {
      header: "Created Date",
      accessor: (row) => (
        <span className="text-slate-500 text-xs">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          {row.document_url && (
            <a
              href={row.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View
            </a>
          )}
          <button
            onClick={() => handleEdit(row)}
            className="text-xs font-semibold text-slate-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Tenant Documents</h3>
          <p className="text-xs text-slate-500">
            Store identity documentation, contracts, and legal records for this
            tenant.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-3.5 py-2 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          + Add Document
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading documents...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={documents}
          emptyMessage="No documents uploaded for this tenant yet."
        />
      )}

      {isModalOpen && (
        <TenantDocumentModal
          tenantId={tenantId}
          document={selectedDocument}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDocuments}
        />
      )}
    </div>
  );
}
