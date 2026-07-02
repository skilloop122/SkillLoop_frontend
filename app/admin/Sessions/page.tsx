"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Laptop,
  Loader2,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";

export default function AdminSessionsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();

  useEffect(() => {
    if (hydrated && token) {
      fetchMetrics(token);
    }
  }, [hydrated, token, fetchMetrics]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const sessions = metrics?.sessions;
  const total = sessions ? sessions.scheduled + sessions.completed + sessions.canceled : 0;

  const completionRate = total > 0 && sessions
    ? ((sessions.completed / total) * 100).toFixed(0)
    : "0";

  const trendData = metrics?.trends?.sessionsCompleted
    ? Object.entries(metrics.trends.sessionsCompleted).map(([day, sessions]) => ({ day, sessions }))
    : [];

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sessions</h1>
              <p className="text-gray-500 text-sm mt-1">Track all skill-exchange sessions on the platform</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <Laptop size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metricsLoading ? "—" : metrics?.overview?.totalSessions ?? "—"} Total Sessions
              </span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Sessions",
                value: metrics?.overview?.totalSessions ?? 0,
                icon: CalendarCheck,
                color: "text-sky-500",
                bg: "bg-sky-50",
                border: "border-sky-200",
              },
              {
                label: "Scheduled",
                value: sessions?.scheduled ?? 0,
                icon: Clock,
                color: "text-amber-500",
                bg: "bg-amber-50",
                border: "border-amber-200",
              },
              {
                label: "Completed",
                value: sessions?.completed ?? 0,
                icon: CheckCircle,
                color: "text-green-500",
                bg: "bg-green-50",
                border: "border-green-200",
              },
              {
                label: "Canceled",
                value: sessions?.canceled ?? 0,
                icon: XCircle,
                color: "text-red-500",
                bg: "bg-red-50",
                border: "border-red-200",
              },
            ].map((card) => (
              <div key={card.label} className={`bg-white border ${card.border} rounded-2xl p-5 shadow-sm`}>
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon size={22} className={card.color} />
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {metricsLoading ? <span className="text-gray-200 animate-pulse">—</span> : card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">

            {/* Completion trend */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-sky-500" />
                  Sessions Trend
                </h2>
                <select className="border rounded-lg px-3 py-2 text-xs">
                  <option>Last 7 days</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                {metricsLoading || trendData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Activity className="w-10 h-10 animate-pulse" />
                  </div>
                ) : (
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#0ea5e9"
                      fill="#0ea5e920"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Session summary */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <BarChart3 size={20} className="text-sky-500" />
                Session Summary
              </h2>
              {metricsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                </div>
              ) : (
                <>
                  {/* Completion rate big display */}
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-green-600 font-bold text-lg">{completionRate}%</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Completion Rate</p>
                      <p className="text-xs text-green-600">{sessions?.completed ?? 0} of {total} sessions completed</p>
                    </div>
                  </div>

                  <div className="space-y-0 divide-y divide-gray-100">
                    {[
                      { label: "Scheduled Sessions", value: sessions?.scheduled ?? 0 },
                      { label: "Completed Sessions", value: sessions?.completed ?? 0 },
                      { label: "Canceled Sessions", value: sessions?.canceled ?? 0 },
                      { label: "Completion Rate", value: `${completionRate}%` },
                      { label: "Total Sessions", value: metrics?.overview?.totalSessions ?? 0 },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-600">{row.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status progress bars */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-lg mb-5">Session Status Breakdown</h2>
            {metricsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Scheduled", value: sessions?.scheduled ?? 0, color: "bg-amber-400", light: "bg-amber-50", text: "text-amber-700" },
                  { label: "Completed", value: sessions?.completed ?? 0, color: "bg-green-400", light: "bg-green-50", text: "text-green-700" },
                  { label: "Canceled", value: sessions?.canceled ?? 0, color: "bg-red-400", light: "bg-red-50", text: "text-red-700" },
                ].map((row) => {
                  const pct = total > 0 ? (row.value / total) * 100 : 0;
                  return (
                    <div key={row.label} className="flex items-center gap-4">
                      <span className="text-sm text-gray-700 w-24 shrink-0">{row.label}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.color} transition-all duration-700`}
                          style={{ width: `${Math.max(pct, total === 0 ? 0 : 0.5)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-16 text-right ${row.text}`}>
                        {row.value} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
