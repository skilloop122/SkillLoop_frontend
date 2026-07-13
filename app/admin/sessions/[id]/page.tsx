"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  Plus,
  Users,
  Star,
  Zap,
  MessageCircle,
  HistoryIcon,
  Trash2,
  Link2,
} from "lucide-react";
import { AdminSideNav } from "@/components/AdminSideNav";
import { useAdminAuthStore } from "@/lib/adminAuthStore";

export default function SessionDetailsPage() {
  const router = useRouter();
  const { hydrated, token } = useAdminAuthStore();

  if (!hydrated) return null;
  if (!token) {
    router.push("/admin/login");
    return null;
  }

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
            <h1 className="text-3xl font-bold text-gray-900">UI Design Fundamentals</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Users size={13} /> 1-on-1
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Calendar size={13} /> Session
              </span>
            </div>
          </div>

          {/* Session ID + status */}
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-6">
            <p className="text-xs text-gray-400 font-medium">Session ID</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">SSE-2026-0124</span>
              <button className="text-gray-400 hover:text-gray-600 transition">
                <Copy size={15} />
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
              <CheckCircle size={12} />
              Completed
            </span>
            <span className="text-xs text-gray-500">This session has been completed.</span>
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
                  <p className="text-sm font-bold text-gray-900">June 20, 2026</p>
                  <p className="text-xs text-gray-500">10:30 AM – 11:30 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 py-4 sm:py-0 sm:px-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Duration</p>
                  <p className="text-sm font-bold text-gray-900">1 hours session.</p>
                  <p className="text-xs text-gray-500">(60 minutes)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Video size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Session Type</p>
                  <p className="text-sm font-bold text-gray-900">Zoom Meeting</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Overview */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Session Overview</h2>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              An interactive session covering the core principles of UI/UX Design. We discussed layouts, typography, color theory and real world examples.
            </p>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Session Pointers</h3>
            <ul className="space-y-2">
              {[
                "Introduction to UI Design Principles",
                "Layouts and Grid systems",
                "Typography and Color theory",
                "Feedback and Q&A",
              ].map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={15} className="text-sky-400 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
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
                    title: "Request Created",
                    date: "June 15,2026",
                    time: "12:30 PM",
                    desc: "Sarah created this request.",
                  },
                  {
                    icon: Users,
                    bg: "bg-sky-400",
                    title: "Session Created",
                    date: "June 15,2026",
                    time: "12:30 PM",
                    desc: "Session between Sarah and Jamie has been created.",
                  },
                  {
                    icon: Video,
                    bg: "bg-sky-500",
                    title: "Session Started",
                    date: "June 17,2026",
                    time: "12:30 PM",
                    desc: "Session between Sarah and Jamie is currently ongoing.",
                  },
                  {
                    icon: CheckCircle,
                    bg: "bg-green-500",
                    title: "Session Completed",
                    date: "June 18,2026",
                    time: "11:30 AM",
                    desc: "Session between Sarah and Jamie have been completed.",
                  },
                  {
                    icon: Star,
                    bg: "bg-amber-400",
                    title: "Feedback Submitted",
                    date: "June 20,2026",
                    time: "10:30 AM",
                    desc: "Sarah has given her feedback on her session with Jamie.",
                  },
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

            {/* Right panel: Goals + Users + Quick Actions */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Goals */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-sky-400" /> Goals
                </h3>
                <ul className="space-y-2">
                  {[
                    "Introduction to UI Design Principles",
                    "Layouts and Grid systems",
                    "Typography and Color theory",
                    "Feedback and Q&A",
                  ].map((g) => (
                    <li key={g} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle size={13} className="text-sky-400 shrink-0 mt-0.5" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requester */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Requester</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">HS</div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Hannah Stevenson</p>
                      <p className="text-xs text-gray-500">stevensonhannah01@gmail.com</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mb-4 py-1.5 rounded-full border border-sky-200 text-sky-500 text-xs font-semibold hover:bg-sky-50 transition">
                  View Profile
                </button>
                <div className="flex items-center justify-between text-center pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-bold flex items-center justify-center gap-1"><span className="text-amber-400">★</span> 4.8</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Avg. Rating</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold">12</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Completed Sessions</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold">10</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Reviews</p>
                  </div>
                </div>
                <div className="flex justify-center mt-3">
                  <Link2 size={18} className="text-gray-300" />
                </div>
              </div>

              {/* Receiver */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Receiver</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm shrink-0">JL</div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Jamie Lecthin</p>
                      <p className="text-xs text-gray-500">lecthinjamie01@gmail.com</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mb-4 py-1.5 rounded-full border border-sky-200 text-sky-500 text-xs font-semibold hover:bg-sky-50 transition">
                  View Profile
                </button>
                <div className="flex items-center justify-between text-center pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-bold flex items-center justify-center gap-1"><span className="text-amber-400">★</span> 4.7</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Avg. Rating</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold">15</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Completed Sessions</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold">12</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Reviews</p>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-5 text-gray-900">
                  <Zap size={18} className="text-amber-400 fill-amber-400" /> Quick Action
                </h3>
                <div className="space-y-4 text-sm">
                  <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                    <MessageCircle size={16} className="text-sky-400" />
                    Message Users.
                  </button>
                  <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                    <HistoryIcon size={16} className="text-amber-400" />
                    View Session History.
                  </button>
                  <button className="flex items-center gap-3 text-gray-700 hover:text-black transition w-full text-left font-medium">
                    <Users size={16} className="text-sky-400" />
                    View users profile.
                  </button>
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
                { label: "Skill", value: "UI/UX Design" },
                { label: "Session Type", value: "1-on-1  Session" },
                { label: "Created on", value: "June 20, 2026 at 11:15 AM" },
                { label: "Session ID", value: "SSE-2026-0124" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <span className="text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                  <CheckCircle size={11} />
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="flex justify-center mb-6">
            <button className="px-10 py-3 rounded-xl bg-[#0ea5e9] text-white font-semibold text-sm hover:bg-sky-600 transition shadow">
              Mark as Completed
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
