"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

type Tab = "overview" | "activity" | "feedback" | "submission";

const PROJECT = {
  id: "P-101",
  name: "E-Commerce Redesign",
  status: "active" as const,
  assignedDate: "Jun 15, 2026",
  dueDate: "Jul 30, 2026",
  description:
    "This project involves a complete redesign of the e-commerce platform, focusing on improving user experience, modernizing the visual design, and optimizing the checkout flow. The redesign should be mobile-first and accessible.",
  tasks: "UI Design, Prototyping, User Testing",
  user: {
    name: "Sarah Larkson",
    email: "sarah@example.com",
    initials: "SL",
    skill: "UI/UX Design",
  },
  deliverables: ["Figma", "Github", "Live URL", "Case Study"],
  attachments: [
    { name: "design_guidelines.pdf", size: "2.4 MB" },
    { name: "wireframes.fig", size: "4.1 MB" },
  ],
};

const ACTIVITY_LOG = [
  { id: 1, action: "Project created", user: "Admin", time: "Jun 15, 2026 09:00 AM" },
  { id: 2, action: "Sarah Larkson was assigned", user: "Admin", time: "Jun 15, 2026 09:05 AM" },
  { id: 3, action: "UI wireframes uploaded", user: "Sarah Larkson", time: "Jun 17, 2026 02:30 PM" },
  { id: 4, action: "First review submitted", user: "Admin", time: "Jun 20, 2026 11:15 AM" },
];

const FEEDBACK_LIST = [
  { id: 1, author: "Admin", text: "Great progress on the wireframes. Let's refine the mobile layout.", rating: 4, date: "Jun 20, 2026" },
  { id: 2, author: "Sarah Larkson", text: "Updated the color palette based on feedback.", rating: 5, date: "Jun 22, 2026" },
];

const SUBMISSIONS = [
  { id: 1, file: "final_design.fig", size: "6.2 MB", submittedBy: "Sarah Larkson", date: "Jun 28, 2026", status: "pending" },
  { id: 2, file: "handoff_notes.pdf", size: "1.1 MB", submittedBy: "Sarah Larkson", date: "Jun 28, 2026", status: "approved" },
];

export default function ProjectDetailsPage() {
  const router = useRouter();
  // const params = useParams();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const p = PROJECT;
  const statusColors =
    p.status === "active"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : p.status === "completed"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200";

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
            title={p.name}
            subtitle={`Project ID: ${p.id}`}
          >
            <button
              type="button"
              onClick={() => router.push("/admin/projects")}
              className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </button>
          </AdminHeader>

          {/* Status & Dates Bar */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={16} />
                  <span>Assigned: <strong className="text-gray-700">{p.assignedDate}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={16} />
                  <span>Due: <strong className="text-gray-700">{p.dueDate}</strong></span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                {p.status === "active" ? <Clock size={14} /> : p.status === "completed" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
          </div>

          {/* User Card */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-lg font-bold text-sky-700">
                {p.user.initials}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{p.user.name}</p>
                <p className="text-sm text-gray-500">{p.user.email}</p>
                <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                  {p.user.skill}
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors}`}>
                {p.status === "active" ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Tabs */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="flex overflow-x-auto border-b">
                {(["overview", "activity", "feedback", "submission"] as Tab[]).map((tab) => (
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
              ))}
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Project Tasks</h3>
                    <p className="text-sm text-gray-600">{p.tasks}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Deliverables</h3>
                    <div className="flex flex-wrap gap-2">
                      {p.deliverables.map((d) => (
                        <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700">
                          {d === "Figma" ? <FileText size={14} /> : d === "Github" ? <GitBranch size={14} /> : d === "Live URL" ? <Globe size={14} /> : <BookOpen size={14} />}
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {p.attachments.map((a, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Paperclip size={16} className="text-gray-400" />
                          <span className="flex-1 text-sm text-gray-700">{a.name}</span>
                          <span className="text-xs text-gray-400">{a.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-0">
                  {ACTIVITY_LOG.map((entry, idx) => (
                    <div key={entry.id} className="flex gap-4 pb-6 relative">
                      {idx < ACTIVITY_LOG.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="w-6 h-6 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {entry.user} · {entry.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="space-y-4">
                  {FEEDBACK_LIST.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare size={36} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No feedback yet</p>
                    </div>
                  ) : (
                    FEEDBACK_LIST.map((fb) => (
                      <div key={fb.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900">{fb.author}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < fb.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{fb.text}</p>
                        <p className="text-xs text-gray-400 mt-1.5">{fb.date}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "submission" && (
                <div className="space-y-4">
                  {SUBMISSIONS.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Upload size={36} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No submissions yet</p>
                    </div>
                  ) : (
                    SUBMISSIONS.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                          <Upload size={18} className="text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.file}</p>
                          <p className="text-xs text-gray-500">{s.submittedBy} · {s.date} · {s.size}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          s.status === "approved"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
