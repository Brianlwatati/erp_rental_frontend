import React from "react";

type BadgeStatus =
  | "ACTIVE"
  | "OCCUPIED"
  | "PAID"
  | "RESOLVED"
  | "PENDING"
  | "IN_PROGRESS"
  | "PARTIAL"
  | "VACANT"
  | "OVERDUE"
  | "EXPIRED"
  | "URGENT"
  | "HIGH"
  | "CLOSED"
  | "LOW"
  | "MEDIUM"
  | "MAINTENANCE"
  | "INACTIVE"
  | "RESERVED"
  | "BLACKLISTED"
  | "DRAFT"
  | "TERMINATED"
  | "OPEN";

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, label }) => {
  const getStyle = (s: BadgeStatus) => {
    switch (s) {
      case "ACTIVE":
      case "OCCUPIED":
      case "PAID":
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "PENDING":
      case "IN_PROGRESS":
      case "PARTIAL":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "VACANT":
      case "EXPIRED":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "OVERDUE":
      case "URGENT":
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "CLOSED":
      case "LOW":
      case "MEDIUM":
        return "bg-slate-50 text-slate-600 border-slate-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(
        status,
      )}`}
    >
      {label || status.replace("_", " ")}
    </span>
  );
};
