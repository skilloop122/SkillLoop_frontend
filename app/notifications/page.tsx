"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  Trash2,
  CalendarDays,
  Folder,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SideNav } from "../../components/SideNav";
import { BottomNav } from "../../components/BottomNav";
import { useAuthStore } from "../../lib/authStore";
import { useNotificationStore } from "../../lib/notificationStore";
import type { AppNotification } from "../../lib/notificationStore";

const PAGE_SIZE = 10;

function timeAgo(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function notificationIcon(type?: string, title?: string) {
  const t = (type ?? "").toUpperCase();
  const text = (title ?? "").toUpperCase();
  if (t.includes("PROJECT") || text.includes("PROJECT")) return Folder;
  if (t.includes("SESSION") || t.includes("REQUEST") || text.includes("SESSION"))
    return CalendarDays;
  if (t.includes("MESSAGE") || t.includes("CHAT")) return MessageSquare;
  return Bell;
}

function iconClassName(unread?: boolean) {
  return unread
    ? "bg-sky-50 text-sky-500 border border-sky-100"
    : "bg-slate-50 text-slate-400 border border-slate-100";
}

function NotificationsPage() {
  const router = useRouter();
  const { hydrated, token } = useAuthStore();
  const {
    notifications,
    unreadCount,
    pagination,
    unreadOnly,
    loading,
    error,
    fetchNotifications,
    // markRead,
    markAllRead,
    deleteNotification,
  } = useNotificationStore();

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  useEffect(() => {
    if (hydrated && !token) router.push("/signin");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated || !token) return;
    fetchNotifications({ page: currentPage, limit: PAGE_SIZE, unreadOnly });
  }, [hydrated, token, currentPage, unreadOnly, fetchNotifications]);

  const handleToggleUnread = () => {
    fetchNotifications({
      page: 1,
      limit: PAGE_SIZE,
      unreadOnly: !unreadOnly,
    });
  };

  // const handleOpen = async (n: AppNotification) => {
  //   if (!n.isRead) await markRead(n.id);
  //   if (n.link) router.push(n.link);
  // };

  const handleDelete = async (n: AppNotification) => {
    const success = await deleteNotification(n.id);
    if (!success) return;
    if (notifications.length === 1 && currentPage > 1) {
      fetchNotifications({
        page: currentPage - 1,
        limit: PAGE_SIZE,
        unreadOnly,
      });
    }
  };

  const handlePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchNotifications({ page, limit: PAGE_SIZE, unreadOnly });
  };

  return (
    <div className="min-h-screen bg-white font-sans flex text-gray-900">
      <SideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back
          </button>

          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-500 px-2 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here{`'`}s what{`'`}s happening with your sessions and projects.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="mb-5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleUnread}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                unreadOnly
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              <BellOff className="h-3.5 w-3.5" />
              Unread only
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 mb-4">
              {error}
            </div>
          )}

          {loading && notifications.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 shadow-sm">
              <Bell className="mx-auto mb-3 opacity-40" size={40} />
              <p className="text-sm">
                {unreadOnly ? "No unread notifications." : "No notifications yet."}
              </p>
              <p className="text-xs mt-1">
                Updates about your requested and received sessions will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {notifications.map((n) => {
                  const unread = !n.isRead;
                  const Icon = notificationIcon(n.type, n.title);
                  return (
                    <div
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      // onClick={() => handleOpen(n)}
                      // onKeyDown={(e) => {
                      //   if (e.key === "Enter" || e.key === " ") handleOpen(n);
                      // }}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left cursor-pointer transition-colors ${
                        unread
                          ? "bg-sky-50/60 border-sky-100 hover:bg-sky-50"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName(
                          unread,
                        )}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              unread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                            }`}
                          >
                            {n.title || "Notification"}
                          </p>
                          {(n.type || n.createdAt) && (
                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                              {timeAgo(n.createdAt)}
                            </span>
                          )}
                        </div>
                        {n.message && (
                          <p
                            className={`text-sm mt-0.5 ${
                              unread ? "text-gray-700" : "text-gray-500"
                            }`}
                          >
                            {n.message}
                          </p>
                        )}
                        {n.type && (
                          <span className="inline-block mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            {n.type}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        aria-label="Delete notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n);
                        }}
                        className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-100 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => handlePage(currentPage - 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePage(currentPage + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function NotificationsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <NotificationsPage />
    </Suspense>
  );
}