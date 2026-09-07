"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  GitBranch,
  Globe,
  BookOpen,
  MessageSquare,
  Star,
  Paperclip,
  Upload,
  Loader2,
  Pencil,
  Plus,
  X,
  Save,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminProjectStore } from "@/lib/adminProjectStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/useToast";

type Tab = "overview" | "activity" | "feedback" | "submission";

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  active: { label: "Active", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "In Progress", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
  canceled: { label: "Canceled", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
  pending: { label: "Pending", icon: Clock, cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

function statusInfo(raw?: string) {
  const key = (raw ?? "pending").toLowerCase();
  return STATUS_MAP[key] ?? STATUS_MAP.pending;
}

const DELIVERABLE_ICONS: Record<string, React.ElementType> = {
  figma: FileText,
  github: GitBranch,
  "live-url": Globe,
  "case-study": BookOpen,
};

function deliverableIcon(label: string) {
  return DELIVERABLE_ICONS[label.toLowerCase().replace(/\s+/g, "-")] ?? FileText;
}

const DELIVERABLE_TYPES = [
  { id: "figma", label: "Figma", icon: FileText },
  { id: "github", label: "Github", icon: GitBranch },
  { id: "live-url", label: "Live URL", icon: Globe },
  { id: "case-study", label: "Case Study", icon: BookOpen },
];

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { getProjectById, updateProject } = useAdminProjectStore();
  const { toastElement, showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loadingProject, setLoadingProject] = useState(true);
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editStartDate, setEditStartDate] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editTasks, setEditTasks] = useState<string[]>([]);
  const [editDeliverables, setEditDeliverables] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!token || !projectId) return;
    let cancelled = false;
    (async () => {
      setLoadingProject(true);
      const result = await getProjectById(token, projectId);
      if (cancelled) return;
      if (result.success && result.data) {
        const raw = result.data;
        const p: Record<string, unknown> =
          (raw.project ?? raw.data ?? (typeof raw === "object" && raw !== null ? raw : {})) as Record<string, unknown>;
        setProject(p);
      } else {
        showToast(result.message || "Failed to load project");
      }
      setLoadingProject(false);
    })();
    return () => { cancelled = true; };
  }, [token, projectId, getProjectById, showToast]);

  function populateEdit() {
    if (!project) return;
    const existingTasks = Array.isArray(project.tasks)
      ? (project.tasks as unknown[]).map((t) => String(t))
      : typeof project.tasks === "string" && project.tasks.trim()
        ? project.tasks.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    setEditTitle((project.title ?? project.name ?? "") as string);
    setEditDescription((project.description ?? "") as string);
    setEditCategory((project.category ?? "") as string);
    setEditStatus(((project.status ?? "PENDING") as string).toUpperCase());
    setEditStartDate(((project.startDate ?? "") as string).slice(0, 10));
    setEditDeadline(((project.deadline ?? "") as string).slice(0, 10));
    setEditTasks(existingTasks);
    const existingDeliverables = Array.isArray(project.deliverableTypes)
      ? (project.deliverableTypes as unknown[]).map((d) => String(d))
      : Array.isArray(project.deliverables)
        ? (project.deliverables as unknown[]).map((d) => String(d))
        : [];
    setEditDeliverables(existingDeliverables);
    setTaskInput("");
  }

  const startEditing = () => {
    populateEdit();
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const addEditTask = () => {
    const value = taskInput.trim();
    if (!value) return;
    if (editTasks.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setTaskInput("");
      return;
    }
    setEditTasks((prev) => [...prev, value]);
    setTaskInput("");
  };

  const removeEditTask = (idx: number) => {
    setEditTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeliverable = (id: string) => {
    setEditDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEditTask();
    }
  };

  const handleSave = async () => {
    if (!token || !projectId) return;
    if (!editTitle.trim()) {
      showToast("Title is required");
      return;
    }
    if (
      editStartDate &&
      editDeadline &&
      new Date(editDeadline) <= new Date(editStartDate)
    ) {
      showToast("Deadline must be later than the start date");
      return;
    }
    setSaving(true);
    const result = await updateProject(token, projectId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      status: editStatus,
      startDate: editStartDate || undefined,
      deadline: editDeadline || undefined,
      tasks: editTasks,
      deliverableTypes: editDeliverables,
      additionalInstructions: (project?.additionalInstructions ?? "") as string,
    });
    setSaving(false);
    if (result.success) {
      showToast("Project updated");
      setEditing(false);
      const refreshed = await getProjectById(token, projectId);
      if (refreshed.success && refreshed.data) {
        const raw = refreshed.data;
        const prj: Record<string, unknown> = (raw.project ?? raw.data ?? (typeof raw === "object" && raw !== null ? raw : {})) as Record<string, unknown>;
        setProject(prj);
      }
    } else {
      showToast(result.message || "Failed to update project");
    }
  };

  const p = project;
  const status: string = (p?.status as string) ?? "pending";
  const { label: statusLabel, icon: StatusIcon, cls: statusCls } = statusInfo(status);

  const assignedDate = (p?.startDate ?? p?.assignedDate ?? "") as string;
  const dueDate = (p?.deadline ?? p?.dueDate ?? "") as string;
  const description = (p?.description ?? "") as string;
  const tasks = (p?.tasks ?? "") as string | string[];
  const title = (p?.title ?? p?.name ?? "Untitled Project") as string;
  const projectIdDisplay = (p?.id ?? projectId ?? "") as string;

  const user = (p?.user ?? p?.assignedUser ?? null) as Record<string, unknown> | null;
  const userProfile = (user?.profile ?? null) as Record<string, unknown> | null;
  const userAvatar = (user?.avatarUrl ??
    (userProfile ? (userProfile.avatarUrl as string) : undefined) ??
    "") as string;
  const userName = user
    ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || (user.name as string) || "Unknown")
    : "Unassigned";
  const userEmail = (user?.email ?? "") as string;
  const userSkill = (user?.skill ?? p?.skill ?? "") as string;

  const deliverables: string[] = Array.isArray(p?.deliverables)
    ? p.deliverables as string[]
    : Array.isArray(p?.deliverableTypes)
      ? p.deliverableTypes as string[]
      : [];

  const attachments: { name: string; size?: string }[] = Array.isArray(p?.attachments)
    ? (p.attachments as unknown[]).map((a: unknown) => {
        if (typeof a === "string") return { name: a };
        if (a && typeof a === "object") return a as { name: string; size?: string };
        return { name: "Unknown file" };
      })
    : [];

  const activityLog: { id: number; action: string; user?: string; time?: string }[] = Array.isArray(p?.activityLog)
    ? p.activityLog as { id: number; action: string; user?: string; time?: string }[]
    : [];

  const feedbackList: { id: number; author?: string; text?: string; rating?: number; date?: string }[] = Array.isArray(p?.feedback)
    ? p.feedback as { id: number; author?: string; text?: string; rating?: number; date?: string }[]
    : [];

  const submissions: { id: number; file?: string; size?: string; submittedBy?: string; date?: string; status?: string }[] = Array.isArray(p?.submissions)
    ? p.submissions as { id: number; file?: string; size?: string; submittedBy?: string; date?: string; status?: string }[]
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
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">
          <AdminHeader title={title} subtitle={`Project ID: ${projectIdDisplay}`}>
            <div className="flex items-center gap-3">
              {!editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
                >
                  <Pencil size={16} />
                  Edit Project
                </button>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Projects
              </button>
            </div>
          </AdminHeader>

          {editing && (
            <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Project
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Project title"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Skill category"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={editDeadline}
                    min={editStartDate || undefined}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tasks
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={handleTaskKeyDown}
                    placeholder="Type a task and press Enter"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addEditTask}
                    className="flex items-center gap-1 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2.5 text-sm font-medium text-white transition-colors shrink-0"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                {editTasks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editTasks.map((task, idx) => (
                      <span
                        key={`${task}-${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-sm text-sky-900"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                          {idx + 1}
                        </span>
                        {task}
                        <button
                          type="button"
                          onClick={() => removeEditTask(idx)}
                          className="ml-0.5 text-sky-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deliverable Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERABLE_TYPES.map((d) => {
                    const Icon = d.icon;
                    const active = editDeliverables.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDeliverable(d.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border transition-colors ${
                          active
                            ? "bg-sky-500 border-sky-500 text-white"
                            : "border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
                        }`}
                      >
                        <Icon size={16} />
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {editDeliverables.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {editDeliverables.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {loadingProject ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : !p ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm">Project not found</p>
            </div>
          ) : (
            <>
              {/* Status & Dates Bar */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-6 text-sm">
                    {assignedDate && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        <span>
                          Assigned:{" "}
                          <strong className="text-gray-700">
                            {new Date(assignedDate).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    )}
                    {dueDate && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        <span>
                          Due:{" "}
                          <strong className="text-gray-700">
                            {new Date(dueDate).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border ${statusCls}`}
                  >
                    <StatusIcon size={14} />
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* User Card */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    avatarUrl={userAvatar}
                    firstName={user?.firstName as string}
                    lastName={user?.lastName as string}
                    className="w-14 h-14 rounded-full text-lg shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{userName}</p>
                    {userEmail && (
                      <p className="text-sm text-gray-500">{userEmail}</p>
                    )}
                    {userSkill && (
                      <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                        {userSkill}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCls}`}
                  >
                    <StatusIcon size={14} />
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="flex overflow-x-auto border-b">
                  {(["overview", "activity", "feedback", "submission"] as Tab[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap flex-1 sm:flex-none px-3 sm:px-6 py-3.5 text-sm font-semibold capitalize transition-colors relative ${
                          activeTab === tab
                            ? "text-sky-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                        )}
                      </button>
                    ),
                  )}
                </div>

                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {tasks && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Project Tasks
                          </h3>
                          <p className="text-sm text-gray-600">
                            {typeof tasks === "string" ? tasks : Array.isArray(tasks) ? tasks.join(", ") : String(tasks)}
                          </p>
                        </div>
                      )}
                      {deliverables.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Deliverables
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {deliverables.map((d) => {
                              const Icon = deliverableIcon(String(d));
                              return (
                                <span
                                  key={String(d)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  <Icon size={14} />
                                  {String(d)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {attachments.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Attachments
                          </h3>
                          <div className="space-y-2">
                            {attachments.map((a, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
                              >
                                <Paperclip
                                  size={16}
                                  className="text-gray-400"
                                />
                                <span className="flex-1 text-sm text-gray-700">
                                  {a.name}
                                </span>
                                {a.size && (
                                  <span className="text-xs text-gray-400">
                                    {a.size}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!tasks && deliverables.length === 0 && attachments.length === 0 && (
                        <p className="text-sm text-gray-400">
                          No additional details for this project.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="space-y-0">
                      {activityLog.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MessageSquare
                            size={36}
                            className="mx-auto mb-2 opacity-40"
                          />
                          <p className="text-sm">No activity recorded yet</p>
                        </div>
                      ) : (
                        activityLog.map((entry, idx) => (
                          <div
                            key={entry.id}
                            className="flex gap-4 pb-6 relative"
                          >
                            {idx < activityLog.length - 1 && (
                              <div className="absolute left-2.75 top-6 bottom-0 w-0.5 bg-gray-200" />
                            )}
                            <div className="w-6 h-6 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-sky-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {entry.action}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {entry.user}
                                {entry.time ? ` · ${entry.time}` : ""}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "feedback" && (
                    <div className="space-y-4">
                      {feedbackList.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MessageSquare
                            size={36}
                            className="mx-auto mb-2 opacity-40"
                          />
                          <p className="text-sm">No feedback yet</p>
                        </div>
                      ) : (
                        feedbackList.map((fb) => (
                          <div key={fb.id} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {fb.author ?? "Unknown"}
                              </p>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={
                                      i < (fb.rating ?? 0)
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{fb.text}</p>
                            {fb.date && (
                              <p className="text-xs text-gray-400 mt-1.5">
                                {fb.date}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "submission" && (
                    <div className="space-y-4">
                      {submissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Upload
                            size={36}
                            className="mx-auto mb-2 opacity-40"
                          />
                          <p className="text-sm">No submissions yet</p>
                        </div>
                      ) : (
                        submissions.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                              <Upload
                                size={18}
                                className="text-sky-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {s.file ?? "Unknown file"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {s.submittedBy ?? ""}
                                {s.date ? ` · ${s.date}` : ""}
                                {s.size ? ` · ${s.size}` : ""}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                s.status === "approved"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {(s.status ?? "pending").charAt(0).toUpperCase() +
                                (s.status ?? "pending").slice(1)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {toastElement}
    </div>
  );
}
