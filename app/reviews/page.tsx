"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Star, Loader2, MessageSquare } from "lucide-react";
import { SideNav } from "../../components/SideNav";
import { BottomNav } from "../../components/BottomNav";
import { UserAvatar } from "../../components/UserAvatar";
import { useAuthStore } from "../../lib/authStore";
import { useUserFeedbackStore } from "../../lib/userFeedbackStore";
import type { ReviewItem, ReviewGiver } from "../../lib/userFeedbackStore";

function sourceLabel(sourceType?: string): string {
  const key = (sourceType ?? "").toUpperCase();
  if (key === "SESSION") return "Session";
  if (key === "PROJECT") return "Project";
  return sourceType ?? "";
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function giverName(giver?: ReviewGiver): string {
  if (!giver) return "Anonymous";
  const name = [giver.firstName, giver.lastName].filter(Boolean).join(" ");
  return name || "Anonymous";
}

function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const { hydrated, token } = useAuthStore();
  const { summary, byUser, fetchMyFeedback, fetchFeedbackForUser } =
    useUserFeedbackStore();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/signin");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated || !token) return;
    (async () => {
      setLocalLoading(true);
      if (id) {
        await fetchFeedbackForUser(id);
      } else if (!summary) {
        await fetchMyFeedback();
      }
      setLocalLoading(false);
    })();
  }, [hydrated, token, id, summary, fetchMyFeedback, fetchFeedbackForUser]);

  const data = id ? byUser[id] : summary;
  const average = data?.averageRating ?? null;
  const count = data?.totalCount ?? 0;
  const reviews: ReviewItem[] = data?.reviews ?? [];
  const distribution = data?.ratingDistribution;

  if (!hydrated || localLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

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

          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              {id ? "Reviews & Ratings" : "My Reviews & Ratings"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {id
                ? "Ratings left for this user by other skill-exchange participants."
                : "What other participants rated your sessions and projects."}
            </p>
          </div>

          {count === 0 && reviews.length === 0 ? (
            <div className="bg-white border rounded-2xl p-10 text-center text-gray-400 shadow-sm">
              <Star size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No reviews yet.</p>
              <p className="text-xs mt-1">
                Once participants leave feedback, it will show up here.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-bold text-gray-900">
                      {average !== null ? average.toFixed(1) : "—"}
                    </p>
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i <= Math.round(average ?? 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {count} review{count === 1 ? "" : "s"}
                    </p>
                  </div>

                  {distribution && (
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const value = distribution[String(star)] ?? 0;
                        const pct =
                          count > 0 ? Math.round((value / count) * 100) : 0;
                        return (
                          <div
                            key={star}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="w-8 font-semibold text-gray-600 shrink-0">
                              {star}★
                            </span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right text-gray-500 shrink-0">
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map((review, idx) => (
                  <div
                    key={review.id || idx}
                    className="bg-white border rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          avatarUrl={review.giver?.avatarUrl}
                          firstName={review.giver?.firstName}
                          lastName={review.giver?.lastName}
                          className="w-11 h-11 rounded-full text-sm shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {giverName(review.giver)}
                          </p>
                          {review.giver?.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {review.giver.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i <= (review.rating ?? 0)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      {review.comment || "No comment."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {sourceLabel(review.sourceType) && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                          {sourceLabel(review.sourceType)}
                        </span>
                      )}
                      {review.projectTitle && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 truncate max-w-full">
                          {review.projectTitle}
                        </span>
                      )}
                      {review.createdAt && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatDate(review.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="bg-white border rounded-2xl p-8 text-center text-gray-400 shadow-sm">
                    <MessageSquare
                      size={32}
                      className="mx-auto mb-2 opacity-40"
                    />
                    <p className="text-sm">Review details are unavailable.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <ReviewsContent />
    </Suspense>
  );
}