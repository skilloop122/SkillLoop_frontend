"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Tag,
  CheckCircle2,
  ListChecks,
  MessagesSquare,
  Paperclip,
  Send,
} from "lucide-react";
import { useProjectStore, projectTitle, projectStatusLabel, Project } from "../../../lib/projectStore";
import { useAuthStore } from "../../../lib/authStore";
import { SideNav } from "../../../components/SideNav";
import { BottomNav } from "../../../components/BottomNav";

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
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function tasksAsArray(tasks?: string[] | string): string[] {
  if (Array.isArray(tasks)) return tasks;
  if (typeof tasks === "string" && tasks.trim()) {
    return tasks.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const token = useAuthStore((s) => s.token);
  const { getProjectById, submitProject } = useProjectStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliverableValues, setDeliverableValues] = useState<Record<string, string>>({});
  const [submissionNote, setSubmissionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token || !projectId) return;
      setLoading(true);
      const result = await getProjectById(projectId);
      if (cancelled) return;
      if (result.success && result.project) {
        setProject(result.project);
        setError(null);
      } else {
        setError(result.message || "Failed to load project");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token, projectId, getProjectById]);

  const isCompleted = (project?.status ?? "").toUpperCase() === "COMPLETED";
  const deliverableTypes: string[] = Array.isArray(project?.deliverableTypes)
    ? project.deliverableTypes as string[]
    : Array.isArray(project?.deliverables)
      ? project.deliverables as string[]
      : [];

  const handleSubmit = async () => {
    if (!token || !projectId) return;
    const deliverables = deliverableTypes
      .filter((type) => (deliverableValues[type] ?? "").trim())
      .map((type) => ({ type, value: deliverableValues[type].trim() }));
    if (deliverableTypes.length > 0 && deliverables.length === 0) {
      setSubmitError("Please fill in at least one deliverable link.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const result = await submitProject(projectId, {
      deliverables,
      note: submissionNote,
    });
    setSubmitting(false);
    if (result.success && result.project) {
      setProject(result.project);
      setSubmitError(null);
      router.push("/projects");
    } else {
      setSubmitError(result.message || "Failed to submit project");
    }
  };

  const updateDeliverable = (type: string, value: string) => {
    setDeliverableValues((prev) => ({ ...prev, [type]: value }));
  };

  const tasks = tasksAsArray(project?.tasks);

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 font-sans text-gray-900 flex">
      <SideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back
          </button>

        {loading ? (
          <div className="flex justify-center py-24 bg-white border rounded-2xl shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : error ? (
          <div className="py-24 text-center text-red-500 bg-white border rounded-2xl shadow-sm">
            {error}
          </div>
        ) : !project ? (
          <div className="py-24 text-center text-gray-400 bg-white border rounded-2xl shadow-sm">
            Project not found.
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                  {projectTitle(project)}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle(project.status)}`}
                >
                  <CheckCircle2 size={14} />
                  {projectStatusLabel(project.status)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                {project.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-sm font-medium">
                    <Tag size={14} />
                    {project.category}
                  </span>
                )}
              </div>

              <p className="text-[15px] text-gray-600 leading-relaxed">
                {project.description || "No description provided."}
              </p>
            </div>

            {(project.startDate || project.deadline) && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                  <Calendar size={18} className="text-sky-500" />
                  Project Timeline
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.startDate && formatDate(project.startDate) && (
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                      <span className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-sky-600" />
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.deadline && formatDate(project.deadline) && (
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                      <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-amber-600" />
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Deadline</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(project.deadline)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                  <ListChecks size={18} className="text-sky-500" />
                  Your Tasks
                </h2>
                <ul className="space-y-2.5">
                  {tasks.map((task, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-gray-700 leading-snug"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.additionalInstructions ? (
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                  <MessagesSquare size={18} className="text-sky-500" />
                  Instructions
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.additionalInstructions}
                </p>
              </div>
            ) : null}

            {!isCompleted && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm mt-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                  <Paperclip size={18} className="text-sky-500" />
                  Submit Deliverables
                </h2>

                {deliverableTypes.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {deliverableTypes.map((type) => (
                      <div key={type}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">
                          {type === "live-url" ? "Live URL" : type.replace(/-/g, " ")}
                        </label>
                        <input
                          type="text"
                          value={deliverableValues[type] ?? ""}
                          onChange={(e) => updateDeliverable(type, e.target.value)}
                          placeholder={`Paste your ${type === "live-url" ? "Live URL" : type.replace(/-/g, " ")} link`}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Submission note (optional)
                  </label>
                  <textarea
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    rows={3}
                    placeholder="Add any notes for the reviewer..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm resize-none"
                  />
                </div>

                {submitError && (
                  <p className="mb-4 text-sm text-red-500">{submitError}</p>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Submit
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-6 flex items-center gap-3">
                <CheckCircle2 size={22} className="text-green-600 shrink-0" />
                <p className="text-sm font-medium text-green-800">
                  This project has been submitted and marked as completed.
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
