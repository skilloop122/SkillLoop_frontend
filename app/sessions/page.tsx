"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Clock } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useRouter } from "next/navigation";

type UpcomingSession = {
  id: string;
  badge: string;
  badgeClassName: string;
  title: string;
  direction: string;
  time: string;
  image: string;
  imageAlt: string;
};

type PendingSession = {
  id: string;
  type: "sent" | "received";
  badge?: string;
  name: string;
  title: string;
  direction: string;
  time: string;
  image: string;
  imageAlt: string;
  upcomingBadge: string;
  upcomingBadgeClassName: string;
};

type CanceledSession = PendingSession & {
  status: "Cancelled" | "Rejected";
};

export default function SessionsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Pending");
  const [toast, setToast] = useState("");

  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([
    {
      id: "upcoming-1",
      badge: "Teaching",
      badgeClassName: "bg-[#ccebf8] text-[#0ea5e9]",
      title: "UI/UX Design",
      direction: "to Sander James",
      time: "Today, 9:00AM",
      image: "/hero_collaboration.png",
      imageAlt: "Teaching session",
    },
    {
      id: "upcoming-2",
      badge: "Learning",
      badgeClassName: "bg-[#bbf7d0] text-[#22c55e]",
      title: "Frontend",
      direction: "from Sander James",
      time: "Today, 3:00PM",
      image: "/james_klin.png",
      imageAlt: "Learning session",
    },
  ]);

  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([
    {
      id: "pending-1",
      type: "sent",
      badge: "Learning",
      name: "James klin",
      title: "Frontend",
      direction: "From James klin",
      time: "Tomorrow, 1:00 pm",
      image: "/james_klin.png",
      imageAlt: "James klin",
      upcomingBadge: "Learning",
      upcomingBadgeClassName: "bg-[#bbf7d0] text-[#22c55e]",
    },
    {
      id: "pending-2",
      type: "received",
      name: "John Doe",
      title: "UI/UX Design",
      direction: "from John Doe",
      time: "Wednesday, 9:00 am",
      image: "/james_klin.png",
      imageAlt: "John Doe",
      upcomingBadge: "Teaching",
      upcomingBadgeClassName: "bg-[#ccebf8] text-[#0ea5e9]",
    },
  ]);

  const [canceledSessions, setCanceledSessions] = useState<CanceledSession[]>([]);

  const tabs = ["Upcoming", "Pending", "Completed", "Canceled"];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const cancelRequest = (session: PendingSession) => {
    setPendingSessions((sessions) =>
      sessions.filter((item) => item.id !== session.id)
    );

    setCanceledSessions((sessions) => [
      ...sessions,
      {
        ...session,
        status: "Cancelled",
      },
    ]);

    setActiveTab("Canceled");
    showToast("Request cancelled and moved to canceled.");
  };

  const declineRequest = (session: PendingSession) => {
    setPendingSessions((sessions) =>
      sessions.filter((item) => item.id !== session.id)
    );

    setCanceledSessions((sessions) => [
      ...sessions,
      {
        ...session,
        status: "Rejected",
      },
    ]);

    setActiveTab("Canceled");
    showToast("Request rejected and moved to canceled.");
  };

  const acceptRequest = (session: PendingSession) => {
    setPendingSessions((sessions) =>
      sessions.filter((item) => item.id !== session.id)
    );

    setUpcomingSessions((sessions) => [
      ...sessions,
      {
        id: `upcoming-${session.id}`,
        badge: session.upcomingBadge,
        badgeClassName: session.upcomingBadgeClassName,
        title: session.title,
        direction: session.direction,
        time: session.time,
        image: session.image,
        imageAlt: session.imageAlt,
      },
    ]);

    setActiveTab("Upcoming");
    showToast("Session accepted and moved to upcoming.");
  };

  return (
    <div className="min-h-screen bg-white font-sans flex">
      <SideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <div className="mb-8">
            <h1 className="text-[32px] md:text-4xl font-semibold text-black tracking-tight mb-2">
              My Sessions
            </h1>
            <p className="text-[15px] text-slate-700 leading-snug">
              Manage your upcoming requests and sessions in one place.
            </p>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 py-2 rounded-[8px] text-[14px] font-medium transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
                  activeTab === tab
                    ? "bg-[#0ea5e9] text-white"
                    : "bg-[#f1f5f9] text-slate-700 hover:bg-[#e2e8f0]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[4px] border border-[#bae6fd] bg-white p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <div className="relative mt-9 h-[82px] w-[88px] shrink-0 overflow-hidden rounded-[4px] bg-slate-100">
                      <Image src={session.image} alt={session.imageAlt} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className={`inline-block rounded-[2px] px-3 py-1 text-[14px] font-medium ${session.badgeClassName}`}>
                          {session.badge}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-semibold text-black">3.8</span>
                          <span className="text-[13px] font-medium text-slate-500">(72)</span>
                        </div>
                      </div>

                      <h3 className="mb-4 text-[15px] font-medium leading-tight text-black">
                        {session.title}
                      </h3>

                      <p className="mb-4 text-[18px] font-normal leading-tight text-black">
                        {session.direction}
                      </p>

                      <div className="mb-3 flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-5 w-5" strokeWidth={1.8} />
                        <span className="text-[17px] font-normal">{session.time}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push("/sessions/live")}
                        className="w-full rounded-[4px] bg-[#0ea5e9] py-1.5 text-[16px] font-medium text-white shadow-[0_8px_18px_rgba(14,165,233,0.28)] transition-colors hover:bg-sky-500"
                      >
                        Join Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Pending" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white border border-[#0ea5e9]/30 rounded-[12px] p-4 shadow-sm flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-[76px] h-[76px] rounded-[8px] overflow-hidden shrink-0 bg-slate-100 mt-2">
                      <Image src={session.image} alt={session.imageAlt} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        {session.type === "received" ? (
                          <h3 className="text-[16px] font-medium text-black leading-tight">
                            {session.name}
                          </h3>
                        ) : (
                          <span className="inline-block bg-[#dcfce7] text-[#16a34a] text-[12px] font-medium px-2.5 py-0.5 rounded-[4px]">
                            {session.badge}
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-semibold text-black">3.8</span>
                          <span className="text-[13px] font-medium text-slate-500">(72)</span>
                        </div>
                      </div>

                      {session.type === "received" && (
                        <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[12px] font-medium px-2.5 py-0.5 rounded-[4px] mb-1">
                          Wants to learn
                        </span>
                      )}

                      <h3 className="text-[15px] font-medium text-black leading-snug mb-1.5">
                        {session.title}
                      </h3>

                      <p className="text-[15px] text-black mb-1.5">
                        {session.direction}
                      </p>

                      <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                        <Clock className="w-4 h-4" />
                        <span className="text-[13px] font-medium">Proposed time</span>
                      </div>

                      <p className="text-[13px] text-slate-500 font-medium">
                        {session.time}
                      </p>
                    </div>
                  </div>

                  {session.type === "sent" ? (
                    <button
                      type="button"
                      onClick={() => cancelRequest(session)}
                      className="mt-auto w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2 rounded-[8px] text-[15px] transition-colors"
                    >
                      Cancel Request
                    </button>
                  ) : (
                    <div className="mt-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => acceptRequest(session)}
                        className="flex-1 bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2 rounded-[8px] text-[15px] transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => declineRequest(session)}
                        className="flex-1 bg-white border border-[#0ea5e9] text-black font-medium py-2 rounded-[8px] text-[15px] hover:bg-slate-50 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {pendingSessions.length === 0 && (
                <div className="md:col-span-2 flex flex-col items-center justify-center py-20 text-slate-500">
                  <p className="text-lg font-medium">No pending sessions yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Canceled" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canceledSessions.map((session) => (
                <div
                  key={`${session.id}-${session.status}`}
                  className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm flex flex-col opacity-90"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-[76px] h-[76px] rounded-[8px] overflow-hidden shrink-0 bg-slate-100 mt-2 grayscale">
                      <Image src={session.image} alt={session.imageAlt} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <span
                          className={`inline-block text-[12px] font-medium px-2.5 py-0.5 rounded-[4px] ${
                            session.status === "Cancelled"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {session.status}
                        </span>

                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-semibold text-black">3.8</span>
                          <span className="text-[13px] font-medium text-slate-500">(72)</span>
                        </div>
                      </div>

                      <h3 className="text-[15px] font-medium text-black leading-snug mb-1.5">
                        {session.title}
                      </h3>

                      <p className="text-[15px] text-black mb-1.5">
                        {session.direction}
                      </p>

                      <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                        <Clock className="w-4 h-4" />
                        <span className="text-[13px] font-medium">Proposed time</span>
                      </div>

                      <p className="text-[13px] text-slate-500 font-medium">
                        {session.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {canceledSessions.length === 0 && (
                <div className="md:col-span-2 flex flex-col items-center justify-center py-20 text-slate-500">
                  <p className="text-lg font-medium">
                    No canceled or rejected sessions yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Completed" && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <p className="text-lg font-medium">No completed sessions yet.</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}