"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Loader2,
  Star,
  TrendingUp,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Search,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

interface FeedbackListing {
  id: string;
  feedback: string;
  session: string;
  rating: number;
  status: "published" | "hidden" | "pending";
  submitted: string;
}

const SAMPLE_FEEDBACK: FeedbackListing[] = [
  { id: "1", feedback: "Great session, very helpful!", session: "React Basics", rating: 5, status: "published", submitted: "2026-07-01" },
  { id: "2", feedback: "A bit too fast, but good.", session: "Advanced TypeScript", rating: 3, status: "published", submitted: "2026-07-02" },
  { id: "3", feedback: "The mentor was very knowledgeable.", session: "UI/UX Design", rating: 5, status: "pending", submitted: "2026-07-03" },
  { id: "4", feedback: "Not what I expected.", session: "Python for Beginners", rating: 2, status: "hidden", submitted: "2026-07-04" },
];

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
  const [feedbackList] = useState<FeedbackListing[]>(SAMPLE_FEEDBACK);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesSearch = item.feedback.toLowerCase().includes(search.toLowerCase()) || 
                            item.session.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesRating = ratingFilter === "all" || item.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [feedbackList, search, statusFilter, ratingFilter]);

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

  const negativeCount = ratingEntries.filter((e) => e.rating <= 2).reduce((a, b) => a + b.count, 0);
  const negativeRate = totalFeedback > 0 ? ((negativeCount / totalFeedback) * 100).toFixed(0) : "0";

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
                label: "Positive Feedbacks",
                value: `${positiveRate}%`,
                icon: ThumbsUp,
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                label: "Negative Feedbacks",
                value: `${negativeRate}%`,
                icon: ThumbsDown,
                color: "text-red-500",
                bg: "bg-red-50",
              }
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
                Overall Rating
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

          {/* Feedback Table */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search feedback or session…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Feedback</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Session</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Rating</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Status</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Submitted</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <MessageSquare size={40} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No feedback found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFeedback.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-900">{item.feedback}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {item.session}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StarRating value={item.rating} />
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'hidden' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-800">{item.submitted}</span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/feedback/${item.id}`)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t text-sm text-gray-500">
              Showing {filteredFeedback.length} feedback items
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
