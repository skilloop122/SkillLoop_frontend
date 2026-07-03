"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Loader2,
  Star,
  TrendingUp,
  BarChart3,
  ThumbsUp,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();

  useEffect(() => {
    if (hydrated && token) {
      fetchMetrics(token);
    }
  }, [hydrated, token, fetchMetrics]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const ratingDist = metrics?.ratingDistribution ?? {};
  const totalFeedback = metrics?.overview?.totalFeedback ?? 0;
  const avgRating = metrics?.overview?.averageRating ?? 0;

  const ratingEntries = Object.entries(ratingDist)
    .map(([r, c]) => ({ rating: Number(r), count: c }))
    .sort((a, b) => b.rating - a.rating);

  const maxCount = Math.max(...ratingEntries.map((e) => e.count), 1);

  const positiveCount = ratingEntries.filter((e) => e.rating >= 4).reduce((a, b) => a + b.count, 0);
  const positiveRate = totalFeedback > 0 ? ((positiveCount / totalFeedback) * 100).toFixed(0) : "0";

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">

          <AdminHeader
            title="Feedback"
            subtitle="User ratings and feedback analysis"
          >
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <MessageSquare size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metricsLoading ? "—" : totalFeedback} Reviews
              </span>
            </div>
          </AdminHeader>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Total Feedback",
                value: totalFeedback,
                icon: MessageSquare,
                color: "text-sky-500",
                bg: "bg-sky-50",
              },
              {
                label: "Avg Rating",
                value: avgRating ? avgRating.toFixed(1) : "—",
                icon: Star,
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
              {
                label: "Positive Rate",
                value: `${positiveRate}%`,
                icon: ThumbsUp,
                color: "text-green-500",
                bg: "bg-green-50",
              },
            ].map((card) => (
              <div key={card.label} className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon size={22} className={card.color} />
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {metricsLoading ? <span className="text-gray-200 animate-pulse">—</span> : card.value}
                </p>
                {card.label === "Avg Rating" && !metricsLoading && avgRating > 0 && (
                  <div className="mt-2">
                    <StarRating value={avgRating} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">

            {/* Rating distribution */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <BarChart3 size={20} className="text-sky-500" />
                Rating Distribution
              </h2>
              {metricsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                </div>
              ) : ratingEntries.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Star size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No rating data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ratingEntries.map((entry) => {
                    const pct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
                    return (
                      <div key={entry.rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16 shrink-0">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-semibold text-gray-700">{entry.rating}</span>
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 w-8 text-right">{entry.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Feedback overview panel */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <TrendingUp size={20} className="text-sky-500" />
                Feedback Overview
              </h2>
              <div className="space-y-0 divide-y divide-gray-100">
                {[
                  { label: "5 Star Reviews", value: ratingDist["5"] ?? 0 },
                  { label: "4 Star Reviews", value: ratingDist["4"] ?? 0 },
                  { label: "3 Star Reviews", value: ratingDist["3"] ?? 0 },
                  { label: "2 Star or Below", value: (ratingDist["2"] ?? 0) + (ratingDist["1"] ?? 0) },
                  { label: "Total Submitted", value: totalFeedback },
                  {
                    label: "Avg Score",
                    value: avgRating ? `${avgRating.toFixed(2)} / 5.00` : "—",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {metricsLoading ? "—" : row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Placeholder for detailed feedback list */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Recent Feedback</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Detailed list coming soon
              </span>
            </div>
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Individual feedback records</p>
              <p className="text-xs mt-1">Full feedback list will appear here once the API endpoint is connected</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
