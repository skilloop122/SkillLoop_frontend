"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Clock,
  XCircle,
  Mail,
  File,
  Search,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { FaUserCheck } from "react-icons/fa";

type StatusKey = "all" | "pending" | "approved" | "canceled";

interface RequestListing {
  id: string;
  requesterName: string;
  requesterEmail: string;
  skill: string;
  category: string;
  status: StatusKey;
  demand: "high" | "medium" | "low";
  date: string;
}

const STATUS_OPTIONS = ["all", "pending", "approved", "canceled"] as const;
const CATEGORY_OPTIONS = ["all", "Design", "Development", "Management"] as const;
const DEMAND_OPTIONS = ["all", "high", "medium", "low"] as const;

const DEMAND_COLORS: Record<string, string> = {
  high: "text-green-600 bg-green-50 border-green-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-red-600 bg-red-50 border-red-200",
};

const SAMPLE_REQUESTS: RequestListing[] = [
  { id: "1", requesterName: "Alice Doe", requesterEmail: "alice@example.com", skill: "React", category: "Development", status: "pending", demand: "high", date: "2026-07-01" },
  { id: "2", requesterName: "Charlie Brown", requesterEmail: "charlie@example.com", skill: "Python", category: "Development", status: "approved", demand: "medium", date: "2026-07-02" },
  { id: "3", requesterName: "Eve Smith", requesterEmail: "eve@example.com", skill: "Figma", category: "Design", status: "canceled", demand: "low", date: "2026-07-03" },
  { id: "4", requesterName: "Grace Lee", requesterEmail: "grace@example.com", skill: "Node.js", category: "Development", status: "canceled", demand: "high", date: "2026-07-04" },
  { id: "5", requesterName: "Ivan Ivanov", requesterEmail: "ivan@example.com", skill: "UI/UX", category: "Design", status: "pending", demand: "medium", date: "2026-07-05" },
  { id: "6", requesterName: "Kevin Hart", requesterEmail: "kevin@example.com", skill: "Agile", category: "Management", status: "approved", demand: "low", date: "2026-07-06" },
];

const STATUS_CONFIG: Record<StatusKey, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; iconColor: string; bg: string; border: string; badge: string }> = {
  all: {
    label: "Total Requests",
    icon: File,
    iconColor: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700 border-purple-300",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
  },
  approved: {
    label: "Matched",
    icon: FaUserCheck,
    iconColor: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700 border-green-300",
  },
  canceled: {
    label: "Canceled",
    icon: XCircle,
    iconColor: "text-red-400",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700 border-red-300",
  },
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [demandFilter, setDemandFilter] = useState<string>("all");
  const [requestsList] = useState<RequestListing[]>(SAMPLE_REQUESTS);

  const filtered = useMemo(() => {
    return requestsList.filter((req) => {
      const matchesSearch = req.requesterName.toLowerCase().includes(search.toLowerCase()) || 
                            req.requesterEmail.toLowerCase().includes(search.toLowerCase()) ||
                            req.skill.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || req.category === categoryFilter;
      const matchesDemand = demandFilter === "all" || req.demand === demandFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesDemand;
    });
  }, [requestsList, search, statusFilter, categoryFilter, demandFilter]);

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

          <AdminHeader
            title="Requests"
            subtitle="Monitor all skill-exchange and session requests"
          >
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <Mail size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metricsLoading ? "—" : metrics?.overview?.totalRequests ?? "—"} Total Requests
              </span>
            </div>
          </AdminHeader>

          {/* Status Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((key) => {
              const cfg = STATUS_CONFIG[key];
              let value = 0;
              if (key === "all") {
                value = total;
              } else if (key === "pending") {
                value = requests?.pending ?? 0;
              } else if (key === "approved") {
                value = requests?.accepted ?? 0;
              } else if (key === "canceled") {
                value = (requests?.canceled ?? 0) + (requests?.rejected ?? 0);
              }
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

          {/* Filters */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requester or skill…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={demandFilter}
                onChange={(e) => setDemandFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Demand</option>
                {DEMAND_OPTIONS.filter((d) => d !== "all").map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Requester</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Skill</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Category</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Status</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Demand</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Date</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <Mail size={40} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No requests match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((req) => {
                      const sc = STATUS_CONFIG[req.status];
                      const StatusIcon = sc.icon;
                      const dc = DEMAND_COLORS[req.demand];
                      return (
                        <tr key={req.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{req.requesterName}</span>
                              <span className="text-xs text-gray-500">{req.requesterEmail}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {req.skill}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-gray-800">{req.category}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${sc.badge}`}>
                              <StatusIcon size={14} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${dc}`}>
                              {req.demand.charAt(0).toUpperCase() + req.demand.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-gray-800">{req.date}</span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/requests/${req.id}`)}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t text-sm text-gray-500">
              Showing {filtered.length} of {requestsList.length} requests
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
