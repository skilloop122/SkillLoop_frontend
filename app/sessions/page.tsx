"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, Clock, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useRouter } from "next/navigation";
import { useRequestStore } from "../../lib/requestStore";
import { useAuthStore } from "../../lib/authStore";

export default function SessionsPage() {
  const router = useRouter();
  const { hydrated, token } = useAuthStore();
  const { sentRequests, receivedRequests, sessions, loading, fetchRequests, fetchSessions, updateRequestStatus, completeSession, submitFeedback } = useRequestStore();

  const [activeTab, setActiveTab] = useState("Pending");
  const [toast, setToast] = useState("");
  const [feedbackModal, setFeedbackModal] = useState<{ sessionId: string } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (hydrated && token) {
      fetchRequests();
      fetchSessions();
    }
  }, [hydrated, token, fetchRequests, fetchSessions]);

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

  const handleCompleteSession = async (sessionId: string) => {
    setCompletingId(sessionId);
    const result = await completeSession(sessionId);
    setCompletingId(null);
    if (result.success) {
      showToast("Session marked as completed!");
      loadData();
    } else {
      showToast(result.message || "Failed to complete session.");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModal) return;
    setFeedbackLoading(true);
    const result = await submitFeedback(feedbackModal.sessionId, { rating: feedbackRating, comment: feedbackComment });
    setFeedbackLoading(false);
    if (result.success) {
      showToast("Feedback submitted!");
      setFeedbackModal(null);
      setFeedbackRating(5);
      setFeedbackComment("");
      loadData();
    } else {
      showToast(result.message || "Failed to submit feedback.");
    }
  };

  const getOtherParty = (item: {
    type?: string;
    provider?: { id: string; email?: string; profile?: { firstName?: string; lastName?: string } };
    requester?: { id: string; email?: string; profile?: { firstName?: string; lastName?: string } };
  }) => {
    const other = item.type === "sent" ? item.provider : item.requester;
    const name = [other?.profile?.firstName, other?.profile?.lastName].filter(Boolean).join(" ") || other?.email || "User";
    return { name, email: other?.email || "" };
  };

  const pendingRequests = [
    ...sentRequests.filter(r => r.status?.toLowerCase() === "pending").map(r => ({ ...r, type: "sent" })),
    ...receivedRequests.filter(r => r.status?.toLowerCase() === "pending").map(r => ({ ...r, type: "received" }))
  ];

  const upcomingRequests = [
    ...sentRequests.filter(r => r.status?.toLowerCase() === "accepted").map(r => ({ ...r, type: "sent" as const })),
    ...receivedRequests.filter(r => r.status?.toLowerCase() === "accepted").map(r => ({ ...r, type: "received" as const }))
  ];

  const upcomingSessions = upcomingRequests.map((req) => {
    const sessionMatch = sessions.find(s => s.requestId === req.id || s.request?.id === req.id);
    return {
      ...req,
      session: {
        ...req.session,
        ...(sessionMatch ? {
          zoomMeetingId: sessionMatch.zoomMeetingId || req.session?.zoomMeetingId,
          zoomPassword: sessionMatch.zoomPassword || req.session?.zoomPassword,
          zoomJoinUrl: sessionMatch.zoomJoinUrl || req.session?.zoomJoinUrl,
        } : {}),
      },
    };
  });

  const canceledSessions = [
    ...sentRequests.filter(r => r.status?.toLowerCase() === "rejected" || r.status?.toLowerCase() === "cancelled").map(r => ({ ...r, type: "sent" })),
    ...receivedRequests.filter(r => r.status?.toLowerCase() === "rejected" || r.status?.toLowerCase() === "cancelled").map(r => ({ ...r, type: "received" }))
  ];

  const completedSessions = [
    ...sentRequests.filter(r => r.status?.toLowerCase() === "completed").map(r => ({ ...r, type: "sent" })),
    ...receivedRequests.filter(r => r.status?.toLowerCase() === "completed").map(r => ({ ...r, type: "received" }))
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="rounded-lg border border-[#bae6fd] bg-white p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-20">
                      <Image src={session.type === "sent" ? (session.provider?.profile?.avatarUrl || "/james_klin.png") : (session.requester?.profile?.avatarUrl || "/james_klin.png")} alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-sky-50 text-sky-500 text-xs font-bold px-2 py-1 rounded">Confirmed</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">4.8</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 wrap-break-word">{session.skillListing?.title || "Skill Session"}</h3>
                      <p className="text-sm font-semibold text-slate-700 leading-tight">
                        {getOtherParty(session).name}
                      </p>
                      <p className="text-xs text-slate-400 mb-3 truncate">{getOtherParty(session).email}</p>
                      <div className="flex items-center gap-1.5 text-slate-400 mb-4 flex-wrap">
                        <Clock size={14} />
                        <span className="text-xs font-medium">{session.proposedDate} at {session.proposedTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(session.session?.zoomMeetingId || session.session?.zoomJoinUrl) && (
                          <>
                            {session.session?.zoomJoinUrl ? (
                              <button
                                onClick={() => window.open(session.session!.zoomJoinUrl, "_blank")}
                                className="flex-1 min-w-[130px] py-2 border border-sky-300 text-sky-600 rounded-lg text-sm font-bold hover:bg-sky-50 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <ExternalLink size={14} />
                                Open in Zoom
                              </button>
                            ) : null}
                            {session.session?.zoomMeetingId ? (
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  if (session.session?.zoomMeetingId) params.set("meetingId", session.session.zoomMeetingId);
                                  if (session.session?.zoomPassword) params.set("password", session.session.zoomPassword);
                                  if (session.skillListing?.title) params.set("topic", session.skillListing.title);
                                  router.push("/sessions/live?" + params.toString());
                                }}
                                className="flex-1 min-w-[130px] py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-sky-400 transition-colors flex items-center justify-center gap-1.5"
                              >
                                Join in App
                              </button>
                            ) : null}
                          </>
                        )}
                        <button
                          onClick={() => handleCompleteSession(session.session?.id || session.id)}
                          disabled={completingId === (session.session?.id || session.id)}
                          className="flex-1 min-w-[130px] py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {completingId === (session.session?.id || session.id) ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Mark Complete
                        </button>
                        <button
                          onClick={() => setFeedbackModal({ sessionId: session.session?.id || session.id })}
                          className="flex-1 min-w-[130px] py-2 border border-amber-300 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors"
                        >
                          Leave Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && <div className="py-10 text-center text-slate-400">No upcoming sessions.</div>}
            </div>
          )}

          {activeTab === "Pending" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image src={request.type === "sent" ? (request.provider?.profile?.avatarUrl || "/james_klin.png") : (request.requester?.profile?.avatarUrl || "/james_klin.png")} alt="Profile" fill className="object-cover" />
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
                      <h3 className="font-bold text-slate-900 mb-0.5">{request.skillListing?.title || "Skill Session"}</h3>
                      <p className="text-sm font-semibold text-slate-700 leading-tight">
                        {getOtherParty(request).name}
                      </p>
                      <p className="text-xs text-slate-400 mb-1">{getOtherParty(request).email}</p>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={14} />
                        <span className="text-xs font-medium">{request.proposedDate} at {request.proposedTime}</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {canceledSessions.map((session) => (
                <div key={session.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm opacity-60">
                   <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 grayscale">
                      <Image src={session.type === "sent" ? (session.provider?.profile?.avatarUrl || "/james_klin.png") : (session.requester?.profile?.avatarUrl || "/james_klin.png")} alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">{session.status}</span>
                      <h3 className="font-bold text-slate-900 mb-0.5">{session.skillListing?.title || "Skill Session"}</h3>
                      <p className="text-sm font-semibold text-slate-700 leading-tight">{getOtherParty(session).name}</p>
                      <p className="text-xs text-slate-400">{getOtherParty(session).email}</p>
                      <p className="text-xs text-slate-400 mt-1">{session.proposedDate} at {session.proposedTime}</p>
                    </div>
                   </div>
                </div>
              ))}
              {canceledSessions.length === 0 && <div className="py-10 text-center text-slate-400">No canceled sessions.</div>}
            </div>
          )}

          {activeTab === "Completed" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedSessions.map((session) => (
                <div key={session.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                   <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image src={session.type === "sent" ? (session.provider?.profile?.avatarUrl || "/james_klin.png") : (session.requester?.profile?.avatarUrl || "/james_klin.png")} alt="Profile" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">Completed</span>
                      <h3 className="font-bold text-slate-900 mb-0.5">{session.skillListing?.title || "Skill Session"}</h3>
                      <p className="text-sm font-semibold text-slate-700 leading-tight">{getOtherParty(session).name}</p>
                      <p className="text-xs text-slate-400">{getOtherParty(session).email}</p>
                      <p className="text-xs text-slate-400 mt-1">{session.proposedDate} at {session.proposedTime}</p>
                    </div>
                   </div>
                </div>
              ))}
              {completedSessions.length === 0 && <div className="py-10 text-center text-slate-400">No completed sessions yet.</div>}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 bottom-24 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-2xl">{toast}</div>
      )}

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Leave Feedback</h2>
            <p className="text-sm text-slate-500 mb-5">Rate your session experience</p>

            <div className="flex items-center gap-2 justify-center mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={star <= feedbackRating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your experience (optional)"
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none mb-5 transition-all"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(""); }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={feedbackLoading}
                className="flex-1 py-3 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {feedbackLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
