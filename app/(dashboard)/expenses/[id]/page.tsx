"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  Printer,
  Store,
} from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Expense } from "@/types/expense";

const statusStyles: Record<Expense["status"], string> = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  POSTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function ExpenseDetailsPage() {
  const params = useParams();
  const expenseId = params.id as string;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    apiFetch<Expense>(`/expenses/${expenseId}`)
      .then((response) => {
        if (isCurrent) setExpense(response.data);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setError(
          err instanceof Error ? err.message : "Failed to load expense.",
        );
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [expenseId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatDate = (date?: string) => {
    if (!date) return "Not provided";
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? "Not provided"
      : parsedDate.toLocaleDateString("en-KE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading expense details...
      </div>
    );
  }

  if (error || !expense) {
    return (
      <main className="mx-auto max-w-4xl space-y-4">
        <Link
          href="/expenses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to expenses
        </Link>
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error || "Expense not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <style jsx global>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-section,
            #printable-section * {
              visibility: visible;
            }
            #printable-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
      <div id="printable-section">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 ">
            <Link
              href="/expenses"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 print:hidden"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              All expenses
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {expense.expense_number || "Expense details"}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[expense.status]}`}
              >
                {expense.status}
              </span>
            </div>
            <p className="max-w-2xl text-sm text-slate-600">
              {expense.description || "No description provided."}
            </p>
          </div>
          <p className="shrink-0 text-2xl font-bold text-slate-900">
            {formatCurrency(expense.amount)}
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 print:hidden"
          >
            <Printer aria-hidden="true" className="h-4 w-4" />
            Print expense
          </button>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <CalendarDays
                aria-hidden="true"
                className="h-4 w-4 text-teal-700"
              />
              <h2 className="text-sm font-semibold text-slate-900">
                Expense details
              </h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Expense date</dt>
                <dd className="text-right font-medium text-slate-900">
                  {formatDate(expense.expense_date)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Reference number</dt>
                <dd className="text-right font-mono text-slate-900">
                  {expense.reference_number || "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Category</dt>
                <dd className="text-right font-medium text-slate-900">
                  {expense.expense_category_name || "Not assigned"}
                  {expense.expense_category_code && (
                    <span className="ml-2 font-mono text-xs text-slate-500">
                      {expense.expense_category_code}
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Recorded</dt>
                <dd className="text-right font-medium text-slate-900">
                  {formatDate(expense.created_at)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Store aria-hidden="true" className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-semibold text-slate-900">Vendor</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Name</dt>
                <dd className="text-right font-medium text-slate-900">
                  {expense.vendor_name || "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Contact person</dt>
                <dd className="text-right font-medium text-slate-900">
                  {expense.vendor_contact_person || "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-right font-medium text-slate-900">
                  {expense.vendor_phone || "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="break-all text-right font-medium text-slate-900">
                  {expense.vendor_email || "Not provided"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 aria-hidden="true" className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-semibold text-slate-900">
                Allocation
              </h2>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Property</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {expense.property_name || "General expense"}
                  {expense.property_code ? ` (${expense.property_code})` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Building</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {expense.building_name || "Not assigned"}
                  {expense.building_code ? ` (${expense.building_code})` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Unit</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {expense.unit_number || "Not assigned"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <CreditCard
                aria-hidden="true"
                className="h-4 w-4 text-teal-700"
              />
              <h2 className="text-sm font-semibold text-slate-900">
                Payment information
              </h2>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Method</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {expense.payment_method || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Reference</dt>
                <dd className="mt-1 font-mono font-medium text-slate-900">
                  {expense.reference_number || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Amount</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
