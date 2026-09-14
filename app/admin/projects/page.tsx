"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  Loader2,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
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
import { useAdminProjectStore } from "@/lib/adminProjectStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/useToast";

interface ProjectListing {
  id: string;
  title: string;
  category: string;
  status: string;
  startDate: string;
  deadline?: string;
  endDate?: string;
  createdAt?: string;
  created_at?: string;
  created?: string;
  userId?: string;
  // members?: number;
}

interface AssignmentUser {
  projectId: string;
  userId?: string;
  user?: { id: string; firstName?: string; lastName?: string; email?: string; avatarUrl?: string | null };
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
}

function projectEndDate(item: ProjectListing): string {
  return (item.endDate ?? item.deadline ?? "") as string;
}

function getProjectUsers(projectId: string, assignments: AssignmentUser[]): { id: string; firstName?: string; lastName?: string; email?: string; avatarUrl?: string | null }[] {
  const seen = new Set<string>();
  const users: { id: string; firstName?: string; lastName?: string; email?: string; avatarUrl?: string | null }[] = [];
  for (const a of assignments) {
    if (a.projectId !== projectId) continue;
    const u = a.user ?? a;
    const id = String(u.id ?? a.userId ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    users.push({
      id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatarUrl: u.avatarUrl,
    });
  }
  return users;
}

export function buildProjectTrends(items: ProjectListing[]): { day: string; projects: number }[] {
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }

  const counts: Record<string, number> = {};
  for (const item of items) {
    const record = item as unknown as Record<string, unknown>;
    const raw =
      record.createdAt ??
      record.created_at ??
      record.created ??
      item.startDate;
    if (!raw) continue;
    const date = new Date(String(raw));
    if (Number.isNaN(date.getTime())) continue;
    const key = date.toDateString();
    const day = days.find((d) => d.key === key);
    if (!day) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return days.map((d) => ({ day: d.label, projects: counts[d.key] ?? 0 }));
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { getProjects, deleteProject, getUserAssignments } = useAdminProjectStore();
  const { toastElement, showToast } = useToast();
  
  const [projectsList, setProjectsList] = useState<ProjectListing[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [categories, setCategories] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectTrends, setProjectTrends] = useState<{ day: string; projects: number }[]>([]);
  const [assignments, setAssignments] = useState<AssignmentUser[]>([]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const fetchProjectsData = useCallback(async () => {
    if (!token) return;
    setLoadingProjects(true);
    const result = await getProjects(token, {
      page,
      limit,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
    });

    if (result.success && result.data) {
      const raw = result.data;
      const items: ProjectListing[] = Array.isArray(raw)
        ? (raw as ProjectListing[])
        : ((raw.projects ?? raw.data ?? raw.items ?? []) as ProjectListing[]);
      const total: number = Number(raw.total ?? raw.count ?? items.length);
      setProjectsList(items);
      setTotalProjectsCount(total);

      if (categories.length === 0) {
        const cats = new Set(items.map((i) => i.category).filter(Boolean));
        setCategories(Array.from(cats) as string[]);
      }
    } else {
      showToast(result.message || "Failed to load projects");
    }
    setLoadingProjects(false);
  }, [token, page, limit, search, statusFilter, categoryFilter, getProjects, categories.length, showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      const result = await getProjects(token, { page: 1, limit: 100 });
      if (cancelled) return;
      if (result.success && result.data) {
        const raw = result.data;
        const items: ProjectListing[] = Array.isArray(raw)
          ? (raw as ProjectListing[])
          : ((raw.projects ?? raw.data ?? raw.items ?? []) as ProjectListing[]);
        const total: number = Number(raw.total ?? raw.count ?? items.length);
        setProjectsList(items);
        setTotalProjectsCount(total);
        if (categories.length === 0) {
          const cats = new Set(items.map((i) => i.category).filter(Boolean));
          setCategories(Array.from(cats) as string[]);
        }
      } else {
        showToast(result.message || "Failed to load projects");
      }
      setLoadingProjects(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, limit, search, statusFilter, categoryFilter, showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      const result = await getUserAssignments(token, { limit: 100 });
      if (cancelled) return;
      if (result.success && result.data) {
        const raw = result.data;
        const list: AssignmentUser[] = Array.isArray(raw)
          ? raw as AssignmentUser[]
          : (raw.assignments ?? raw.data ?? raw.items ?? []) as AssignmentUser[];
        setAssignments(list);
      }
    })();
    return () => { cancelled = true; };
  }, [token, getUserAssignments]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      const collected: ProjectListing[] = [];
      let pageNum = 1;
      while (!cancelled) {
        const result = await getProjects(token, { page: pageNum, limit: 10 });
        if (!result.success || !result.data) {
          if (pageNum === 1) {
            showToast(result.message || "Failed to load projects");
          }
          break;
        }
        const raw = result.data;
        const items: ProjectListing[] = Array.isArray(raw)
          ? (raw as ProjectListing[])
          : ((raw.projects ?? raw.data ?? raw.items ?? []) as ProjectListing[]);
        if (items.length === 0) break;
        collected.push(...items);
        const total = Number(raw.total ?? raw.count ?? items.length);
        if (collected.length >= total) break;
        pageNum += 1;
        if (pageNum > 100) break;
      }
      if (cancelled) return;
      setProjectTrends(buildProjectTrends(collected));
    })();
    return () => { cancelled = true; };
  }, [token, getProjects, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    const result = await deleteProject(token, id);
    setDeletingId(null);
    if (result.success) {
      showToast("Project deleted");
      fetchProjectsData();
    } else {
      showToast(result.message || "Failed to delete project");
    }
  }, [token, deleteProject, fetchProjectsData, showToast]);

  // Derived metrics from the current paginated view
  const totalProjects = totalProjectsCount;
  const activeProjects = projectsList.filter((p) => p.status?.toLowerCase() === "active" || p.status?.toLowerCase() === "in_progress").length;
  const completedProjects = projectsList.filter((p) => p.status?.toLowerCase() === "completed").length;
  const canceledProjects = projectsList.filter((p) => p.status?.toLowerCase() === "canceled" || p.status?.toLowerCase() === "failed").length;

  const completionRate = totalProjects > 0 
    ? ((completedProjects / totalProjects) * 100).toFixed(0) 
    : "0";

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
            title="Projects"
            subtitle="Track all collaborative projects on the platform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
                <Folder size={18} className="text-sky-500" />
                <span className="text-sky-700 font-semibold text-sm">
                  {totalProjects} Total Projects
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/projects/create")}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <Plus size={18} />
                Create New Project
              </button>
            </div>
          </AdminHeader>

          {/* Status Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Projects",
                value: totalProjects,
                icon: CalendarCheck,
                color: "text-sky-500",
                bg: "bg-sky-50",
                border: "border-sky-200",
              },
              {
                label: "Active / Pending",
                value: activeProjects,
                icon: Clock,
                color: "text-amber-500",
                bg: "bg-amber-50",
                border: "border-amber-200",
              },
              {
                label: "Completed",
                value: completedProjects,
                icon: CheckCircle,
                color: "text-green-500",
                bg: "bg-green-50",
                border: "border-green-200",
              },
              {
                label: "Failed / Canceled",
                value: canceledProjects,
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
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">

            {/* Project trend */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-sky-500" />
                  Projects Created Trend
                </h2>
                <select className="border rounded-lg px-3 py-2 text-xs">
                  <option>Last 7 days</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                {projectTrends.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Activity className="w-10 h-10 animate-pulse" />
                  </div>
                ) : (
                  <AreaChart data={projectTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="projects"
                      stroke="#0ea5e9"
                      fill="#0ea5e920"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Project summary */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <BarChart3 size={20} className="text-sky-500" />
                Project Summary
              </h2>
              <>
                {/* Completion rate big display */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 font-bold text-lg">{completionRate}%</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Completion Rate</p>
                    <p className="text-xs text-green-600">{completedProjects} of {totalProjects} projects completed</p>
                  </div>
                </div>

                <div className="space-y-0 divide-y divide-gray-100">
                  {[
                    { label: "Active Projects", value: activeProjects },
                    { label: "Completed Projects", value: completedProjects },
                    { label: "Canceled Projects", value: canceledProjects },
                    { label: "Completion Rate", value: `${completionRate}%` },
                    { label: "Total Projects", value: totalProjects },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-600">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            </div>
          </div>

          {/* Project Table & Filters */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Project List</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-gray-50/30">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search project name or ID…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {loadingProjects ? (
                <div className="flex justify-center py-12">
                   <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                </div>
              ) : projectsList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Folder size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No projects found</p>
                </div>
              ) : (
                projectsList.map((item) => {
                  const itemUsers = getProjectUsers(item.id, assignments);
                  return (
                    <div key={item.id} className="border rounded-xl p-4 space-y-2 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.id}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/projects/${item.id}`)}
                            className="bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-600 transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Users size={12} />
                          {itemUsers.length}
                        </span>
                        {itemUsers.slice(0, 3).map((u) => (
                          <UserAvatar key={u.id} avatarUrl={u.avatarUrl} firstName={u.firstName} lastName={u.lastName} className="w-5 h-5 rounded-full text-[8px]" />
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {item.category || "Uncategorized"}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          (item.status?.toLowerCase() === 'failed' || item.status?.toLowerCase() === 'canceled') ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {item.status ? item.status.replace("_", " ") : "Pending"}
                        </span>
                        <span className="text-xs text-gray-500">{item.startDate && new Date(item.startDate).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">
                          {projectEndDate(item) ? `End: ${new Date(projectEndDate(item)).toLocaleDateString()}` : ""}
                        </span>
                      </div>
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
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">ID</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Project Name</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Category</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Status</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Start Date</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">End Date</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProjects ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" />
                      </td>
                    </tr>
                  ) : projectsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        <Folder size={40} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No projects found</p>
                      </td>
                    </tr>
                  ) : (
                    projectsList.map((item) => {
                      // const itemUsers = getProjectUsers(item.id, assignments);
                      return (
                        <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <span className="font-semibold text-gray-600">{item.id.substring(0,8)}...</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-gray-900">{item.title}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {item.category || "Uncategorized"}
                            </span>
                          </td>
                          {/* <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {itemUsers.slice(0, 3).map((u) => (
                                  <UserAvatar key={u.id} avatarUrl={u.avatarUrl} firstName={u.firstName} lastName={u.lastName} className="w-7 h-7 rounded-full text-[9px] ring-2 ring-white" />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">{itemUsers.length}</span>
                            </div>
                          </td> */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                              item.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              (item.status?.toLowerCase() === 'failed' || item.status?.toLowerCase() === 'canceled') ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {item.status ? item.status.replace("_", " ") : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-gray-800">{item.startDate && new Date(item.startDate).toLocaleDateString()}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-gray-800">
                              {projectEndDate(item) ? new Date(projectEndDate(item)).toLocaleDateString() : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => router.push(`/admin/projects/${item.id}`)}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === item.id}
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            {!loadingProjects && projectsList.length > 0 && (
              <div className="px-5 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
                <span className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalProjectsCount)} of {totalProjectsCount} projects
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium px-2">{page}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={projectsList.length < limit || page * limit >= totalProjectsCount}
                    className="flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      {toastElement}
    </div>
  );
}
