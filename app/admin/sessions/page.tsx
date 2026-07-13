"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Video,
  MessageSquare,
  Users,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

type SessionStatus = "upcoming" | "completed" | "cancelled";
type SessionType = "one-on-one" | "group" | "workshop";

interface SessionListing {
  id: string;
  session: string;
  skill: string;
  users: string;
  type: SessionType;
  status: SessionStatus;
  date: string;
}

const SAMPLE_SESSIONS: SessionListing[] = [
  { id: "S-001", session: "React Fundamentals Intro", skill: "React.js", users: "Sarah L. & Jamie T.", type: "one-on-one", status: "completed", date: "2026-06-15" },
  { id: "S-002", session: "Advanced TypeScript Patterns", skill: "TypeScript", users: "Mark R. & Anna K.", type: "one-on-one", status: "upcoming", date: "2026-07-20" },
  { id: "S-003", session: "UI/UX Design Workshop", skill: "UI/UX Design", users: "5 participants", type: "workshop", status: "upcoming", date: "2026-07-22" },
  { id: "S-004", session: "Python Data Science Bootcamp", skill: "Python", users: "8 participants", type: "group", status: "completed", date: "2026-06-28" },
  { id: "S-005", session: "Node.js API Building", skill: "Node.js", users: "Chris B. & Lisa M.", type: "one-on-one", status: "cancelled", date: "2026-07-01" },
  { id: "S-006", session: "Figma Prototyping Session", skill: "Figma", users: "David O. & Emma P.", type: "one-on-one", status: "completed", date: "2026-07-05" },
  { id: "S-007", session: "DevOps & CI/CD Overview", skill: "DevOps", users: "6 participants", type: "group", status: "upcoming", date: "2026-07-25" },
  { id: "S-008", session: "Machine Learning Basics", skill: "Machine Learning", users: "4 participants", type: "workshop", status: "cancelled", date: "2026-06-30" },
];

const STATUS_CONFIG: Record<SessionStatus, { label: string; badge: string }> = {
  upcoming: { label: "Upcoming", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", badge: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", badge: "bg-red-50 text-red-700 border-red-200" },
};

const TYPE_CONFIG: Record<SessionType, { label: string; icon: React.ElementType; color: string }> = {
  "one-on-one": { label: "1-on-1", icon: Users, color: "text-sky-500" },
  "group": { label: "Group", icon: Users, color: "text-purple-500" },
  "workshop": { label: "Workshop", icon: Video, color: "text-orange-500" },
};

export default function AdminSessionsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();

  const [sessionsList] = useState<SessionListing[]>(SAMPLE_SESSIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

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
  const totalSessions = metrics?.overview?.totalSessions ?? sessionsList.length;
  const upcomingCount = sessions?.scheduled ?? sessionsList.filter(s => s.status === "upcoming").length;
  const completedCount = sessions?.completed ?? sessionsList.filter(s => s.status === "completed").length;
  const cancelledCount = sessions?.canceled ?? sessionsList.filter(s => s.status === "cancelled").length;

  const skills = useMemo(() => Array.from(new Set(sessionsList.map(s => s.skill))), [sessionsList]);

  const filteredSessions = useMemo(() => {
    return sessionsList.filter((item) => {
      const matchesSearch = item.session.toLowerCase().includes(search.toLowerCase()) ||
                            item.users.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesSkill = skillFilter === "all" || item.skill === skillFilter;
      return matchesSearch && matchesStatus && matchesType && matchesSkill;
    });
  }, [sessionsList, search, statusFilter, typeFilter, skillFilter]);

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">

          <AdminHeader
            title="Sessions"
            subtitle="Track all skill-exchange sessions on the platform"
          >
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <CalendarCheck size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metricsLoading ? "—" : totalSessions} Total Sessions
              </span>
            </div>
          </AdminHeader>

          {/* Status Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Sessions",
                value: metricsLoading ? "—" : totalSessions,
                icon: CalendarCheck,
                color: "text-sky-500",
                bg: "bg-sky-50",
                border: "border-sky-200",
              },
              {
                label: "Upcoming",
                value: metricsLoading ? "—" : upcomingCount,
                icon: Clock,
                color: "text-amber-500",
                bg: "bg-amber-50",
                border: "border-amber-200",
              },
              {
                label: "Completed",
                value: metricsLoading ? "—" : completedCount,
                icon: CheckCircle,
                color: "text-green-500",
                bg: "bg-green-50",
                border: "border-green-200",
              },
              {
                label: "Cancelled",
                value: metricsLoading ? "—" : cancelledCount,
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

          {/* Sessions Table */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Sessions</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-gray-50/30">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search session, user or ID…"
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
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Session Types</option>
                <option value="one-on-one">1-on-1</option>
                <option value="group">Group</option>
                <option value="workshop">Workshop</option>
              </select>

              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Skills</option>
                {skills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CalendarCheck size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No sessions found</p>
                </div>
              ) : (
                filteredSessions.map((item) => {
                  const sc = STATUS_CONFIG[item.status];
                  const tc = TYPE_CONFIG[item.type];
                  const TypeIcon = tc.icon;
                  return (
                    <div key={item.id} className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{item.session}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/sessions/${item.id}`)}
                          className="bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 hover:bg-sky-600 transition-colors"
                        >
                          View
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {item.skill}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.badge}`}>
                          {sc.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${tc.color}`}>
                          <TypeIcon size={12} />
                          {tc.label}
                        </span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.users}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Session</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Skill</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Users</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Type</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Status</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Date</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <MessageSquare size={40} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No sessions found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((item) => {
                      const sc = STATUS_CONFIG[item.status];
                      const tc = TYPE_CONFIG[item.type];
                      const TypeIcon = tc.icon;
                      return (
                        <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{item.session}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.id}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {item.skill}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-700">{item.users}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tc.color}`}>
                              <TypeIcon size={14} />
                              {tc.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${sc.badge}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-700">{item.date}</span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/sessions/${item.id}`)}
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

            {filteredSessions.length > 0 && (
              <div className="px-5 py-3 border-t text-sm text-gray-500">
                Showing {filteredSessions.length} of {sessionsList.length} sessions
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
