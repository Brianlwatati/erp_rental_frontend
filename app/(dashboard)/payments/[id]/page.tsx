"use client";

import React, { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hash,
  AlertCircle,
} from "lucide-react";

interface Allocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount: string;
  created_at: string;
}

interface PaymentDetails {
  id: string;
  company_id: string;
  tenant_id: string;
  payment_number: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  allocated_amount: string;
  unallocated_amount: string;
  allocations: Allocation[];
  receipt: string | null;
}

interface TenantDetails {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  national_id: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [tenant, setTenant] = useState<TenantDetails | null>(null);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(num || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setServerError(null);

      // 1. Fetch Payment details
      const paymentResponse = await apiFetch<PaymentDetails>(`/payments/${id}`);
      const paymentData = paymentResponse.data;
      setPayment(paymentData);

      // 2. Fetch Tenant details using tenant_id from payment response
      if (paymentData?.tenant_id) {
        try {
          const tenantResponse = await apiFetch<TenantDetails>(
            `/tenants/${paymentData.tenant_id}`,
          );
          setTenant(tenantResponse.data);
        } catch (err) {
          console.error("Failed to load tenant details:", err);
          // Keep tenant null if it fails so main page still renders
        }
      }
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Failed to load payment details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-2">
        <Clock className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-sm">Loading payment details...</p>
      </div>
    );
  }

  if (serverError || !payment) {
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{serverError || "Payment not found."}</span>
        </div>
        <div className="mt-4">
          <Link
            href="/payments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/payments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            payment.status === "POSTED"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {payment.status}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payment {payment.payment_number}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recorded on {formatDate(payment.created_at)}
          </p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs text-slate-400 block uppercase font-medium tracking-wider">
            Total Paid
          </span>
          <span className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(payment.amount)}
          </span>
        </div>
      </div>

      {/* Key Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Amount
          </span>
          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(payment.amount)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Allocated Amount
          </span>
          <span className="text-lg font-bold text-emerald-600">
            {formatCurrency(payment.allocated_amount)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Unallocated Balance
          </span>
          <span
            className={`text-lg font-bold ${
              parseFloat(payment.unallocated_amount) > 0
                ? "text-amber-600"
                : "text-slate-700"
            }`}
          >
            {formatCurrency(payment.unallocated_amount)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Metadata */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            Payment Information
          </h2>

          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-semibold text-slate-800">
                {payment.payment_method}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Payment Date</span>
              <span className="font-semibold text-slate-800">
                {formatDate(payment.payment_date)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Reference Number</span>
              <span className="font-semibold text-slate-800">
                {payment.reference_number || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Payment Number</span>
              <span className="font-semibold text-slate-800">
                {payment.payment_number}
              </span>
            </div>
          </div>

          {payment.notes && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 text-xs block mb-1">Notes</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {payment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Tenant / Payer Metadata */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-slate-500" />
            Payer Information
          </h2>

          {tenant ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <Link
                  href={`/tenants/${tenant.id}`}
                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  {tenant.first_name} {tenant.last_name}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-y-3">
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800">
                    {tenant.phone || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">National ID</span>
                  <span className="font-semibold text-slate-800">
                    {tenant.national_id || "N/A"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">
                    {tenant.email || "N/A"}
                  </span>
                </div>

                {tenant.address && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Address</span>
                    <span className="font-semibold text-slate-800">
                      {tenant.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-4">
              Tenant ID: {payment.tenant_id} (Details unavailable)
            </div>
          )}
        </div>
      </div>

      {/* Invoice Allocations Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Invoice Allocations ({payment.allocations?.length || 0})
          </h2>
        </div>

        {payment.allocations && payment.allocations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Date Allocated</th>
                  <th className="py-3 px-4 text-right">Amount Allocated</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payment.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[180px] sm:max-w-xs">
                          {alloc.invoice_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(alloc.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(alloc.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/billing/${alloc.invoice_id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Invoice
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No invoice allocations found for this payment.
          </div>
        )}
      </div>
    </div>
  );
}
