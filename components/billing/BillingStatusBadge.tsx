"use client";

import React from "react";
import { Invoice } from "@/types/invoice";

interface BillingStatusBadgeProps {
  status: Invoice["status"];
}

export function BillingStatusBadge({ status }: BillingStatusBadgeProps) {
  const styles: Record<Invoice["status"], string> = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-300",
    ISSUED: "bg-blue-50 text-blue-700 border-blue-200",
    PARTIALLY_PAID: "bg-amber-50 text-amber-700 border-amber-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
        styles[status] || styles.DRAFT
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
