"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api_client";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
interface MaintenanceTicket {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_at: string;
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MaintenanceTicket[]>("/maintenance")
      .then((res) => setTickets(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<MaintenanceTicket>[] = [
    {
      header: "Ticket Title",
      accessor: (row) => (
        <span className="font-semibold text-slate-900">{row.title}</span>
      ),
    },
    {
      header: "Priority",
      accessor: (row) => <StatusBadge status={row.priority} />,
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Created Date",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Maintenance & Work Orders
          </h1>
          <p className="text-sm text-slate-500">
            Track and respond to unit maintenance requests.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
          + Create Work Order
        </button>
      </div>

      <DataTable columns={columns} data={tickets} loading={loading} />
    </div>
  );
}
