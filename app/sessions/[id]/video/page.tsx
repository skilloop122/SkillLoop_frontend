"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, Star } from "lucide-react";
import { useAuthStore } from "../../../../lib/authStore";
import { useRequestStore } from "../../../../lib/requestStore";
import { SessionVideoRoom } from "../../../../components/SessionVideoRoom";

export default function SessionVideoPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;
  const isHost = useSearchParams().get("host") === "1";

  const { hydrated, token } = useAuthStore();
  const { completeSession, submitFeedback } = useRequestStore();

  const [completing, setCompleting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleComplete = async () => {
    if (!sessionId || completing || showFeedback) return;
    setCompleting(true);
    const result = await completeSession(sessionId, "completed");
    setCompleting(false);
    if (result.success) {
      setShowFeedback(true);
    } else {
      router.push("/sessions");
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    await submitFeedback(sessionId, { rating, comment });
    setSubmittingFeedback(false);
    router.push("/sessions");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!token) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between">
        <button
          onClick={() => router.push("/sessions")}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to sessions
        </button>
        {!showFeedback && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {completing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Complete session
          </button>
        )}
      </div>

      <div className="mx-auto max-w-5xl">
        {showFeedback ? (
          <div className="rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Session complete</h2>
            <p className="text-sm text-slate-500 mb-6">How was your experience?</p>

            <div className="mb-6 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <Star
                    size={32}
                    className={
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-6 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />

            <button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-bold text-white hover:bg-sky-400 transition-colors disabled:opacity-50"
            >
              {submittingFeedback && <Loader2 size={14} className="animate-spin" />}
              Submit feedback
            </button>
          </div>
        ) : (
          <SessionVideoRoom sessionId={sessionId} isHost={isHost} onSessionComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
