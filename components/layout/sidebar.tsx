"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Receipt,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { logoutUser } from "@/lib/api_client";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Tenants", href: "/tenants", icon: Users },
  { name: "Leases", href: "/leases", icon: ClipboardList },
  { name: "Billing & Invoices", href: "/billing", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Expenses", href: "/expenses", icon: Receipt },
];

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const handleNavigation = () => onClose();

  console.log(collapsed);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,18rem)] flex-col border-r border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition-[width,transform] duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5 sm:px-6">
          <Link
            href="/dashboard"
            onClick={handleNavigation}
            className={`font-bold text-lg tracking-wide text-white ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Rental <span className="text-blue-500">ERP</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:block"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 lg:text-center">
            Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                    collapsed ? "lg:justify-center lg:px-0" : ""
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  <span className={collapsed ? "lg:hidden" : "truncate"}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-3 sm:p-4">
          <div
            className={`mb-2 hidden items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-400 sm:flex ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <UserRound className="h-4 w-4" />
            <span>Property workspace</span>
          </div>
          <button
            type="button"
            onClick={() => logoutUser(true)}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-950/40 hover:text-rose-300"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
