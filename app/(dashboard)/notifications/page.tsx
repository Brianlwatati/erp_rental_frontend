"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api_client";
import { Notification } from "@/types/notification";

type NotificationFilter = "ALL" | "UNREAD" | "READ";

const notificationTypeLabels: Record<string, string> = {
  LEASE_EXPIRED: "Lease expired",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Notification[]>("/notifications")
      .then((response) => setNotifications(response.data || []))
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setError("Notifications could not be loaded. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "UNREAD") return !notification.is_read;
    if (filter === "READ") return notification.is_read;
    return true;
  });

  const filters: { label: string; value: NotificationFilter; count: number }[] =
    [
      { label: "All", value: "ALL", count: notifications.length },
      { label: "Unread", value: "UNREAD", count: unreadCount },
      {
        label: "Read",
        value: "READ",
        count: notifications.length - unreadCount,
      },
    ];

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Activity Center
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Updates about leases and property operations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Bell aria-hidden="true" className="h-4 w-4 text-teal-700" />
          {unreadCount} unread
        </div>
      </header>

      <div
        aria-label="Filter notifications"
        className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
      >
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              filter === option.value
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {option.label}{" "}
            <span className="ml-1 opacity-75">{option.count}</span>
          </button>
        ))}
      </div>

      <section
        aria-label="Notification list"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
      >
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-sm text-rose-700">
            {error}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell
              aria-hidden="true"
              className="mx-auto h-7 w-7 text-slate-300"
            />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {filter === "ALL"
                ? "No notifications yet"
                : `No ${filter.toLowerCase()} notifications`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              New lease and property updates will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {filteredNotifications.map((notification) => {
              const typeLabel =
                notificationTypeLabels[notification.notification_type] ||
                notification.notification_type.replaceAll("_", " ");
              const isLeaseExpired =
                notification.notification_type === "LEASE_EXPIRED";
              const payload = notification.payload;

              return (
                <li key={notification.id}>
                  <article
                    className={`flex gap-3 p-4 sm:gap-4 sm:p-5 ${
                      notification.is_read ? "bg-white" : "bg-teal-50/40"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isLeaseExpired
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isLeaseExpired ? (
                        <CalendarDays aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        <Bell aria-hidden="true" className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">
                          {notification.title}
                        </h2>
                        <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {typeLabel}
                        </span>
                        {!notification.is_read && (
                          <span
                            className="h-2 w-2 rounded-full bg-teal-600"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {notification.message}
                      </p>

                      {(payload?.leaseNumber ||
                        payload?.unitNumber ||
                        payload?.endDate) && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                          {payload.leaseNumber && (
                            <span>
                              Lease{" "}
                              <span className="font-mono font-semibold text-slate-700">
                                {payload.leaseNumber}
                              </span>
                            </span>
                          )}
                          {payload.unitNumber && (
                            <span>
                              Unit{" "}
                              <span className="font-semibold text-slate-700">
                                {payload.unitNumber}
                              </span>
                            </span>
                          )}
                          {payload.endDate && (
                            <span>
                              Expired{" "}
                              <span className="font-medium text-slate-700">
                                {new Date(payload.endDate).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <time
                          dateTime={notification.created_at}
                          className="text-[11px] text-slate-400"
                        >
                          {new Date(notification.created_at).toLocaleString()}
                        </time>
                        {notification.entity_type === "LEASE" &&
                          notification.entity_id && (
                            <Link
                              href={`/leases/${notification.entity_id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                            >
                              View lease
                              <ChevronRight
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                              />
                            </Link>
                          )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
