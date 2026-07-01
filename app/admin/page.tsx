"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Activity,
  BookOpen,
  Mail,
  Loader2,
  Search,
  Star,
  CalendarCheck,
  MessageSquare,
  Award,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, token, hydrated, loading: authLoading, me } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();

  useEffect(() => {
    if (hydrated && token) {
      me();
      fetchMetrics(token);
    }
  }, [hydrated, token, me, fetchMetrics]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  // ── Derived chart data ───────────────────────────────────────────────────
  const registrationChartData = useMemo(() => {
    if (!metrics?.trends?.registrations) return [];
    return Object.entries(metrics.trends.registrations).map(([day, users]) => ({
      day,
      users,
    }));
  }, [metrics]);

  const signupsChartData = useMemo(() => {
    if (!metrics?.trends?.registrations || !metrics?.trends?.sessionsCompleted) return [];
    return Object.entries(metrics.trends.registrations).map(([day, signups]) => ({
      day,
      signups,
      sessions: metrics.trends.sessionsCompleted[day] ?? 0,
    }));
  }, [metrics]);

  // ── Stat cards ───────────────────────────────────────────────────────────
  const statCards = useMemo(() => [
    {
      title: "Total Users",
      value: metrics?.overview?.totalUsers ?? "—",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
    },
    {
      title: "Total Sessions",
      value: metrics?.overview?.totalSessions ?? "—",
      icon: CalendarCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      title: "Skill Listings",
      value: metrics?.overview?.totalSkillListings ?? "—",
      icon: BookOpen,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-500",
    },
    {
      title: "Avg Rating",
      value: metrics?.overview?.averageRating
        ? metrics.overview.averageRating.toFixed(1)
        : "—",
      icon: Star,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
  ], [metrics]);

  // ── Admin Insight items ──────────────────────────────────────────────────
  const insightItems = useMemo(() => [
    {
      title: "Completed Sessions",
      value: metrics?.sessions?.completed ?? 0,
      suffix: "",
    },
    {
      title: "Pending Requests",
      value: metrics?.requests?.pending ?? 0,
      suffix: "",
    },
    {
      title: "Total Feedback",
      value: metrics?.overview?.totalFeedback ?? 0,
      suffix: "",
    },
    {
      title: "Points Awarded",
      value: metrics?.overview?.totalPointsAwarded ?? 0,
      suffix: " pts",
    },
  ], [metrics]);

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 pt-20 md:pt-8">
          <div className="w-full max-w-7xl mx-auto px-1 py-4 md:py-8 min-w-0">

            {/* Header */}
            <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-2xl">
                <Search
                  size={22}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search for users, skills......."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Right Section */}
              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8">
                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">
                    <Image
                      src="/images/ebony.jpg"
                      alt="Admin"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={() => {}}
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="font-bold text-2xl md:text-3xl tracking-tight truncate">
                      Welcome, {admin?.firstName ? `${admin.firstName} ${admin.lastName || ""}` : "Admin"}
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm truncate">
                      {admin?.email || "Platform Admin"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {statCards.map((item) => (
                <div key={item.title} className="bg-white border rounded-2xl p-4 md:p-5 shadow-sm">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                      <item.icon className={`w-5 h-5 md:w-7 md:h-7 ${item.iconColor}`} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-gray-500 text-xs md:text-sm truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {metricsLoading ? (
                          <span className="text-2xl md:text-4xl font-bold text-gray-300 animate-pulse">—</span>
                        ) : (
                          <span className="text-2xl md:text-4xl font-bold">{item.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Registrations Trend */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between mb-5">
                  <h2 className="font-semibold text-xl">User Growth</h2>
                  <select className="border rounded-lg px-3 py-2 text-sm">
                    <option>Last 7 days</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  {metricsLoading || registrationChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <Activity className="w-10 h-10 animate-pulse" />
                    </div>
                  ) : (
                    <AreaChart data={registrationChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#0ea5e9" fill="#0ea5e920" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Sessions vs Signups */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between mb-5">
                  <h2 className="font-semibold text-xl">Signups vs Sessions</h2>
                  <select className="border rounded-lg px-3 py-2 text-sm">
                    <option>Last 7 days</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  {metricsLoading || signupsChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <Activity className="w-10 h-10 animate-pulse" />
                    </div>
                  ) : (
                    <BarChart data={signupsChartData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="signups" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="sessions" fill="#d1d5db" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Categories (only when data available) */}
            {metrics?.topCategories && metrics.topCategories.length > 0 && (
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-8">
                <h2 className="font-semibold text-xl mb-4">Top Skill Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {metrics.topCategories.slice(0, 5).map((cat) => (
                    <div key={cat.category} className="flex flex-col items-center bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                      <span className="text-2xl font-bold text-sky-600">{cat.count}</span>
                      <span className="text-xs font-medium text-slate-600 mt-1 truncate w-full text-center">{cat.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USERS SECTION */}
            <div className="mb-8 border rounded-2xl overflow-hidden shadow-sm p-5">
              <h2 className="font-semibold text-xl mb-4">User List</h2>

              {/* Mobile View */}
              <div className="space-y-3 lg:hidden">
                {metricsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                  </div>
                ) : (metrics?.topUsers ?? []).slice(0, 4).map((user) => (
                  <div key={user.id} className="border border-sky-200 rounded-2xl p-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-sky-100 shrink-0 flex items-center justify-center">
                        <span className="text-sky-600 font-bold text-sm">
                          {(user.profile?.firstName?.[0] ?? user.email[0]).toUpperCase()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-black">
                          {user.profile?.firstName
                            ? `${user.profile.firstName} ${user.profile.lastName ?? ""}`
                            : user.email}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <Award size={12} /> {user.points} pts
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-green-500 text-green-500 bg-green-50">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {/* View Button */}
                      <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm shrink-0">
                        View
                      </button>
                    </div>
                  </div>
                ))}

                <button className="w-full flex items-center justify-center gap-2 mt-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-600 font-semibold py-3 rounded-xl transition-colors">
                  <Users size={18} />
                  View Full List
                </button>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="flex justify-end p-4">
                  <button className="text-sky-500 font-semibold">View All</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Points</th>
                        <th className="text-left p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricsLoading ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : (metrics?.topUsers ?? []).map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-sky-600 font-bold text-sm">
                                {(user.profile?.firstName?.[0] ?? user.email[0]).toUpperCase()}
                              </span>
                            </div>
                            <span className="truncate">
                              {user.profile?.firstName
                                ? `${user.profile.firstName} ${user.profile.lastName ?? ""}`
                                : "—"}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{user.email}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-sm border border-sky-500 text-sky-500">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1 text-amber-600 font-semibold">
                              <Award size={14} /> {user.points}
                            </span>
                          </td>
                          <td className="p-4">
                            <button className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-400 transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Session & Request breakdown */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-xl mb-4">Platform Breakdown</h2>
                <div className="space-y-0">
                  {[
                    { label: "Pending Requests", value: metrics?.requests?.pending, icon: Mail, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Accepted Requests", value: metrics?.requests?.accepted, icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
                    { label: "Scheduled Sessions", value: metrics?.sessions?.scheduled, icon: CalendarCheck, color: "text-sky-500", bg: "bg-sky-50" },
                    { label: "Completed Sessions", value: metrics?.sessions?.completed, icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-4 border-b last:border-0">
                      <div className="flex gap-3 items-center">
                        <div className={`w-12 h-12 ${row.bg} rounded-xl flex items-center justify-center`}>
                          <row.icon className={row.color} size={20} />
                        </div>
                        <h3 className="font-semibold text-sm md:text-base">{row.label}</h3>
                      </div>
                      <span className="text-gray-500 font-semibold text-lg">
                        {metricsLoading ? "—" : (row.value ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-right mt-4">
                  <button className="text-sky-500 font-semibold">View all</button>
                </div>
              </div>

              {/* Admin Insight */}
              <div className="bg-white rounded-2xl border border-sky-500 p-6">
                <h2 className="text-sky-400 text-2xl md:text-4xl font-bold mb-8">Admin Insight</h2>

                <div className="space-y-6">
                  {insightItems.map((item) => (
                    <div key={item.title} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
                      <span className="text-sm md:text-base font-medium text-slate-700">{item.title}</span>
                      <span className="text-sky-500 text-lg md:text-2xl font-semibold">
                        {metricsLoading ? "—" : `${item.value}${item.suffix}`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rating Distribution */}
                {metrics?.ratingDistribution && Object.keys(metrics.ratingDistribution).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Rating Distribution</p>
                    <div className="flex items-end gap-2 h-16">
                      {Object.entries(metrics.ratingDistribution)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([rating, count]) => {
                          const max = Math.max(...Object.values(metrics.ratingDistribution));
                          const pct = max > 0 ? (count / max) * 100 : 0;
                          return (
                            <div key={rating} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-sky-400 rounded-sm"
                                style={{ height: `${Math.max(pct, 5)}%` }}
                              />
                              <span className="text-[10px] text-slate-500">★{rating}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
