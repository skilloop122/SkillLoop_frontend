"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  Plus,
  Users,
  Zap,
  Trash2,
  Loader2,
} from "lucide-react";
import { AdminSideNav } from "@/components/AdminSideNav";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminSessionStore } from "@/lib/adminSessionStore";

export default function SessionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { hydrated, token } = useAdminAuthStore();
  const { sessions, fetchSessions, loading } = useAdminSessionStore();

  // Fetch sessions on mount if not already loaded
  useEffect(() => {
    if (hydrated && token && sessions.length === 0) {
      fetchSessions(token);
    }
  }, [hydrated, token, sessions.length, fetchSessions]);

  // Derive loading state — no setState needed
  const localLoading = !hydrated || (!!token && sessions.length === 0 && loading);

  if (!hydrated || localLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) {
    router.push("/admin/login");
    return null;
  }

  const session = sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <div className="min-h-screen bg-sky-100 md:bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Session Not Found</h2>
          <button onClick={() => router.back()} className="text-sky-500 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const req = session.request;
  const title = req?.skillListing?.title || "Untitled Session";
  const category = req?.skillListing?.category || "Unknown Category";
  const status = session.completedAt ? "Completed" : "Upcoming";
  const isCompleted = status === "Completed";
  
  const createdDate = session.createdAt ? new Date(session.createdAt) : null;
  const dateStr = createdDate ? createdDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';
  const timeStr = createdDate ? createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const requester = session.requester;
  const reqName = requester?.profile ? `${requester.profile.firstName} ${requester.profile.lastName}` : "Unknown Requester";
  const reqEmail = requester?.email || "";
  const reqInitials = requester?.profile ? `${requester.profile.firstName?.[0] || ""}${requester.profile.lastName?.[0] || ""}` : "?";

  const provider = session.provider;
  const provName = provider?.profile ? `${provider.profile.firstName} ${provider.profile.lastName}` : "Unknown Provider";
  const provEmail = provider?.email || "";
  const provInitials = provider?.profile ? `${provider.profile.firstName?.[0] || ""}${provider.profile.lastName?.[0] || ""}` : "?";

  return (
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-6 h-10 w-10 rounded-lg border bg-white flex items-center justify-center shadow-sm hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Title + badges */}
          <div className="mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Users size={13} /> 1-on-1
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Calendar size={13} /> {category}
              </span>
            </div>
          </div>

          {/* Session ID + status */}
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-6">
            <p className="text-xs text-gray-400 font-medium">Session ID</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{session.id}</span>
              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => navigator.clipboard.writeText(session.id)}>
                <Copy size={15} />
              </button>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isCompleted ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              <CheckCircle size={12} />
              {status}
            </span>
            <span className="text-xs text-gray-500">
              {isCompleted ? "This session has been completed." : "This session is upcoming."}
            </span>
          </div>

          {/* Info bar */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 gap-4 sm:gap-0">
              <div className="flex items-center gap-4 pb-4 sm:pb-0 sm:pr-6">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-sky-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Date and Time</p>
                  <p className="text-sm font-bold text-gray-900">{dateStr}</p>
                  <p className="text-xs text-gray-500">{timeStr}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 py-4 sm:py-0 sm:px-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Duration</p>
                  <p className="text-sm font-bold text-gray-900">1 hour session.</p>
                  <p className="text-xs text-gray-500">(60 minutes)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Video size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Session Type</p>
                  <p className="text-sm font-bold text-gray-900">Virtual Meeting</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Overview */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Session Overview</h2>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              An interactive session covering {title}. Users {reqName} and {provName} will participate.
            </p>
          </div>

          {/* Timeline + Right Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

            {/* Timeline */}
            <div className="lg:col-span-3 bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-8">Timeline</h2>
              <div className="relative pl-12 space-y-10 before:absolute before:left-[1.35rem] before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">

                {[
                  {
                    icon: Plus,
                    bg: "bg-sky-500",
                    title: "Session Created",
                    date: dateStr,
                    time: timeStr,
                    desc: `Session was created on the platform.`,
                  },
                  ...(isCompleted ? [{
                    icon: CheckCircle,
                    bg: "bg-green-500",
                    title: "Session Completed",
                    date: session.completedAt ? new Date(session.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : dateStr,
                    time: session.completedAt ? new Date(session.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : timeStr,
                    desc: `Session has been completed.`,
                  }] : [])
                ].map((step) => (
                  <div key={step.title} className="relative flex gap-4">
                    <div className={`absolute -left-12 w-9 h-9 rounded-full ${step.bg} text-white flex items-center justify-center shadow z-10 shrink-0`}>
                      <step.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                        <span className="text-xs text-gray-400">{step.date}</span>
                        <span className="text-[10px] text-gray-400">{step.time}</span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel: Users + Quick Actions */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Requester */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Requester</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0 uppercase">{reqInitials}</div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{reqName}</p>
                      <p className="text-xs text-gray-500">{reqEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Provider</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm shrink-0 uppercase">{provInitials}</div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{provName}</p>
                      <p className="text-xs text-gray-500">{provEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-5 text-gray-900">
                  <Zap size={18} className="text-amber-400 fill-amber-400" /> Quick Action
                </h3>
                <div className="space-y-4 text-sm">
                  <button className="flex items-center gap-3 text-red-600 hover:text-red-700 transition w-full text-left font-medium">
                    <Trash2 size={16} />
                    Delete session history.
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Session Details */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Session Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 text-sm">
              {[
                { label: "Skill", value: title },
                { label: "Session Type", value: "1-on-1 Session" },
                { label: "Created on", value: `${dateStr} at ${timeStr}` },
                { label: "Session ID", value: session.id },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isCompleted ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  <CheckCircle size={11} />
                  {status}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
