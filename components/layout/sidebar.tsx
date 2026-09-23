"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/api_client";

const navItems = [
  { name: "Overview", href: "/" },
  { name: "Properties", href: "/properties" },
  { name: "Tenants", href: "/tenants" },
  { name: "Leases", href: "/leases" },
  { name: "Billing & Invoices", href: "/billing" },
  { name: "Payments", href: "/payments" },
  { name: "Maintenance", href: "/maintenance" },
  { name: "Expenses", href: "/expenses" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-lg text-white tracking-wide">
        PropManager <span className="text-blue-500 ml-1">HQ</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action in Sidebar */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <button
          onClick={() => logoutUser(true)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          &rarr; Sign Out
        </button>
      </div>
    </aside>
  );
}
