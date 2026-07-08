"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  MessageSquare,
  Plus,
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
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

interface ProjectListing {
  id: string;
  name: string;
  category: string;
  members: number;
  status: "active" | "completed" | "canceled";
  startDate: string;
}

const SAMPLE_PROJECTS: ProjectListing[] = [
  { id: "P-101", name: "E-Commerce Redesign", category: "UI/UX Design", members: 4, status: "active", startDate: "2026-06-15" },
  { id: "P-102", name: "Python API Integration", category: "Backend Dev", members: 2, status: "completed", startDate: "2026-06-01" },
  { id: "P-103", name: "React Native App", category: "Mobile Dev", members: 3, status: "active", startDate: "2026-06-20" },
  { id: "P-104", name: "Marketing Campaign Asset", category: "Design", members: 1, status: "canceled", startDate: "2026-05-10" },
  { id: "P-105", name: "Data Pipeline Setup", category: "Data Science", members: 2, status: "completed", startDate: "2026-06-05" },
];

const PROJECT_TRENDS = [
  { day: "Mon", projects: 2 },
  { day: "Tue", projects: 4 },
  { day: "Wed", projects: 3 },
  { day: "Thu", projects: 6 },
  { day: "Fri", projects: 5 },
  { day: "Sat", projects: 8 },
  { day: "Sun", projects: 7 },
];

export default function AdminProjectsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  
  const [projectsList] = useState<ProjectListing[]>(SAMPLE_PROJECTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  // Derived mock metrics
  const totalProjects = projectsList.length;
  const activeProjects = projectsList.filter((p) => p.status === "active").length;
  const completedProjects = projectsList.filter((p) => p.status === "completed").length;
  const canceledProjects = projectsList.filter((p) => p.status === "canceled").length;

  const completionRate = totalProjects > 0 
    ? ((completedProjects / totalProjects) * 100).toFixed(0) 
    : "0";

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set(projectsList.map((p) => p.category));
    return Array.from(cats);
  }, [projectsList]);

  const filteredProjects = useMemo(() => {
    return projectsList.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            item.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projectsList, search, statusFilter, categoryFilter]);

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
                label: "Active",
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
                label: "Canceled",
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
                {PROJECT_TRENDS.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Activity className="w-10 h-10 animate-pulse" />
                  </div>
                ) : (
                  <AreaChart data={PROJECT_TRENDS}>
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">ID</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Project Name</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Category</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Members</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Status</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Start Date</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <MessageSquare size={40} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No projects found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-600">{item.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-800">{item.members}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'canceled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-800">{item.startDate}</span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/projects/${item.id}`)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t text-sm text-gray-500">
              Showing {filteredProjects.length} project items
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
