"use client";

import { useEffect, useState } from "react";
import { apiFetch, getCurrentUser } from "@/lib/api_client";
import { User } from "@/types/api";

export default function DashboardOverviewPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());

    // Calls http://127.0.0.1:4000/api/v1/dashboard
    apiFetch<any>("/dashboard")
      .then((res) => setDashboardData(res.data))
      .catch((err) => console.error("Dashboard Error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {user ? `${user.firstName} ${user.lastName}` : "User"}
        </h1>
        <p className="text-sm text-slate-500">
          Organization:{" "}
          <span className="font-semibold text-slate-700">
            {user?.company?.name || "Suluhi"}
          </span>{" "}
          | Role: {user?.roleName || "Company Administrator"}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          Loading dashboard data...
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <pre className="text-xs bg-slate-50 p-4 rounded-lg overflow-x-auto text-slate-800">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
