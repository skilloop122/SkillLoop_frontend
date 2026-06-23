"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { Bell, Settings, Calendar, FileText, Star, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useAuthStore } from "../../lib/authStore";
import { useProfileStore } from "../../lib/profileStore";
import { useRequestStore } from "../../lib/requestStore";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { user, hydrated, token } = useAuthStore();
  const { profile, fetchProfile, loading: profileLoading } = useProfileStore();
  const { sentRequests, receivedRequests, loading: requestsLoading, fetchRequests, updateRequestStatus } = useRequestStore();

  const loadData = useCallback(() => {
    if (hydrated && token) {
      fetchProfile();
      fetchRequests();
    }
  }, [hydrated, token, fetchProfile, fetchRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const upcomingSessions = [
    ...sentRequests.filter(r => r.status === "accepted"),
    ...receivedRequests.filter(r => r.status === "accepted")
  ];

  const pendingReceived = receivedRequests.filter(r => r.status === "pending");
  const pendingSent = sentRequests.filter(r => r.status === "pending");
  const totalPending = pendingReceived.length + pendingSent.length;

  const handleStatusUpdate = async (id: string, status: "accepted" | "rejected" | "cancelled") => {
    const result = await updateRequestStatus(id, status);
    if (result.success) {
      loadData();
    }
  };

  if (!hydrated || (profileLoading && !profile) || (requestsLoading && !sentRequests.length && !receivedRequests.length)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  const firstName = profile?.firstName || user?.firstName || "Friend";

  return (
    <div className="min-h-screen bg-white font-sans flex text-black">
      <SideNav />
      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-10 md:pt-16">
          
          <div className="flex items-center justify-between mb-8 ">
            <h1 className="text-3xl font-semibold text-black tracking-tight">
              Hello, {firstName}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer">
                <Bell className="w-6 h-6 text-[#0ea5e9]" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0ea5e9] text-[10px] font-bold text-white border border-white">
                  {totalPending}
                </span>
              </div>
              <button onClick={() => router.push("/profile")} className="cursor-pointer">
                <Settings className="w-6 h-6 text-[#0ea5e9]" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#2dbcf8] to-[#60cbf9] rounded-[16px] p-5 shadow-sm text-white mb-10">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg font-medium leading-snug max-w-[190px]">
                What are you learning or teaching today?
              </h2>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 border border-white/40 rounded-full px-2.5 py-1 mb-1 bg-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-white">4.7 Rating</span>
                </div>
                <span className="text-[12px] text-white/80 font-medium px-1">
                  122 Reviews
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 border border-white/30 rounded-[8px] p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1.5 text-white/90">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Session</span>
                </div>
                <span className="text-xl font-bold leading-tight">{upcomingSessions.length}</span>
                <span className="text-[11px] font-medium text-white/90">Upcoming</span>
              </div>
              
              <div className="bg-white/20 border border-white/30 rounded-[8px] p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1.5 text-white/90">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-semibold">Request</span>
                </div>
                <span className="text-xl font-bold leading-tight">{totalPending}</span>
                <span className="text-[11px] font-medium text-white/90">Pending</span>
              </div>

              <div className="bg-white rounded-[12px] p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-slate-800">150</span>
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-slate-800 mb-1.5">
                  Skill Points
                </span>
                <Link href="/home/history" className="text-[11px] font-semibold text-[#0ea5e9] hover:underline">
                  View History
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[22px] font-medium text-black mb-4 tracking-tight">
              Upcoming Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
                <div key={session.id} className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100">
                      <Image src="/james_klin.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[11px] font-semibold px-2 py-0.5 rounded-[4px]">
                          Confirmed
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-semibold text-black">4.8</span>
                        </div>
                      </div>
                      <h3 className="text-[15px] font-semibold text-black leading-snug">
                        {session.skillName}
                      </h3>
                      <p className="text-[15px] text-black/80 mt-0.5">
                        {session.senderId === token ? "Request Sent" : "Request Received"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-[13px] font-medium">{session.proposedTime}</span>
                    </div>
                    <button onClick={() => router.push("/sessions/live")} className="bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 px-4 rounded-[6px] text-sm transition-colors">
                      Join Session
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 bg-slate-50 rounded-2xl text-center text-slate-400 font-medium">
                  No upcoming sessions today.
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-medium text-black tracking-tight">
                Recent Request
              </h2>
              <button onClick={() => router.push("/sessions")} className="text-[13px] font-medium text-black hover:underline">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {pendingReceived.length > 0 ? pendingReceived.slice(0, 4).map((request) => (
                <div key={request.id} className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100">
                      <Image src="/james_klin.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[11px] font-semibold px-2 py-0.5 rounded-[4px]">
                          Received
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-semibold text-black">4.8</span>
                        </div>
                      </div>
                      <h3 className="text-[15px] font-semibold text-black leading-snug">
                        {request.skillName}
                      </h3>
                      <p className="text-[15px] text-black/80 mt-0.5">
                        from Peer
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusUpdate(request.id, "accepted")} className="bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 px-6 rounded-[6px] text-sm transition-colors flex-1">
                      Accept
                    </button>
                    <button onClick={() => handleStatusUpdate(request.id, "rejected")} className="bg-white border border-[#0ea5e9] text-black font-medium py-1.5 px-6 rounded-[6px] text-sm hover:bg-slate-50 transition-colors flex-1">
                      Decline
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 bg-slate-50 rounded-2xl text-center text-slate-400 font-medium">
                  No new requests to show.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
