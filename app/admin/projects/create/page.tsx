"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

const CATEGORIES = ["Design", "Development", "Management"];
const SKILLS: Record<string, string[]> = {
  Design: ["UI/UX Design", "Figma Prototyping", "Motion Design", "Brand Strategy"],
  Development: ["React Development", "Node.js API", "Python Scripting", "Mobile Dev"],
  Management: ["Agile Coaching", "Scrum Master", "Product Roadmap"],
};

const DELIVERABLES = [
  { id: "figma", label: "Figma", icon: FileText },
  { id: "github", label: "Github", icon: GitBranch },
  { id: "live-url", label: "Live URL", icon: Globe },
  { id: "case-study", label: "Case Study", icon: BookOpen },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const [assignedUser, setAssignedUser] = useState("Sarah Larkson");
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skill, setSkill] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const toggleDeliverable = (id: string) => {
    setDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...files.map((f) => f.name)]);
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign a User</h2>
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-sky-50 border border-sky-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-sky-200 flex items-center justify-center text-sm font-bold text-sky-700">
                SL
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{assignedUser}</p>
                <p className="text-xs text-gray-500">sarah@example.com</p>
              </div>
              <button
                type="button"
                onClick={() => setAssignedUser("")}
                className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          </section>

          {/* Section 2: Project Details */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project tasks</label>
                <input
                  type="text"
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  placeholder="e.g. Design, Development, Testing"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setSkill(""); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill</label>
                <div className="relative">
                  <select
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    disabled={!category}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select skill</option>
                    {(category ? SKILLS[category] : []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Attachments */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments (Optional)</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? "border-sky-400 bg-sky-50" : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <Upload size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                Drag & drop files here or <span className="text-sky-500 underline cursor-pointer">browse files</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Supported: PDF, PNG, JPG, DOC</p>
            </div>
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-700">
                    <FileText size={16} className="text-gray-400" />
                    <span className="flex-1">{name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                The user will see this deadline on their project dashboard.
              </p>
            </div>
          </section>

          {/* Section 5: Deliverables */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deliverables</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {DELIVERABLES.map((d) => {
                const Icon = d.icon;
                const selected = deliverables.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDeliverable(d.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${selected
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Instructions</label>
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
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              + Create Project
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
