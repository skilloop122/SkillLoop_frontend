"use client";

import React, { useEffect, useState } from "react";
import {
  Folder,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar,
  Tag,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useProjectStore, Project, projectTitle, projectStatusLabel } from "../../lib/projectStore";
import { useAuthStore } from "../../lib/authStore";

type Tab = "Active" | "Completed" | "Failed";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  PENDING: "bg-sky-50 text-sky-700 border-sky-200",
};

function statusStyle(status?: string) {
  return STATUS_STYLES[(status ?? "PENDING").toUpperCase()] ?? STATUS_STYLES.PENDING;
}

function formatDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const isActive = (p: Project) =>
  (p.status ?? "").toUpperCase() === "IN_PROGRESS" ||
  (p.status ?? "").toUpperCase() === "PENDING" ||
  (p.status ?? "").toUpperCase() === "ACTIVE";

const isCompleted = (p: Project) => (p.status ?? "").toUpperCase() === "COMPLETED";

const isFailed = (p: Project) => (p.status ?? "").toUpperCase() === "FAILED";

export default function ProjectsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { getProjects } = useProjectStore();
  const [tab, setTab] = useState<Tab>("Active");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      setLoading(true);
      const result = await getProjects();
      if (cancelled) return;
      if (result.success && result.projects) {
        setProjects(result.projects);
        setError(null);
      } else {
        setError(result.message || "Failed to load projects");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token, getProjects]);

  const activeProjects = projects.filter(isActive);
  const completedProjects = projects.filter(isCompleted);
  const failedProjects = projects.filter(isFailed);
  const filtered =
    tab === "Active"
      ? activeProjects
      : tab === "Completed"
        ? completedProjects
        : failedProjects;

  const tabCounts: Record<Tab, number> = {
    Active: activeProjects.length,
    Completed: completedProjects.length,
    Failed: failedProjects.length,
  };

  const stats = [
    { label: "Total", value: projects.length, icon: Folder, iconColor: "text-sky-500" },
    { label: "Active", value: activeProjects.length, icon: Clock, iconColor: "text-amber-500" },
    { label: "Completed", value: completedProjects.length, icon: CheckCircle2, iconColor: "text-green-500" },
    { label: "Failed", value: failedProjects.length, icon: XCircle, iconColor: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 font-sans flex">
      <SideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-2">
              My Projects
            </h1>
            <p className="text-[15px] text-gray-500 leading-snug">
              Track your assigned projects and their progress.
            </p>
          </header>

          {/* Stats */}
          <div className="mb-8 rounded-3xl bg-linear-to-br from-[#2dbcf8] to-[#60cbf9] p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/10 border border-white/30 px-4 py-4 sm:py-5 text-center"
                >
                  <div className="mx-auto mb-2 w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                    <stat.icon size={22} className={stat.iconColor} />
                  </div>
                  <p className="text-2xl font-bold text-white leading-none">{stat.value}</p>
                  <p className="text-xs text-white/80 font-medium uppercase tracking-wide mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-2 bg-white border rounded-xl p-1.5 w-fit">
            {(["Active", "Completed", "Failed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === t ? "bg-sky-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t}
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tabCounts[t]}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24 bg-white border rounded-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : error ? (
            <div className="py-24 text-center text-red-500 bg-white border rounded-2xl">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-gray-400 bg-white border rounded-2xl">
              <Folder size={44} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No {tab.toLowerCase()} projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((project) => {
                const failed = isFailed(project);
                return failed ? (
                  <div
                    key={project.id}
                    className="text-left bg-white border rounded-2xl p-5 shadow-sm flex flex-col opacity-80"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {projectTitle(project)}
                      </h3>
                      <span
                        className={`inline-flex items-center shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle(project.status)}`}
                      >
                        {projectStatusLabel(project.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                      {project.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {project.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                          <Tag size={12} />
                          {project.category}
                        </span>
                      )}
                      {formatDate(project.deadline) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                          <Calendar size={12} />
                          Due {formatDate(project.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-sky-600 transition-colors">
                      {projectTitle(project)}
                    </h3>
                    <span
                      className={`inline-flex items-center shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle(project.status)}`}
                    >
                      {projectStatusLabel(project.status)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {project.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                        <Tag size={12} />
                        {project.category}
                      </span>
                    )}
                    {formatDate(project.deadline) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                        <Calendar size={12} />
                        Due {formatDate(project.deadline)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end text-sky-600 text-sm font-semibold">
                    View Details
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
