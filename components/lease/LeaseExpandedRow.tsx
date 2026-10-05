"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarPlus,
  CircleStop,
  ExternalLink,
  FileCheck,
  FileX,
  LoaderCircle,
  Printer,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { StatusBadge } from "@/components/ui/badge";
import { Lease } from "@/types/lease";
import { LeaseTerminationModal } from "@/components/lease/LeaseTerminationModal";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface LeaseExpandedRowProps {
  lease: Lease;
  onCreateInvoice: (lease: Lease) => void;
  onSuccess: () => Promise<void>;
}

export function LeaseExpandedRow({
  lease,
  onCreateInvoice,
  onSuccess,
}: LeaseExpandedRowProps) {
  const [isExtending, setIsExtending] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [extendSuccess, setExtendSuccess] = useState(false);
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCancelInvoiceModalOpen, setIsCancelInvoiceModalOpen] =
    useState(false);
  const [isCancellingInvoice, setIsCancellingInvoice] = useState(false);
  const [cancelInvoiceError, setCancelInvoiceError] = useState<string | null>(
    null,
  );

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);

  const extraCharges = (lease.rentpluscharges || 0) - (lease.monthly_rent || 0);
  const includesDeposit = Boolean(lease.include_deposit_in_first_invoice);
  const depositAmount = Number(lease.deposit_amount) || 0;
  const totalRentAndCharges = Number(lease.rentpluscharges) || 0;

  const totalInitialPayable = includesDeposit
    ? totalRentAndCharges + depositAmount
    : totalRentAndCharges;

  const handleExtend = async () => {
    setIsExtending(true);
    setExtendError(null);
    setExtendSuccess(false);

    try {
      await apiFetch(`/leases/${lease.id}/extendleasemonthnew`, {
        method: "POST",
        body: JSON.stringify({ id: lease.id }),
      });
      await onSuccess();
      setExtendSuccess(true);
    } catch (err) {
      setExtendError(
        err instanceof Error ? err.message : "Failed to extend lease.",
      );
    } finally {
      setIsExtending(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await apiFetch(`/leases/${lease.id}/delete`, { method: "DELETE" });
      setIsDeleteModalOpen(false);
      await onSuccess();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete lease.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!lease.lease_invoice_id) return;

    setIsCancellingInvoice(true);
    setCancelInvoiceError(null);
    try {
      await apiFetch(`/invoices/${lease.lease_invoice_id}/cancel`, {
        method: "POST",
        body: JSON.stringify({
          id: lease.lease_invoice_id,
          lease_id: lease.id,
        }),
      });
      setIsCancelInvoiceModalOpen(false);
      await onSuccess();
    } catch (err) {
      setCancelInvoiceError(
        err instanceof Error ? err.message : "Failed to cancel invoice.",
      );
      setIsCancelInvoiceModalOpen(false);
    } finally {
      setIsCancellingInvoice(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 text-xs text-slate-700 space-y-4 bg-slate-50/90 border-l-4 border-blue-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Extra Charges */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Extra Charges
          </span>
          <span className="text-sm font-bold text-slate-800 block">
            {formatCurrency(extraCharges)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Rent + Extra: {formatCurrency(totalRentAndCharges)}
          </span>
        </div>

        {/* Total Initial Payable */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Payable
          </span>
          <span className="text-sm font-bold text-slate-900 block">
            {formatCurrency(totalInitialPayable)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {includesDeposit
              ? `Includes Deposit (${formatCurrency(depositAmount)})`
              : `Excludes Deposit (${formatCurrency(depositAmount)})`}
          </span>
        </div>

        {/* Billing Terms */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Billing Terms
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Day {lease.billing_day || "1"} of month</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Deposit in First Invoice:{" "}
            <strong className="text-slate-700">
              {includesDeposit ? "Yes" : "No"}
            </strong>
          </span>
        </div>

        {/* Invoice Reference */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Invoice Reference
            </span>
            {lease.lease_invoice_id ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invoiced</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">Not invoiced yet</span>
            )}
          </div>

          {lease.lease_invoice_id && (
            <Link
              href={`/billing/${lease.lease_invoice_id}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Linked Invoice
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Property
          </span>
          <span className="font-semibold text-slate-800 block">
            {lease.property_name || "—"}
          </span>
          {lease.property_code && (
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Code: {lease.property_code}
            </span>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Building
          </span>
          <span className="font-semibold text-slate-800 block">
            {lease.building_name || "—"}
          </span>
          {lease.building_code && (
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Code: {lease.building_code}
            </span>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Status
          </span>
          {lease.status === "TERMINATED" ? (
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
              Terminated
            </span>
          ) : (
            <StatusBadge status={lease.status} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/leases/${lease.id}/print`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Printer aria-hidden="true" className="h-3.5 w-3.5" />
          Print
        </Link>

        {lease.lease_invoice_id == null && lease.status !== "TERMINATED" && (
          <button
            type="button"
            onClick={() => onCreateInvoice(lease)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <FileCheck aria-hidden="true" className="h-3.5 w-3.5" />
            Invoice
          </button>
        )}

        {lease.status !== "TERMINATED" && (
          <button
            type="button"
            onClick={handleExtend}
            disabled={isExtending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
          >
            {isExtending ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin"
              />
            ) : (
              <CalendarPlus aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            {isExtending ? "Extending..." : "Extend to Next Month"}
          </button>
        )}

        {lease.lease_invoice_id != null ? (
          <button
            type="button"
            onClick={() => setIsCancelInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
          >
            <FileX aria-hidden="true" className="h-3.5 w-3.5" />
            Cancel Invoice
          </button>
        ) : lease.status !== "TERMINATED" && lease.status !== "CANCELLED" ? (
          <button
            type="button"
            onClick={() => setIsTerminationModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            <CircleStop aria-hidden="true" className="h-3.5 w-3.5" />
            Terminate
          </button>
        ) : null}

        {(lease.status === "TERMINATED" || lease.status === "CANCELLED") &&
          lease.lease_invoice_id == null && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>

      {deleteError && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {deleteError}
        </p>
      )}
      {cancelInvoiceError && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {cancelInvoiceError}
        </p>
      )}
      {extendError && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {extendError}
        </p>
      )}
      {extendSuccess && (
        <p role="status" className="text-xs font-medium text-emerald-700">
          Lease extended to next month.
        </p>
      )}

      {lease.notes && (
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Description / Terms Notes
          </span>
          <p className="text-slate-600 text-xs leading-relaxed">
            {lease.notes}
          </p>
        </div>
      )}

      {isTerminationModalOpen && (
        <LeaseTerminationModal
          lease={lease}
          onClose={() => setIsTerminationModalOpen(false)}
          onSuccess={onSuccess}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lease"
        entityName={lease.lease_number}
        description={`Are you sure you want to delete lease ${lease.lease_number}? This action cannot be undone.`}
        confirmLabel="Delete Lease"
        isLoading={isDeleting}
      />
      <DeleteConfirmModal
        isOpen={isCancelInvoiceModalOpen}
        onClose={() => setIsCancelInvoiceModalOpen(false)}
        onConfirm={handleCancelInvoice}
        title="Cancel Invoice?"
        entityName={lease.lease_invoice_id || undefined}
        description="Cancel this invoice before removing the lease."
        confirmLabel="Cancel Invoice"
        loadingLabel="Cancelling..."
        isLoading={isCancellingInvoice}
      />
    </div>
  );
}
