"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  TrendingUp,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";

type StatusKey = "pending" | "accepted" | "rejected" | "canceled";

const STATUS_CONFIG: Record<StatusKey, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; iconColor: string; bg: string; border: string; badge: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    iconColor: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700 border-green-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    iconColor: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700 border-red-300",
  },
  canceled: {
    label: "Canceled",
    icon: AlertCircle,
    iconColor: "text-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600 border-gray-300",
  },
};

export default function AdminRequestsPage() {
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

  const requests = metrics?.requests;
  const total = requests
    ? Object.values(requests).reduce((a, b) => a + b, 0)
    : 0;

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
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Requests</h1>
              <p className="text-gray-500 text-sm mt-1">Monitor all skill-exchange and session requests</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <Mail size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metricsLoading ? "—" : metrics?.overview?.totalRequests ?? "—"} Total Requests
              </span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((key) => {
              const cfg = STATUS_CONFIG[key];
              const value = requests?.[key] ?? 0;
              const pct = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
              const Icon = cfg.icon;
              return (
                <div key={key} className={`bg-white border ${cfg.border} rounded-2xl p-5 shadow-sm`}>
                  <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center mb-3`}>
                    <Icon size={22} className={cfg.iconColor} />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{cfg.label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {metricsLoading ? <span className="text-gray-200 animate-pulse">—</span> : value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{pct}% of total</p>
                </div>
              );
            })}
          </div>

          {/* Visual breakdown */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Stacked bar */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-sky-500" />
                Request Breakdown
              </h2>
              {metricsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((key) => {
                    const cfg = STATUS_CONFIG[key];
                    const value = requests?.[key] ?? 0;
                    const pct = total > 0 ? (value / total) * 100 : 0;
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={15} className={cfg.iconColor} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
                            <span className="text-sm font-bold text-gray-800">{value}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${cfg.bg.replace("bg-", "bg-").replace("-50", "-400")}`}
                              style={{ width: `${Math.max(pct, 1)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary panel */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-sky-500" />
                Request Summary
              </h2>
              <div className="space-y-0 divide-y divide-gray-100">
                {[
                  { label: "Total Requests", value: metrics?.overview?.totalRequests ?? 0 },
                  { label: "Acceptance Rate", value: total > 0 ? `${(((requests?.accepted ?? 0) / total) * 100).toFixed(1)}%` : "—" },
                  { label: "Pending Rate", value: total > 0 ? `${(((requests?.pending ?? 0) / total) * 100).toFixed(1)}%` : "—" },
                  { label: "Rejection Rate", value: total > 0 ? `${(((requests?.rejected ?? 0) / total) * 100).toFixed(1)}%` : "—" },
                  { label: "Cancellation Rate", value: total > 0 ? `${(((requests?.canceled ?? 0) / total) * 100).toFixed(1)}%` : "—" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {metricsLoading ? "—" : row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status detail table */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-lg">Request Status Detail</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((key) => {
                    const cfg = STATUS_CONFIG[key];
                    const value = requests?.[key] ?? 0;
                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                    return (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {metricsLoading ? "—" : value}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{pct}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-5 py-3 text-sm">Total</td>
                    <td className="px-5 py-3 text-sm">{metricsLoading ? "—" : total}</td>
                    <td className="px-5 py-3 text-sm">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
