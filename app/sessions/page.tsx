"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, Clock, Loader2 } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useRouter } from "next/navigation";
import { useRequestStore } from "../../lib/requestStore";
import { useAuthStore } from "../../lib/authStore";

export default function SessionsPage() {
  const router = useRouter();
  const { hydrated, token } = useAuthStore();
  const { sentRequests, receivedRequests, loading, fetchRequests, updateRequestStatus } = useRequestStore();

  const [activeTab, setActiveTab] = useState("Pending");
  const [toast, setToast] = useState("");

  const loadData = useCallback(() => {
    if (hydrated && token) {
      fetchRequests();
    }
  }, [hydrated, token, fetchRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs = ["Upcoming", "Pending", "Completed", "Canceled"];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const handleStatusUpdate = async (id: string, status: "accepted" | "rejected" | "cancelled") => {
    const result = await updateRequestStatus(id, status);
    if (result.success) {
      showToast("Request updated successfully.");
      loadData();
    } else {
      showToast(result.message || "Failed to update request.");
    }
  };

  const pendingRequests = [
    ...sentRequests.filter(r => r.status === "pending").map(r => ({ ...r, type: "sent" })),
    ...receivedRequests.filter(r => r.status === "pending").map(r => ({ ...r, type: "received" }))
  ];

  const upcomingSessions = [
    ...sentRequests.filter(r => r.status === "accepted"),
    ...receivedRequests.filter(r => r.status === "accepted")
  ];

  const canceledSessions = [
    ...sentRequests.filter(r => r.status === "rejected" || r.status === "cancelled"),
    ...receivedRequests.filter(r => r.status === "rejected" || r.status === "cancelled")
  ];

  if (!hydrated || (loading && pendingRequests.length === 0 && upcomingSessions.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex text-black">
      <SideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black tracking-tight mb-2">My Sessions</h1>
            <p className="text-sm text-slate-700 leading-snug">Manage your upcoming requests and sessions in one place.</p>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-[#0ea5e9] text-white transition-colors shadow-sm" : "shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-[#f1f5f9] text-slate-700 hover:bg-[#e2e8f0] transition-colors"}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="rounded-lg border border-[#bae6fd] bg-white p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image src="/james_klin.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-sky-50 text-sky-500 text-xs font-bold px-2 py-1 rounded">Confirmed</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">4.8</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{session.skillName}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 mb-4">
                        <Clock size={14} />
                        <span className="text-xs font-medium">{session.proposedTime}</span>
                      </div>
                      <button onClick={() => router.push("/sessions/live")} className="w-full py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-colors">Join Session</button>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && <div className="py-10 text-center text-slate-400">No upcoming sessions.</div>}
            </div>
          )}

          {activeTab === "Pending" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image src="/james_klin.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className={request.type === "sent" ? "text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-amber-50 text-amber-600 tracking-wider" : "text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-sky-50 text-sky-600 tracking-wider"}>
                          {request.type === "sent" ? "Sent" : "Received"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">4.8</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-0.5">{request.skillName}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={14} />
                        <span className="text-xs font-medium">{request.proposedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.type === "sent" ? (
                      <button onClick={() => handleStatusUpdate(request.id, "cancelled")} className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancel Request</button>
                    ) : (
                      <>
                        <button onClick={() => handleStatusUpdate(request.id, "accepted")} className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-colors">Accept</button>
                        <button onClick={() => handleStatusUpdate(request.id, "rejected")} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Decline</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && <div className="py-10 text-center text-slate-400">No pending requests.</div>}
            </div>
          )}

          {activeTab === "Canceled" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canceledSessions.map((session) => (
                <div key={session.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm opacity-60">
                   <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 grayscale">
                      <Image src="/james_klin.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">{session.status}</span>
                      <h3 className="font-bold text-slate-900 mb-0.5">{session.skillName}</h3>
                      <p className="text-xs text-slate-400">{session.proposedTime}</p>
                    </div>
                   </div>
                </div>
              ))}
              {canceledSessions.length === 0 && <div className="py-10 text-center text-slate-400">No canceled sessions.</div>}
            </div>
          )}

          {activeTab === "Completed" && (
            <div className="py-10 text-center text-slate-400">No completed sessions yet.</div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 bottom-24 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-2xl">{toast}</div>
      )}

      <BottomNav />
    </div>
  );
}
