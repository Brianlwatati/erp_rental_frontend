"use client";

import React from "react";
import { ExpenseTab } from "@/components/expense/ExpenseTabs";

interface EmptyExpenseStateProps {
  activeTab: ExpenseTab;
  onCreateNew: () => void;
  searchTerm?: string;
  onClearSearch?: () => void;
}

export function EmptyExpenseState({
  activeTab,
  onCreateNew,
  searchTerm,
  onClearSearch,
}: EmptyExpenseStateProps) {
  const hasActiveSearch = Boolean(searchTerm && searchTerm.trim() !== "");

  // Render search fallback when user query returns 0 results
  if (hasActiveSearch) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-semibold text-slate-800">
            No matching {activeTab} found
          </h3>
          <p className="text-xs text-slate-500">
            No records matched{" "}
            <span className="font-semibold text-slate-700">"{searchTerm}"</span>
            . Try adjusting your search query or reset your search.
          </p>
        </div>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  // Tab-specific metadata configurations for empty database state
  const tabConfigs = {
    expenses: {
      title: "No Expenses Recorded Yet",
      description:
        "Track operational spending across properties, assign categories, tag contractors, and attach digital receipts for compliance.",
      actionLabel: "+ Record First Expense",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      workflowTitle: "Expense Tracking Workflow:",
      steps: [
        {
          title: "01. Category Selection",
          desc: "Select or add an accounting category (e.g., Repairs, Utilities).",
        },
        {
          title: "02. Vendor & Property Link",
          desc: "Associate expenses with specific properties and service contractors.",
        },
        {
          title: "03. Audit & Verification",
          desc: "Attach receipt attachments and log payments for financial reports.",
        },
      ],
    },
    categories: {
      title: "No Expense Categories Created",
      description:
        "Organize expenditure types to structure property financial reports, tax write-offs, and general ledger tracking.",
      actionLabel: "+ Add First Category",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M7 7h.01M7 11h.01M7 15h.01M11 7h8M11 11h8M11 15h8M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
      workflowTitle: "Category Setup Steps:",
      steps: [
        {
          title: "01. Chart of Accounts",
          desc: "Define category names matching standard accounting codes.",
        },
        {
          title: "02. Tax Categorization",
          desc: "Tag tax-deductible categories for automated end-of-year exports.",
        },
        {
          title: "03. Expense Allocation",
          desc: "Map incoming receipts directly to these established categories.",
        },
      ],
    },
    vendors: {
      title: "No Vendors Registered Yet",
      description:
        "Maintain a directory of preferred maintenance contractors, utility suppliers, legal advisors, and service agencies.",
      actionLabel: "+ Add First Vendor",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V5"
          />
        </svg>
      ),
      workflowTitle: "Vendor Onboarding Steps:",
      steps: [
        {
          title: "01. Directory Registration",
          desc: "Add business names, primary contact people, emails, and phone numbers.",
        },
        {
          title: "02. Service Categorization",
          desc: "Tag specialty domains like Plumbing, Electrical, or Legal.",
        },
        {
          title: "03. Expense Linking",
          desc: "Assign vendor profiles when recording work orders or invoices.",
        },
      ],
    },
  };

  const config = tabConfigs[activeTab];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm space-y-8">
      {/* Visual Icon Badge */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
          {config.icon}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
          +
        </div>
      </div>

      {/* Main Copy */}
      <div className="max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {config.title}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Primary Action Button */}
      <div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/10 hover:shadow-lg"
        >
          {config.actionLabel}
        </button>
      </div>

      {/* Workflow Steps Guidance */}
      <div className="pt-8 border-t border-slate-100 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          {config.workflowTitle}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {config.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100"
            >
              <span className="text-xs font-bold text-blue-600 mb-1 block">
                {step.title}
              </span>
              <p className="text-[11px] text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
