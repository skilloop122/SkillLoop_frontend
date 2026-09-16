"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  X,
  Upload,
  Calendar,
  AlertCircle,
  FileText,
  GitBranch,
  Globe,
  BookOpen,
  ChevronDown,
  Loader2,
  Plus,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminProjectStore } from "@/lib/adminProjectStore";
import { useSkillsStore } from "@/lib/skillsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/useToast";

interface EligibleUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
}

const DELIVERABLES = [
  { id: "figma", label: "Figma", icon: FileText },
  { id: "github", label: "Github", icon: GitBranch },
  { id: "live-url", label: "Live URL", icon: Globe },
  { id: "case-study", label: "Case Study", icon: BookOpen },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { createProject, getEligibleUsers } = useAdminProjectStore();
  const { skills: apiSkills, fetchSkills } = useSkillsStore();
  const { toastElement, showToast } = useToast();

  const [selectedUsers, setSelectedUsers] = useState<EligibleUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<EligibleUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [title, setTitle] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skill, setSkill] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [points, setPoints] = useState(0);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; dataUrl: string }[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (token) fetchSkills();
  }, [token, fetchSkills]);

  const categories = useMemo(() => {
    const cats = [...new Set(apiSkills.map((s) => s.category).filter(Boolean))].sort();
    return cats;
  }, [apiSkills]);

  const filteredSkills = useMemo(() => {
    if (!category) return [];
    return apiSkills.filter((s) => s.category === category).map((s) => s.name);
  }, [apiSkills, category]);

  useEffect(() => {
    if (!token || userSearchQuery.trim().length < 2) {
      return;
    }
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
    userSearchTimer.current = setTimeout(async () => {
      setSearchingUsers(true);
      const result = await getEligibleUsers(token, userSearchQuery.trim());
      setSearchingUsers(false);
      if (result.success && result.data) {
        const raw = result.data;
        const users: EligibleUser[] = Array.isArray(raw)
          ? (raw as EligibleUser[])
          : ((raw.users ?? raw.data ?? raw.items ?? []) as EligibleUser[]);
        setUserResults(users);
        setShowUserDropdown(true);
      } else {
        setUserResults([]);
      }
    }, 300);
    return () => {
      if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
    };
  }, [userSearchQuery, token, getEligibleUsers]);

  const toggleDeliverable = (id: string) => {
    setDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const readFiles = (files: File[]) => {
    if (files.length === 0) return;
    setUploadingFiles(true);
    const reads = files.map(
      (file) =>
        new Promise<{ name: string; dataUrl: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ name: file.name, dataUrl: reader.result as string });
          };
          reader.onerror = () => resolve({ name: file.name, dataUrl: "" });
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(reads).then((results) => {
      setAttachments((prev) => [...prev, ...results]);
      setUploadingFiles(false);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    readFiles(Array.from(e.dataTransfer.files));
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    readFiles(files);
    e.target.value = "";
  };

  const addTask = () => {
    const value = taskInput.trim();
    if (!value) return;
    if (tasks.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setTaskInput("");
      return;
    }
    setTasks((prev) => [...prev, value]);
    setTaskInput("");
  };

  const removeTask = (idx: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  };

  const addTemplateTasks = () => {
    if (tasks.length > 0) return;
    setTasks([
      "Set up project structure",
      "Build core features",
      "Test and review",
      "Submit for feedback",
    ]);
  };

  const userFullName = (u: EligibleUser) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown";

  const handleSubmit = async () => {
    if (!token || selectedUsers.length === 0) return;
    if (!title.trim()) {
      showToast("Title is required");
      return;
    }
    if (!description.trim()) {
      showToast("Description is required");
      return;
    }
    if (!category) {
      showToast("Select a skill category");
      return;
    }
    if (startDate && deadline && new Date(deadline) <= new Date(startDate)) {
      showToast("Deadline must be later than the start date");
      return;
    }
    setSubmitting(true);
    const count = selectedUsers.length;
    let successCount = 0;
    let lastError = "";
    for (const u of selectedUsers) {
      const result = await createProject(token, {
        userIds: [u.id],
        title: title.trim(),
        description: description.trim(),
        category,
        tasks,
        attachments: attachments.map((a) => a.dataUrl),
        startDate,
        deadline,
        deliverableTypes: deliverables,
        additionalInstructions: instructions,
        points,
      });
      if (result.success) {
        successCount += 1;
      } else {
        lastError = result.message || "Failed to create project";
      }
    }
    setSubmitting(false);
    if (successCount === count) {
      showToast(
        count > 1
          ? `${count} projects created - one per user`
          : "Project created",
      );
      router.push("/admin/projects");
    } else if (successCount > 0) {
      showToast(`Created ${successCount}/${count} projects. ${lastError}`);
      router.push("/admin/projects");
    } else {
      showToast(lastError || "Failed to create project");
    }
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
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">
          <AdminHeader
            title="Create New Project"
            subtitle="Assign a new project to a user to help them apply their newly learned skills."
          >
            <button
              type="button"
              onClick={() => router.push("/admin/projects")}
              className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </AdminHeader>

          {/* Section 1: Assign a User */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Users
            </h2>

            {/* Search — always visible so more users can be added */}
            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onFocus={() => {
                  if (userResults.length > 0) setShowUserDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                placeholder="Search users by name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
              {showUserDropdown && userResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {userResults
                    .filter((u) => !selectedUsers.some((s) => s.id === u.id))
                    .map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedUsers((prev) => [...prev, u]);
                          setUserSearchQuery("");
                          setUserResults([]);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <UserAvatar
                          avatarUrl={u.avatarUrl}
                          firstName={u.firstName}
                          lastName={u.lastName}
                          className="w-9 h-9 rounded-full text-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userFullName(u)}
                          </p>
                          {u.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {u.email}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
              {searchingUsers && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                />
              )}
            </div>

            {/* Selected users as removable chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 bg-sky-50 border border-sky-200 rounded-xl"
                  >
                    <UserAvatar
                      avatarUrl={u.avatarUrl}
                      firstName={u.firstName}
                      lastName={u.lastName}
                      className="w-7 h-7 rounded-full text-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                        {userFullName(u)}
                      </p>
                      {u.email && (
                        <p className="text-xs text-gray-400 truncate leading-tight">
                          {u.email}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUsers((prev) => prev.filter((s) => s.id !== u.id))
                      }
                      className="p-0.5 rounded-md hover:bg-sky-100 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      aria-label={`Remove ${userFullName(u)}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedUsers.length > 1 && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Each assigned user gets their own independent copy of this
                project with separate deliverables and status.
              </p>
            )}
          </section>

          {/* Section 2: Project Details */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project tasks
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
                    onClick={addTask}
                    className="flex items-center gap-1 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2.5 text-sm font-medium text-white transition-colors shrink-0"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                {tasks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tasks.map((task, idx) => (
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
                          onClick={() => removeTask(idx)}
                          className="ml-0.5 text-sky-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${task}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addTemplateTasks}
                  className="mt-2 text-xs text-sky-600 hover:text-sky-500 font-medium"
                >
                  + Add default task suggestions
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Skill Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSkill("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Skill
                </label>
                <div className="relative">
                  <select
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    disabled={!category}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select skill</option>
                    {filteredSkills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Attachments */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Attachments (Optional)
            </h2>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragOver
                  ? "border-sky-400 bg-sky-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Upload
                size={36}
                className={`mx-auto mb-3 ${uploadingFiles ? "animate-bounce text-sky-400" : "text-gray-300"}`}
              />
              <p className="text-sm font-medium text-gray-600">
                Drag & drop files here or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sky-500 underline cursor-pointer"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: PDF, PNG, JPG, DOC
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
              onChange={handleBrowse}
            />
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-700"
                  >
                    <FileText size={16} className="text-gray-400 shrink-0" />
                    <span className="flex-1 truncate">{att.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Project Timeline */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deadline
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={deadline}
                    min={startDate || undefined}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Points (awarded on completion)
                </label>
                <input
                  type="number"
                  min={0}
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <AlertCircle
                size={20}
                className="text-blue-500 shrink-0 mt-0.5"
              />
              <p className="text-sm text-blue-700">
                When the project is marked as completed, the defined points
                will be added to the skillpoints of the assigned users.
              </p>
            </div>
          </section>

          {/* Section 5: Deliverables */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Deliverables
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {DELIVERABLES.map((d) => {
                const Icon = d.icon;
                const selected = deliverables.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDeliverable(d.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selected
                        ? "bg-sky-50 border-sky-300 text-sky-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                    {d.label}
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions for this project..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm resize-none"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pb-12">
            <button
              type="button"
              onClick={() => router.push("/admin/projects")}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || selectedUsers.length === 0}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              + Create Project
            </button>
          </div>
        </div>
      </div>
      {toastElement}
    </div>
  );
}
