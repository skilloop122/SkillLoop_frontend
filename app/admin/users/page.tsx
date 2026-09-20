"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Loader2,
  Award,
  Filter,
  ChevronDown,
  Mail,
  // ShieldCheck,
  UserCheck,
  UserPlus,
  UserRoundMinus,
  MoreVertical,
  Download,
  X,
  Trophy,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { useAdminUserStore } from "@/lib/adminUserStore";
import { useAdminSkillsStore } from "@/lib/adminSkillsStore";
import type { AdminUserListing } from "@/lib/adminUserStore";
import type { SkillListing } from "@/lib/skillsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/useToast";

const TABLE_PAGE_SIZE = 10;
const PIE_COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6", "#6366f1"];

function displayName(u: AdminUserListing): string {
  const name = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ");
  return name || u.email || u.id || "Unknown";
}

function listingOwnerName(l: SkillListing): string {
  const name = [l.user?.profile?.firstName, l.user?.profile?.lastName].filter(Boolean).join(" ");
  return name || l.user?.email || "Unknown";
}

function parseListing(raw: unknown): AdminUserListing {
  const r = (raw ?? {}) as Record<string, unknown>;
  const profile = (r.profile ?? {}) as Record<string, unknown>;
  const parseSkills = (v: unknown): { id: string; name: string }[] =>
    Array.isArray(v)
      ? v.filter((s) => s && typeof s === "object").map((s) => {
          const skill = s as Record<string, unknown>;
          return { id: String(skill.id ?? ""), name: String(skill.name ?? "") };
        })
      : [];
  return {
    id: String(r.id ?? ""),
    email: String(r.email ?? ""),
    points: Number(r.points) || 0,
    role: String(r.role ?? "USER"),
    status: r.status ? String(r.status) : undefined,
    createdAt: r.createdAt ? String(r.createdAt) : undefined,
    avatarUrl:
      r.avatarUrl === null || r.avatarUrl === undefined
        ? null
        : String(r.avatarUrl),
    profile: {
      firstName: profile.firstName ? String(profile.firstName) : undefined,
      lastName: profile.lastName ? String(profile.lastName) : undefined,
      avatarUrl:
        profile.avatarUrl === null || profile.avatarUrl === undefined
          ? null
          : String(profile.avatarUrl),
      teachSkills: parseSkills(profile.teachSkills),
      learnSkills: parseSkills(profile.learnSkills),
    },
    teachSkills: parseSkills(r.teachSkills),
    learnSkills: parseSkills(r.learnSkills),
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();
  const { createUser, getUsers } = useAdminUserStore();
  const { fetchSkills } = useAdminSkillsStore();
  const { toastElement, showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", role: "USER" });
  const [allUsers, setAllUsers] = useState<AdminUserListing[]>([]);
  const [skillListings, setSkillListings] = useState<SkillListing[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [userSummary, setUserSummary] = useState<{ total?: number; active?: number; inactive?: number; newUsers?: number } | null>(null);

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

  const fetchAllUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    const collected: AdminUserListing[] = [];
    let pageNum = 1;
    let shownTotal = 0;
    while (true) {
      const result = await getUsers(token, { page: pageNum, limit: 100 });
      if (!result.success || !result.data) {
        if (pageNum === 1) {
          showToast(result.message || "Failed to fetch users");
        }
        break;
      }
      const raw = result.data;
      if (pageNum === 1 && raw.summary) {
        setUserSummary(raw.summary as { total?: number; active?: number; inactive?: number; newUsers?: number });
      }
      const items: unknown[] = Array.isArray(raw)
        ? raw
        : (raw.users ?? raw.data ?? raw.items ?? []) as unknown[];
      const parsed = items.map(parseListing).filter((u) => u.id || u.email);
      collected.push(...parsed);
      const total = Number(raw.total ?? raw.count ?? collected.length);
      shownTotal = total || collected.length;
      if (parsed.length === 0 || collected.length >= shownTotal) break;
      pageNum += 1;
      if (pageNum > 100) break;
    }
    setAllUsers(collected);
    setUsersLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchAllSkills = useCallback(async () => {
    if (!token) return;
    setSkillsLoading(true);
    const collected: SkillListing[] = [];
    let pageNum = 1;
    while (true) {
      const result = await fetchSkills(token, { page: pageNum, limit: 100 });
      if (!result.success || !result.data) break;
      const items = result.data.skills ?? [];
      collected.push(...items);
      if (items.length === 0 || collected.length >= result.data.total) break;
      pageNum += 1;
      if (pageNum > 100) break;
    }
    setSkillListings(collected);
    setSkillsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchAllUsers(), fetchAllSkills()]);
    })();
  }, [fetchAllUsers, fetchAllSkills]);

  const users = useMemo(() => allUsers, [allUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const name = `${u.profile?.firstName ?? ""} ${u.profile?.lastName ?? ""}`.toLowerCase();
      const matchSearch =
        name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const roles = ["All", ...Array.from(new Set(users.map((u) => u.role)))];

  // const activeUsersCount = users.filter((u) => u.status === "active").length;

  const topByPoints = useMemo(
    () =>
      [...allUsers]
        .map((u) => ({ name: displayName(u), points: u.points || 0 }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 10),
    [allUsers],
  );

  const topBySkills = useMemo(() => {
    const byUser = new Map<string, { name: string; skills: number }>();
    skillListings.forEach((l) => {
      const userId = l.user?.id ?? l.userId;
      if (!userId) return;
      const existing = byUser.get(userId);
      const name = listingOwnerName(l);
      if (existing) {
        existing.skills += 1;
        if (existing.name === "Unknown") existing.name = name;
      } else {
        byUser.set(userId, { name, skills: 1 });
      }
    });
    return [...byUser.values()].sort((a, b) => b.skills - a.skills).slice(0, 10);
  }, [skillListings]);

  const roleDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    allUsers.forEach((u) => {
      const role = u.role || "USER";
      counts.set(role, (counts.get(role) ?? 0) + 1);
    });
    return [...counts.entries()].map(([role, value]) => ({ role, value }));
  }, [allUsers]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / TABLE_PAGE_SIZE));
  const safePage = Math.min(usersPage, pageCount);
  const pagedUsers = filtered.slice(
    (safePage - 1) * TABLE_PAGE_SIZE,
    safePage * TABLE_PAGE_SIZE,
  );

  const handleExport = () => {
    const headers = ["Name", "Email", "Role", "Status", "Date Joined", "Points"];
    const rows = filtered.map((u) => [
      u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName ?? ""}` : "",
      u.email,
      u.role,
      u.status ?? "",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "",
      u.points,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            title="Users"
            subtitle="Manage and monitor all registered users"
          >
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <Users size={18} className="text-sky-500" />
<span className="text-sky-700 font-semibold text-sm">
                 {userSummary?.total ?? metrics?.summary?.total ?? "—"} Total
               </span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors shadow-sm"
            >
              <UserPlus size={15} />
              Create User
            </button>
          </AdminHeader>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
{[
               { label: "Total Users", value: userSummary?.total ?? metrics?.summary?.total, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
               { label: "Active Users", value: userSummary?.active ?? metrics?.summary?.active, icon: UserCheck, color: "text-green-500", bg: "bg-green-50" },
               { label: "New Users", value: userSummary?.newUsers ?? metrics?.summary?.newUsers, icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
               { label: "Inactive Users", value: userSummary?.inactive ?? metrics?.summary?.inactive, icon: UserRoundMinus, color: "text-red-500", bg: "bg-red-50" },
             ].map((card) => (
              <div key={card.label} className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-xl font-bold">
                      {metricsLoading ? <span className="text-gray-300 animate-pulse">—</span> : (card.value ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
            {/* Top Users by Points */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Trophy size={20} className="text-amber-500" />
                Top Users by Points
              </h2>
              {usersLoading && allUsers.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-300">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : topByPoints.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-300">
                  <BarChart3 size={32} className="opacity-40" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topByPoints} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "#0ea5e908" }} />
                    <Bar dataKey="points" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Points" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Users by Skills */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Award size={20} className="text-violet-500" />
                Top Users by Skills
              </h2>
              {skillsLoading && skillListings.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-300">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : topBySkills.length === 0 || topBySkills.every((d) => d.skills === 0) ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-300">
                  <BarChart3 size={32} className="opacity-40" />
                  <p className="mt-2 text-xs text-gray-400">No skill listings found</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topBySkills} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "#0ea5e908" }} />
                    <Bar dataKey="skills" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Skills" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Role Distribution */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm md:col-span-2 xl:col-span-1">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <PieChartIcon size={20} className="text-sky-500" />
                Role Distribution
              </h2>
              {usersLoading && allUsers.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-300">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : roleDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-300">
                  <PieChartIcon size={32} className="opacity-40" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      dataKey="value"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ role, value }) => `${role} (${value})`}
                    >
                      {roleDistribution.map((entry, i) => (
                        <Cell key={entry.role} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setUsersPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setUsersPage(1); }}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white"
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {usersLoading && allUsers.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : pagedUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : pagedUsers.map((user) => (
                <div key={user.id} className="border rounded-xl p-4 flex items-start gap-3">
                  <UserAvatar
                    avatarUrl={user.profile?.avatarUrl ?? user.avatarUrl}
                    firstName={user.profile?.firstName}
                    lastName={user.profile?.lastName}
                    className="w-11 h-11 rounded-full text-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {user.profile?.firstName
                        ? `${user.profile.firstName} ${user.profile.lastName ?? ""}`
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-sky-400 text-sky-600">
                        {user.role}
                      </span>
                      {user.status && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-50 text-green-600 border border-green-300"
                            : "bg-red-50 text-red-500 border border-red-300"
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Award size={11} /> {user.points} pts
                      </span>
                    </div>
                    {user.createdAt && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        Joined {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 hover:bg-sky-600 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-175">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    {/* <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th> */}
                    {/* <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Joined</th> */}
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersLoading && allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto" />
                      </td>
                    </tr>
                  ) : pagedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Users size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No users found</p>
                      </td>
                    </tr>
                  ) : pagedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 flex items-center gap-3">
                        <UserAvatar
                          avatarUrl={user.profile?.avatarUrl ?? user.avatarUrl}
                          firstName={user.profile?.firstName}
                          lastName={user.profile?.lastName}
                          className="w-9 h-9 rounded-full text-xs shrink-0"
                        />
                        <span className="font-medium text-sm">
                          {user.profile?.firstName
                            ? `${user.profile.firstName} ${user.profile.lastName ?? ""}`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border border-sky-400 text-sky-600 bg-sky-50">
                          {user.role}
                        </span>
                      </td>
                      {/* <td className="px-5 py-4">
                        {user.status ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-green-50 text-green-600 border border-green-300"
                              : "bg-red-50 text-red-500 border border-red-300"
                          }`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td> */}
                      {/* <td className="px-5 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td> */}
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-sm">
                          <Award size={14} /> {user.points}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="bg-sky-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-sky-400 transition-colors"
                          >
                            View
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!usersLoading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t flex items-center justify-between text-sm text-gray-500">
                <span>
                  Showing {(safePage - 1) * TABLE_PAGE_SIZE + 1} to{" "}
                  {Math.min(safePage * TABLE_PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} users
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                  >
                    Prev
                  </button>
                  <span className="px-2 text-xs font-medium">
                    {safePage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setUsersPage((p) => Math.min(pageCount, p + 1))}
                    disabled={safePage >= pageCount}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      {/* Create User Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create New User</h2>
                <p className="text-xs text-gray-500 mt-0.5">Fill in the details to add a new user</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                setCreatingUser(true);
                const result = await createUser(token, {
                  email: newUser.email,
                  password: newUser.password,
                  firstName: newUser.firstName,
                  lastName: newUser.lastName,
                  role: newUser.role,
                });
                setCreatingUser(false);
                if (result.success) {
                  fetchMetrics(token);
                  fetchAllUsers();
                  setShowCreateModal(false);
                  setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "USER" });
                } else {
                  showToast(result.message || "Failed to create user");
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    placeholder="John"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Doe"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingUser && <Loader2 size={15} className="animate-spin" />}
                  <UserPlus size={15} />
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastElement}
    </div>
  );
}
