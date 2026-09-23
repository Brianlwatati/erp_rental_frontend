"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/api_client";
import { User } from "@/types/api";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser(true);
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "AD";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-500">
          Organization:
        </span>
        <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {user?.company?.name || "Suluhi"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {initials}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800">
              {user ? `${user.firstName} ${user.lastName}` : "Admin User"}
            </p>
            <p className="text-slate-400">
              {user?.roleName || "Company Administrator"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
