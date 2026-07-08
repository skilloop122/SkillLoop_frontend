"use client";

import React, { useEffect, useState, useMemo} from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Loader2,
  TrendingUp,
  ChartColumnBig,
  Hourglass,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Palette,
  Code2,
  Briefcase,
  X,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

interface SkillListing {
  id: string;
  skill: string;
  category: string;
  status: "approved" | "pending" | "failed";
  demand: "high" | "medium" | "low";
  request: number;
  rating: number;
  description?: string;
  tags?: string[];
  sessions?: number;
  completionRate?: number;
  growth?: number;
}

const STATUS_OPTIONS = ["all", "approved", "pending", "failed"] as const;
const CATEGORY_OPTIONS = ["all", "Design", "Development", "Management"] as const;
const DEMAND_OPTIONS = ["all", "high", "medium", "low"] as const;

const DEMAND_COLORS: Record<string, string> = {
  high: "text-green-600 bg-green-50 border-green-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-red-600 bg-red-50 border-red-200",
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; colors: string }> = {
  approved: { label: "Approved", icon: CheckCircle2, colors: "text-green-600 bg-green-50" },
  pending: { label: "Pending", icon: Clock, colors: "text-amber-600 bg-amber-50" },
  failed: { label: "Failed", icon: XCircle, colors: "text-red-600 bg-red-50" },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Design: Palette,
  Development: Code2,
  Management: Briefcase,
};

const CATEGORY_COLORS: Record<string, string> = {
  Design: "bg-purple-50 text-purple-600",
  Development: "bg-sky-50 text-sky-600",
  Management: "bg-emerald-50 text-emerald-600",
};

const SAMPLE_LISTINGS: SkillListing[] = [
  { id: "1", skill: "UI/UX Design", category: "Design", status: "approved", demand: "high", request: 48, rating: 4.8, description: "Creating user interfaces and experiences for web and mobile apps.", tags: ["Figma", "UI", "UX", "Web"], sessions: 120, completionRate: 95, growth: 15 },
  { id: "2", skill: "Figma Prototyping", category: "Design", status: "approved", demand: "medium", request: 32, rating: 4.5, description: "Advanced prototyping techniques using Figma.", tags: ["Figma", "Prototyping", "Design"], sessions: 85, completionRate: 90, growth: 8 },
  { id: "3", skill: "React Development", category: "Development", status: "approved", demand: "high", request: 56, rating: 4.9, description: "Building interactive user interfaces using React.", tags: ["React", "JavaScript", "Frontend"], sessions: 150, completionRate: 98, growth: 22 },
  { id: "4", skill: "Node.js API", category: "Development", status: "pending", demand: "medium", request: 21, rating: 4.2, description: "Creating scalable APIs with Node.js and Express.", tags: ["Node.js", "Backend", "API"], sessions: 45, completionRate: 88, growth: 5 },
  { id: "5", skill: "Agile Coaching", category: "Management", status: "pending", demand: "low", request: 8, rating: 3.8, description: "Guiding teams in Agile practices and frameworks.", tags: ["Agile", "Scrum", "Management"], sessions: 12, completionRate: 80, growth: -2 },
  { id: "6", skill: "Brand Strategy", category: "Design", status: "failed", demand: "low", request: 5, rating: 3.2, description: "Developing brand identities and strategies.", tags: ["Branding", "Strategy", "Marketing"], sessions: 8, completionRate: 75, growth: -5 },
  { id: "7", skill: "Python Scripting", category: "Development", status: "approved", demand: "high", request: 44, rating: 4.7, description: "Automating tasks and building scripts with Python.", tags: ["Python", "Automation", "Scripting"], sessions: 110, completionRate: 92, growth: 18 },
  { id: "8", skill: "Scrum Master", category: "Management", status: "approved", demand: "medium", request: 27, rating: 4.4, description: "Facilitating Scrum teams to deliver value.", tags: ["Scrum", "Management", "Agile"], sessions: 60, completionRate: 94, growth: 10 },
  { id: "9", skill: "Product Roadmap", category: "Management", status: "pending", demand: "high", request: 19, rating: 4.1, description: "Planning and creating product roadmaps.", tags: ["Product", "Roadmap", "Management"], sessions: 35, completionRate: 85, growth: 12 },
  { id: "10", skill: "Motion Design", category: "Design", status: "approved", demand: "medium", request: 15, rating: 4.3, description: "Creating motion graphics and animations.", tags: ["Motion", "Animation", "After Effects"], sessions: 40, completionRate: 89, growth: 7 },
];

export default function AdminSkillsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [demandFilter, setDemandFilter] = useState<string>("all");
  const [listings] = useState<SkillListing[]>(SAMPLE_LISTINGS);
  const [selectedSkill, setSelectedSkill] = useState<SkillListing | null>(null);

  useEffect(() => {
    if (hydrated && token) {
      fetchMetrics(token);
    }
  }, [hydrated, token, fetchMetrics]);

  useEffect(() => {
    if (hydrated && token) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");
      fetch(`${apiBase}admin/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((body) => {
          console.log("ADMIN SKILLS RESPONSE:", JSON.stringify(body, null, 2));
        })
        .catch((err) => console.error("ADMIN SKILLS ERROR:", err));
    }
  }, [hydrated, token]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const categories = useMemo(() => metrics?.topCategories ?? [], [metrics?.topCategories]);
  const totalListings = categories.reduce((a, c) => a + c.count, 0);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch = l.skill.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || l.category === categoryFilter;
      const matchesDemand = demandFilter === "all" || l.demand === demandFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesDemand;
    });
  }, [listings, search, statusFilter, categoryFilter, demandFilter]);

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
            subtitle="Manage all skill listings on the platform"
          >
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <BookOpen size={18} className="text-sky-500" />
              <span className="text-sky-700 font-semibold text-sm">
                {metrics?.overview?.totalSkillListings ?? totalListings} Listings
              </span>
            </div>
          </AdminHeader>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Skills", value: metrics?.overview?.totalSkillListings, icon: ChartColumnBig, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Pending Approval", value: listings.filter((l) => l.status === "pending").length, icon: Hourglass, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Approved", value: listings.filter((l) => l.status === "approved").length, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
              { label: "High Demand", value: listings.filter((l) => l.demand === "high").length, icon: TrendingUp, color: "text-sky-500", bg: "bg-sky-50" },
            ].map((card) => (
              <div key={card.label} className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="font-bold text-xl">
                      {metricsLoading ? <span className="text-gray-300 animate-pulse">—</span> : (card.value ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills…"
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
                {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={demandFilter}
                onChange={(e) => setDemandFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Demand</option>
                {DEMAND_OPTIONS.filter((d) => d !== "all").map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Skill</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Category</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Status</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Demand</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Request</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Rating</th>
                    <th className="text-left font-semibold text-gray-600 px-4 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <BookOpen size={40} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No skills match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((listing) => {
                      const sc = STATUS_CONFIG[listing.status];
                      const dc = DEMAND_COLORS[listing.demand];
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={listing.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[listing.category]}`}>
                                {React.createElement(CATEGORY_ICONS[listing.category] || BookOpen, { size: 16 })}
                              </div>
                              <span className="font-medium text-gray-900">{listing.skill}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {listing.category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.colors}`}>
                              <StatusIcon size={14} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${dc}`}>
                              {listing.demand.charAt(0).toUpperCase() + listing.demand.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-gray-800">{listing.request}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} className="text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-gray-800">{listing.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedSkill(listing)}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t text-sm text-gray-500">
              Showing {filtered.length} of {listings.length} skills
            </div>
          </div>

        </div>
      </div>

      {/* Skill Details Drawer */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedSkill(null)}>
          <div 
            className="w-full max-w-md bg-gray-50 h-full shadow-2xl overflow-y-auto flex flex-col transform transition-transform translate-x-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold">Skill Details</h2>
              <button onClick={() => setSelectedSkill(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              {/* Card 1: Name of the skill */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${CATEGORY_COLORS[selectedSkill.category] || "bg-gray-100 text-gray-600"}`}>
                    {React.createElement(CATEGORY_ICONS[selectedSkill.category] || BookOpen, { size: 24 })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedSkill.skill}</h3>
                    <span className="text-sm font-medium text-gray-500">{selectedSkill.category}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Category, tags and description */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedSkill.description || "No description available for this skill."}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedSkill.tags || [selectedSkill.category]).map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-gray-50 border text-gray-600 rounded-lg text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Performance */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Requests</p>
                    <p className="text-lg font-bold text-gray-900">{selectedSkill.request}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sessions Held</p>
                    <p className="text-lg font-bold text-gray-900">{selectedSkill.sessions || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Average Rating</p>
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <p className="text-lg font-bold text-gray-900">{selectedSkill.rating.toFixed(1)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
                    <p className="text-lg font-bold text-gray-900">{selectedSkill.completionRate || 0}%</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Growth (This Month)</p>
                    <p className={`text-lg font-bold ${(selectedSkill.growth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {(selectedSkill.growth || 0) >= 0 ? "+" : ""}{selectedSkill.growth || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
