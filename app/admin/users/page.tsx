"use client";

import React, { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { useAdminUserStore } from "@/lib/adminUserStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { useToast } from "@/hooks/useToast";

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();
  const { createUser } = useAdminUserStore();
  const { toastElement, showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", role: "USER" });

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

  const users = useMemo(() => metrics?.topUsers ?? [], [metrics?.topUsers]);

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
                {metrics?.overview?.totalUsers ?? "—"} Total
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
              { label: "Total Users", value: metrics?.overview?.totalUsers, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Active Users", value: metrics?.topUsers?.length, icon: UserCheck, color: "text-green-500", bg: "bg-green-50" },
              { label: "New Users", value: metrics?.overview.newUsers, icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Inactive Users", value: metrics?.overview?.totalInactiveUsers, icon: UserRoundMinus, color: "text-red-500", bg: "bg-red-50" },
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

          {/* Search & Filter */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
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
              {metricsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : filtered.map((user) => (
                <div key={user.id} className="border rounded-xl p-4 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-sky-100 shrink-0 flex items-center justify-center">
                    <span className="text-sky-600 font-bold text-sm">
                      {(user.profile?.firstName?.[0] ?? user.email[0]).toUpperCase()}
                    </span>
                  </div>
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metricsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto" />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Users size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No users found</p>
                      </td>
                    </tr>
                  ) : filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sky-600 font-bold text-xs">
                            {(user.profile?.firstName?.[0] ?? user.email[0]).toUpperCase()}
                          </span>
                        </div>
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
                      <td className="px-5 py-4">
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
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
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
            {!metricsLoading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t flex items-center justify-between text-sm text-gray-500">
                <span>Showing {filtered.length} of {users.length} users</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-40 text-xs">Prev</button>
                  <button className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-40 text-xs">Next</button>
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
                const result = await createUser(token, {
                  email: newUser.email,
                  password: newUser.password,
                  firstName: newUser.firstName,
                  lastName: newUser.lastName,
                  role: newUser.role,
                });
                if (result.success) {
                  fetchMetrics(token);
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
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors flex items-center justify-center gap-2"
                >
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
