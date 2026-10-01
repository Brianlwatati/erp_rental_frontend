"use client";

import { Bell, Menu, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, getCurrentUser, logoutUser } from "@/lib/api_client";
import { User } from "@/types/api";
import Link from "next/link";

type UnreadCountResponse =
  | number
  | { count?: number; unread_count?: number; unreadCount?: number };

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setUser(getCurrentUser());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    apiFetch<UnreadCountResponse>("/notifications/unread-count")
      .then(({ data }) => {
        const count =
          typeof data === "number"
            ? data
            : (data.count ?? data.unread_count ?? data.unreadCount ?? 0);
        setUnreadCount(Math.max(0, count));
      })
      .catch((err) => {
        console.error("Failed to fetch unread notification count:", err);
      });
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    logoutUser(true);
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
            Organization
          </p>
          <p className="truncate text-sm font-semibold text-slate-800">
            {user?.company?.name || "Suluhi"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          title="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell aria-hidden="true" className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 sm:border-r sm:border-slate-200 sm:pr-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-blue-50">
            {initials}
          </div>
          <div className="hidden min-w-0 text-xs sm:block">
            <p className="max-w-40 truncate font-semibold text-slate-800">
              {user ? `${user.firstName} ${user.lastName}` : "Admin User"}
            </p>
            <p className="max-w-40 truncate text-slate-400">
              {user?.roleName || "Company Administrator"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Log out"
          className="flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
