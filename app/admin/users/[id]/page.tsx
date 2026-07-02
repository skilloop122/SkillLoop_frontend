"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Trash2,
 MessageCircle,
  Star,
  Activity,
  FileText,
  BarChart3,
  Loader2,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Mail,
  Link,
  UserCog,
} from "lucide-react";
import { AdminSideNav } from "@/components/AdminSideNav";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminUserStore, AdminUserDetailsResponse } from "@/lib/adminUserStore";

const tabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "reports", label: "Reports", icon: FileText },
];

export default function UserDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { token, hydrated } = useAdminAuthStore();
  const { details, loading, error, fetchUserDetails, deleteUser, changeUserRole } = useAdminUserStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (hydrated && token && id) {
      fetchUserDetails(token, id);
    }
  }, [hydrated, token, id, fetchUserDetails]);

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) {
    router.push("/admin/login");
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSideNav />
        <main className="flex-1 md:ml-64 pb-32 flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </main>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSideNav />
        <main className="flex-1 md:ml-64 pb-32 flex items-center justify-center">
          <p className="text-gray-400 text-lg">User not found</p>
        </main>
      </div>
    );
  }

  const user = details?.user;
  const profile = details?.profile;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSideNav />
        <main className="flex-1 md:ml-64 pb-32 flex items-center justify-center">
          <p className="text-gray-400 text-lg">User data not available</p>
        </main>
      </div>
    );
  }

  const initials = ((profile?.firstName?.[0] ?? "") + (profile?.lastName?.[0] ?? "")).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSideNav />
      <main className="flex-1 md:ml-64 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
          <button
            onClick={() => router.back()}
            className="mb-6 h-11 w-11 rounded-xl border bg-white text-black flex items-center justify-center shadow-sm hover:bg-slate-100 transition"
          >
            <ArrowLeft />
          </button>

          <div className="bg-white rounded-3xl border shadow-sm p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="flex flex-col sm:flex-row gap-6">
                {profile ? (
                  <div className="w-[130px] h-[130px] rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                    <span className="text-5xl font-bold text-sky-600">{initials}</span>
                  </div>
                ) : (
                  <div className="w-[130px] h-[130px] rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-5xl font-bold text-slate-400">?</span>
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-black">
                      {profile ? `${profile.firstName} ${profile.lastName ?? ""}` : "User"}
                    </h1>
                    <span className="flex items-center gap-1 bg-sky-100 text-sky-600 px-3 py-1 rounded-lg text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xl mt-4 text-black">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-5">
                    <span className={`px-5 py-1 rounded-full border text-sm ${user.status === "active" || !user.status ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}>
                      {user.status ?? "Active"}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Award size={16} /> {user.points ?? 0} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-gray-500">
                    <Calendar size={16} />
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 xl:self-start">
                <button
                  onClick={async () => {
                    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
                    if (!token) return;
                    const result = await changeUserRole(token, user.id, newRole);
                    if (result.success) {
                      fetchUserDetails(token, user.id);
                    } else {
                      alert(result.message || "Failed to update role");
                    }
                  }}
                  className="border rounded-xl px-6 py-3 flex items-center justify-center gap-2 hover:bg-slate-50 transition text-black"
                >
                  <UserCog size={18} />
                  {user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border border-red-500 text-red-600 rounded-xl px-6 py-3 flex items-center justify-center gap-2 hover:bg-red-50 transition"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex gap-1 border-b border-slate-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                      isActive
                        ? "border-sky-500 text-sky-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6">
              {activeTab === "overview" && <OverviewTab details={details} />}
              {activeTab === "activity" && <ActivityTab details={details} />}
              {activeTab === "reports" && <ReportsTab details={details} />}
            </div>
          </div>
        </div>

        <div className="fixed bottom-5 left-0 md:left-64 right-0 flex justify-center px-4">
          <div className="flex w-full max-w-md gap-3">
            <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 transition">
              <MessageCircle size={20} />
              Message
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 transition">
              Suspend
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delete User</h2>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently delete <span className="font-semibold">{user.email}</span> and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!token) return;
                    const result = await deleteUser(token, user.id);
                    if (result.success) {
                      router.push("/admin/users");
                    } else {
                      alert(result.message || "Failed to delete user");
                      setShowDeleteConfirm(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ───── Overview Tab ───── */
function OverviewTab({ details }: { details: AdminUserDetailsResponse }) {
  const { user, profile, requests = [], sessions = [], feedback = [] } = details;

  const stats = [
    { label: "Requests", value: requests?.length ?? 0, icon: Mail, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Sessions", value: sessions?.length ?? 0, icon: BookOpen, color: "text-green-500", bg: "bg-green-50" },
    { label: "Feedback", value: feedback?.length ?? 0, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Points", value: user.points ?? 0, icon: Award, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const avgRating = feedback?.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <Icon size={20} className={s.color} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-black">User Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <DetailRow label="User ID" value={user.id} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Role" value={user.role} />
            <DetailRow label="Status" value={user.status ?? "Active"} />
            <DetailRow label="Points" value={String(user.points ?? 0)} />
            <DetailRow label="Avg Rating" value={avgRating} />
            <DetailRow label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "—"} />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-black">Profile Details</h3>
          {profile ? (
            <div className="space-y-4 text-sm">
              <div className="text-black">
                <p className="text-xs text-gray-900 mb-1">Name</p>
                <p className="font-medium">{profile.firstName} {profile.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Bio</p>
                <p className="text-gray-600">{profile.bio || "—"}</p>
              </div>
              <div className="text-gray-900 ">
                <p className="text-xs mb-1">Phone</p>
                <p>{profile.phoneNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Links</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.linkedinUrl && <ProfileLink href={profile.linkedinUrl} label="LinkedIn" />}
                  {profile.githubUrl && <ProfileLink href={profile.githubUrl} label="GitHub" />}
                  {profile.twitterUrl && <ProfileLink href={profile.twitterUrl} label="Twitter" />}
                  {profile.portfolioUrl && <ProfileLink href={profile.portfolioUrl} label="Portfolio" />}
                  {!profile.linkedinUrl && !profile.githubUrl && !profile.twitterUrl && !profile.portfolioUrl && (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No profile data.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-black">
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          {Array.isArray(profile?.teachSkills) && profile.teachSkills.length ? (
            <div>
              <p className="text-xs text-gray-400 mb-2">Teaches</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.teachSkills.map((s) => (
                  <span key={s.id} className="bg-sky-50 text-sky-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-200">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {Array.isArray(profile?.learnSkills) && profile.learnSkills.length ? (
            <div>
              <p className="text-xs text-gray-400 mb-2">Learning</p>
              <div className="flex flex-wrap gap-2">
                {profile.learnSkills.map((s) => (
                  <span key={s.id} className="bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {!Array.isArray(profile?.teachSkills) && !Array.isArray(profile?.learnSkills) && (
            <p className="text-gray-400 text-sm">No skills listed.</p>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm text-black">
          <h3 className="text-lg font-semibold mb-4">Availability</h3>
          {Array.isArray(profile?.schedule) && profile.schedule.length ? (
            <div className="space-y-2">
              {profile.schedule.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700 w-28">{s.day}</span>
                  <span className="text-gray-500">{s.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No availability set.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Activity Tab ───── */
function ActivityTab({ details }: { details: AdminUserDetailsResponse }) {
  const { requests = [], sessions = [] } = details;

  const activities: { date: string; type: string; label: string; status: string }[] = [
    ...(requests?.map((r) => ({
      date: r.createdAt,
      type: "request",
      label: r.message || `Request ${r.status}`,
      status: r.status,
    })) ?? []),
    ...(sessions?.map((s) => ({
      date: s.scheduledAt || s.completedAt || "",
      type: "session",
      label: s.topic || `Session ${s.status}`,
      status: s.status,
    })) ?? []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    accepted: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    scheduled: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    canceled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  };

  if (activities.length === 0) {
    return <p className="text-gray-400 text-sm py-10 text-center">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((act, i) => {
        const cfg = statusConfig[act.status] ?? statusConfig.pending;
        const Icon = cfg.icon;
        const iconLabel = act.type === "request" ? "Request" : "Session";
        return (
          <div key={i} className="bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
              <Icon size={18} className={cfg.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black">
                <span className="text-gray-400 text-xs font-normal">[{iconLabel}] </span>
                {act.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {act.date ? new Date(act.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
              {act.status.charAt(0).toUpperCase() + act.status.slice(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ───── Reports Tab ───── */
function ReportsTab({ details }: { details: AdminUserDetailsResponse }) {
  const { feedback = [] } = details;

  const typeConfig: Record<string, { icon: typeof ThumbsUp; color: string; bg: string }> = {
    positive: { icon: ThumbsUp, color: "text-green-600", bg: "bg-green-50" },
    neutral: { icon: Meh, color: "text-amber-500", bg: "bg-amber-50" },
    negative: { icon: ThumbsDown, color: "text-red-500", bg: "bg-red-50" },
  };

  if (!feedback?.length) {
    return <p className="text-gray-400 text-sm py-10 text-center">No feedback yet.</p>;
  }

  const classify = (rating: number) => (rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative");

  return (
    <div className="space-y-4">
      {feedback.map((rpt, i) => {
        const type = classify(rpt.rating);
        const cfg = typeConfig[type] ?? typeConfig.neutral;
        const Icon = cfg.icon;
        const author = rpt.fromUser ? `${rpt.fromUser.firstName ?? ""} ${rpt.fromUser.lastName ?? ""}`.trim() || "Anonymous" : "Anonymous";
        return (
          <div key={rpt.id || i} className="bg-white border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-black">{author}</span>
                  <span className="text-xs text-gray-400">
                    {rpt.createdAt ? new Date(rpt.createdAt).toLocaleDateString("en-GB") : ""}
                  </span>
                </div>
                {rpt.comment && <p className="text-sm text-gray-600 mt-1">{rpt.comment}</p>}
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < rpt.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}
                    />
                  ))}
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───── Helpers ───── */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-black break-all">{value}</span>
    </div>
  );
}

function ProfileLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-500 underline"
    >
      <Link size={12} />
      {label}
    </a>
  );
}
