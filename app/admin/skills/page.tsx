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
  ListChecks,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminMetricsStore } from "@/lib/adminMetricsStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { useAdminSkillsStore } from "@/lib/adminSkillsStore";
import { useAdminTechnicalSkillsStore, TechnicalSkill } from "@/lib/adminTechnicalSkillsStore";
import { SkillListing } from "@/lib/skillsStore";
import { useToast } from "@/hooks/useToast";

interface UISkillListing {
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
const CATEGORY_OPTIONS = ["all", "Design & PM", "Frontend", "Backend","Management"] as const;
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
  "Design & PM": Palette,
  Frontend: Code2,
  Backend: Code2,
  Management: Briefcase,
};

const CATEGORY_COLORS: Record<string, string> = {
  Design: "bg-purple-50 text-purple-600",
  Development: "bg-sky-50 text-sky-600",
  Management: "bg-emerald-50 text-emerald-600",
};

// const SAMPLE_LISTINGS: UISkillListing[] = [
//   { id: "1", skill: "UI/UX Design", category: "Design", status: "approved", demand: "high", request: 48, rating: 4.8, description: "Creating user interfaces and experiences for web and mobile apps.", tags: ["Figma", "UI", "UX", "Web"], sessions: 120, completionRate: 95, growth: 15 },
//   { id: "2", skill: "Figma Prototyping", category: "Design", status: "approved", demand: "medium", request: 32, rating: 4.5, description: "Advanced prototyping techniques using Figma.", tags: ["Figma", "Prototyping", "Design"], sessions: 85, completionRate: 90, growth: 8 },
//   { id: "3", skill: "React Development", category: "Development", status: "approved", demand: "high", request: 56, rating: 4.9, description: "Building interactive user interfaces using React.", tags: ["React", "JavaScript", "Frontend"], sessions: 150, completionRate: 98, growth: 22 },
//   { id: "4", skill: "Node.js API", category: "Development", status: "pending", demand: "medium", request: 21, rating: 4.2, description: "Creating scalable APIs with Node.js and Express.", tags: ["Node.js", "Backend", "API"], sessions: 45, completionRate: 88, growth: 5 },
//   { id: "5", skill: "Agile Coaching", category: "Management", status: "pending", demand: "low", request: 8, rating: 3.8, description: "Guiding teams in Agile practices and frameworks.", tags: ["Agile", "Scrum", "Management"], sessions: 12, completionRate: 80, growth: -2 },
//   { id: "6", skill: "Brand Strategy", category: "Design", status: "failed", demand: "low", request: 5, rating: 3.2, description: "Developing brand identities and strategies.", tags: ["Branding", "Strategy", "Marketing"], sessions: 8, completionRate: 75, growth: -5 },
//   { id: "7", skill: "Python Scripting", category: "Development", status: "approved", demand: "high", request: 44, rating: 4.7, description: "Automating tasks and building scripts with Python.", tags: ["Python", "Automation", "Scripting"], sessions: 110, completionRate: 92, growth: 18 },
//   { id: "8", skill: "Scrum Master", category: "Management", status: "approved", demand: "medium", request: 27, rating: 4.4, description: "Facilitating Scrum teams to deliver value.", tags: ["Scrum", "Management", "Agile"], sessions: 60, completionRate: 94, growth: 10 },
//   { id: "9", skill: "Product Roadmap", category: "Management", status: "pending", demand: "high", request: 19, rating: 4.1, description: "Planning and creating product roadmaps.", tags: ["Product", "Roadmap", "Management"], sessions: 35, completionRate: 85, growth: 12 },
//   { id: "10", skill: "Motion Design", category: "Design", status: "approved", demand: "medium", request: 15, rating: 4.3, description: "Creating motion graphics and animations.", tags: ["Motion", "Animation", "After Effects"], sessions: 40, completionRate: 89, growth: 7 },
// ];

const mapToUI = (listing: SkillListing): UISkillListing => ({
  id: listing.id,
  skill: listing.title || "Untitled",
  category: listing.category || "Other",
  status: listing.isActive !== false ? "approved" : "pending",
  demand: "medium", // Defaulting as demand isn't tracked in backend yet
  request: 0,
  rating: 0,
  description: listing.description,
  tags: [listing.category || "Other"],
  sessions: 0,
  completionRate: 0,
  growth: 0,
});

export default function AdminSkillsPage() {
  const router = useRouter();
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { metrics, loading: metricsLoading, fetchMetrics } = useAdminMetricsStore();
  const { skills, fetchSkills, deleteSkill } = useAdminSkillsStore();
  const tech = useAdminTechnicalSkillsStore();
  const { toastElement, showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [demandFilter, setDemandFilter] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<UISkillListing | null>(null);
  const [showTechSkills, setShowTechSkills] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TechnicalSkill | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [techSearch, setTechSearch] = useState("");
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [deletingTechId, setDeletingTechId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && token) {
      fetchMetrics(token);
      fetchSkills(token, { limit: 100 }); // Increase limit for simple frontend filtering
    }
  }, [hydrated, token, fetchMetrics, fetchSkills]);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const categories = useMemo(() => metrics?.topCategories ?? [], [metrics?.topCategories]);
  const totalListings = categories.reduce((a, c) => a + c.count, 0);

  const uiListings = useMemo(() => skills.map(mapToUI), [skills]);

  const filtered = useMemo(() => {
    return uiListings.filter((l) => {
      const matchesSearch = l.skill.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || l.category === categoryFilter;
      const matchesDemand = demandFilter === "all" || l.demand === demandFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesDemand;
    });
  }, [uiListings, search, statusFilter, categoryFilter, demandFilter]);

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 font-sans flex text-black">
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
            <button
              type="button"
              onClick={() => {
                setShowTechSkills(true);
                tech.fetchTechnicalSkills();
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <ListChecks size={18} className="text-sky-500" />
              Technical Skills
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingSkill(null);
                setFormName("");
                setFormCategory("");
                setFormError(null);
                setShowSkillForm(true);
              }}
              className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-colors"
            >
              <Plus size={18} />
              Add New Skill
            </button>
          </AdminHeader>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Skills", value: totalListings, icon: ChartColumnBig, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Pending Approval", value: uiListings.filter((l) => l.status === "pending").length, icon: Hourglass, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Approved", value: uiListings.filter((l) => l.status === "approved").length, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
              { label: "High Demand", value: uiListings.filter((l) => l.demand === "high").length, icon: TrendingUp, color: "text-sky-500", bg: "bg-sky-50" },
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

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No skills match your filters</p>
                </div>
              ) : (
                filtered.map((listing) => {
                  const sc = STATUS_CONFIG[listing.status];
                  const dc = DEMAND_COLORS[listing.demand];
                  const StatusIcon = sc.icon;
                  return (
                    <div key={listing.id} className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLORS[listing.category]}`}>
                            {React.createElement(CATEGORY_ICONS[listing.category] || BookOpen, { size: 16 })}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{listing.skill}</p>
                            <p className="text-xs text-gray-500">{listing.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSkill(listing)}
                            className="bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 hover:bg-sky-600 transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this skill listing?")) {
                                setDeletingListingId(listing.id);
                                await deleteSkill(token!, listing.id);
                                setDeletingListingId(null);
                                fetchSkills(token!, { limit: 100 });
                              }
                            }}
                            disabled={deletingListingId === listing.id}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {deletingListingId === listing.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.colors}`}>
                          <StatusIcon size={12} />
                          {sc.label}
                        </span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${dc}`}>
                          {listing.demand.charAt(0).toUpperCase() + listing.demand.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          {listing.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">{listing.request} requests</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
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
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedSkill(listing)}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm("Are you sure you want to delete this skill listing?")) {
                                    setDeletingListingId(listing.id);
                                    await deleteSkill(token!, listing.id);
                                    setDeletingListingId(null);
                                    fetchSkills(token!, { limit: 100 });
                                  }
                                }}
                                disabled={deletingListingId === listing.id}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                              >
                                {deletingListingId === listing.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!metricsLoading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t text-sm text-gray-500">
                Showing {filtered.length} of {uiListings.length} skills
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Skill Details Drawer */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex justify-end  bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedSkill(null)}>
          <div 
            className="w-full max-w-md bg-sky-100 md:bg-gray-50 h-full shadow-2xl overflow-y-auto flex flex-col transform transition-transform translate-x-0" 
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

      {/* Technical Skills Modal */}
      {showTechSkills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowTechSkills(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Technical Skills</h2>
                <p className="text-sm text-gray-500">Skills available on the technical skill endpoint</p>
              </div>
              <button onClick={() => setShowTechSkills(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-6 py-3 border-b">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by name or category…"
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => tech.fetchTechnicalSkills()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
              >
                Refresh
              </button>
            </div>

            {tech.error && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-100">
                <p className="text-sm text-red-600">{tech.error}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {tech.loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0ea5e9]" />
                </div>
              ) : tech.skills.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ListChecks size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No technical skills found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tech.skills
                    .filter((s) => {
                      const q = techSearch.toLowerCase();
                      return !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
                    })
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-3 border rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.category}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSkill(s);
                              setFormName(s.name);
                              setFormCategory(s.category);
                              setFormError(null);
                              setShowSkillForm(true);
                            }}
                            className="p-2 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                            aria-label={`Edit ${s.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete the technical skill "${s.name}"?`)) {
                                setDeletingTechId(s.id);
                                const res = await tech.deleteTechnicalSkill(token!, s.id);
                                setDeletingTechId(null);
                                if (!res.success) showToast(res.message || "Failed to delete skill");
                              }
                            }}
                            disabled={deletingTechId === s.id}
                            className="p-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-label={`Delete ${s.name}`}
                          >
                            {deletingTechId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t">
              <p className="text-sm text-gray-500">{tech.skills.length} skill(s)</p>
              <button
                type="button"
                onClick={() => {
                  setEditingSkill(null);
                  setFormName("");
                  setFormCategory("");
                  setFormError(null);
                  setShowSkillForm(true);
                }}
                className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-colors"
              >
                <Plus size={16} />
                Add New Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Technical Skill Modal */}
      {showSkillForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowSkillForm(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editingSkill ? "Edit Skill" : "Add New Skill"}</h2>
              <button onClick={() => setShowSkillForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!formName.trim() || !formCategory.trim()) {
                  setFormError("Name and category are required");
                  return;
                }
                const payload = { name: formName.trim(), category: formCategory.trim() };
                const res = editingSkill
                  ? await tech.updateTechnicalSkill(token!, editingSkill.id, payload)
                  : await tech.createTechnicalSkill(token!, payload);
                if (!res.success) {
                  setFormError(res.message || "Failed to save skill");
                  return;
                }
                setShowSkillForm(false);
                setFormError(null);
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Skill Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. TypeScript"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Frontend"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tech.saving}
                  className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-60"
                >
                  {tech.saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingSkill ? "Save Changes" : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastElement}
    </div>
  );
}
