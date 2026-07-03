"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Loader2,
  Tag,
  TrendingUp,
  Filter,
  ChevronDown,
  BarChart3,
  Star,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

export default function AdminSkillsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("count");

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

  const categories = useMemo(() => metrics?.topCategories ?? [], [metrics?.topCategories]);

  const filtered = useMemo(() => {
    let list = categories.filter((c) =>
      c.category.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "count") list = [...list].sort((a, b) => b.count - a.count);
    else list = [...list].sort((a, b) => a.category.localeCompare(b.category));
    return list;
  }, [categories, search, sort]);

  const totalListings = categories.reduce((a, c) => a + c.count, 0);
  const topCategory = categories.reduce((a, b) => (a.count > b.count ? a : b), { category: "—", count: 0 });

  const COLORS = [
    "bg-sky-500", "bg-purple-500", "bg-green-500", "bg-amber-500",
    "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
  ];

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
            title="Skills"
            subtitle="Browse all skill categories on the platform"
          >
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <BookOpen size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metrics?.overview?.totalSkillListings ?? "—"} Listings
              </span>
            </div>
          </AdminHeader>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Listings", value: metrics?.overview?.totalSkillListings, icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50" },
              { label: "Categories", value: categories.length, icon: Tag, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Top Category", value: topCategory.category, icon: Star, color: "text-amber-500", bg: "bg-amber-50", isText: true },
            ].map((card) => (
              <div key={card.label} className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className={`font-bold truncate ${card.isText ? "text-sm" : "text-xl"}`}>
                      {metricsLoading ? <span className="text-gray-300 animate-pulse">—</span> : (card.value ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart — category distribution */}
          {!metricsLoading && filtered.length > 0 && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-sky-500" />
                Category Distribution
              </h2>
              <div className="space-y-3">
                {filtered.slice(0, 8).map((cat, idx) => {
                  const pct = totalListings > 0 ? (cat.count / totalListings) * 100 : 0;
                  return (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-32 truncate shrink-0">{cat.category}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${COLORS[idx % COLORS.length]}`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-10 text-right">{cat.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid of skill cards */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white"
                >
                  <option value="count">Sort by Count</option>
                  <option value="name">Sort by Name</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="p-4">
              {metricsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No skill categories found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filtered.map((cat, idx) => (
                    <div
                      key={cat.category}
                      className="relative bg-gray-50 border rounded-xl p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${COLORS[idx % COLORS.length]} flex items-center justify-center mb-3`}>
                        <Tag size={16} className="text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600 transition-colors line-clamp-2">
                        {cat.category}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-gray-500">
                        <TrendingUp size={12} />
                        <span className="text-xs">{cat.count} listings</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!metricsLoading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t text-sm text-gray-500">
                Showing {filtered.length} of {categories.length} categories
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
