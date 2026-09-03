"use client";

import React, { useEffect } from "react";
import {
  Clock,
  Loader2,
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
  LogOut,
  Pencil,
  Globe,
  Link2,
  Award,
  GraduationCap,
  CalendarDays,
  Mail,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useProfileStore, scheduleTime } from "../../lib/profileStore";
import { useAuthStore } from "../../lib/authStore";
import Image from "next/image";

const bgIcons = [
  { icon: Atom, top: "8%", left: "10%", size: 36, delay: 0 },
  { icon: Terminal, top: "12%", right: "12%", size: 28, delay: 1 },
  { icon: Palette, top: "25%", left: "18%", size: 32, delay: 2 },
  { icon: Database, top: "30%", right: "8%", size: 40, delay: 0.5 },
  { icon: Settings, top: "45%", left: "6%", size: 30, delay: 1.5 },
  { icon: FileCode, top: "50%", right: "20%", size: 34, delay: 2.5 },
  { icon: BarChart, top: "68%", left: "12%", size: 38, delay: 0.8 },
  { icon: Cpu, top: "75%", right: "10%", size: 32, delay: 1.2 },
  { icon: Atom, bottom: "8%", left: "20%", size: 28, delay: 2 },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { profile, loading, error, fetchProfile } = useProfileStore();
  const { hydrated, token } = useAuthStore();

  useEffect(() => {
    if (hydrated) {
      if (token) {
        fetchProfile();
      } else {
        router.push("/signin");
      }
    }
  }, [hydrated, token, fetchProfile, router]);

  if (!hydrated || (loading && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-black p-5 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchProfile()}
          className="rounded-lg bg-[#0ea5e9] px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const fullName = profile ? (profile.firstName + " " + profile.lastName) : "Dalton Harris";
  const bio = profile?.bio || "No bio provided.";
  const teachSkills = profile?.teachSkills.map(s => s.name) || [];
  const learnSkills = profile?.learnSkills.map(s => s.name) || [];
  const scheduleRows = (profile?.schedule || []).map((s) => ({
    day: s.day,
    time: scheduleTime(s) || "Not set",
  }));

  const socialLinks = [
    { label: "LinkedIn", url: profile?.linkedinUrl },
    { label: "GitHub", url: profile?.githubUrl },
    { label: "Twitter / X", url: profile?.twitterUrl },
    { label: "Portfolio", url: profile?.portfolioUrl },
  ].filter((l) => l.url);

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans flex text-black overflow-hidden">
      {/* Scattered tech icons background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {bgIcons.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="absolute text-blue-300/50 animate-pulse"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                bottom: item.bottom,
                animationDelay: `${item.delay}s`,
                animationDuration: "4s",
              }}
            >
              <IconComp size={item.size} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      <SideNav />

      <main className="relative z-10 flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-10 md:pt-14">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                My Profile
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Manage your information and skills
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/profile/preview")}
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 text-sm font-semibold shadow-lg shadow-sky-500/25 transition-colors"
            >
              <Globe size={16} />
              Preview
            </button>
          </div>

          {/* Profile Card */}
          <section className="mb-8 rounded-3xl bg-linear-to-br from-sky-500 via-sky-400 to-blue-500 p-6 shadow-xl shadow-sky-500/20 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="relative h-28 w-28">
                  {profile?.avatarUrl ? (
                    <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white/40 bg-slate-100">
                      <Image
                        src={profile.avatarUrl}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full rounded-full bg-white/20 flex items-center justify-center shrink-0 border-4 border-white/40 backdrop-blur-sm">
                      <span className="text-5xl font-bold text-white">
                        {user?.firstName?.[0]?.toUpperCase() ?? "?"}
                        {user?.lastName?.[0]?.toUpperCase() ?? ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{fullName}</h2>
                <p className="mt-1 text-sm text-white/80 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={15} />
                  {user?.email || "Not set"}
                </p>
                {profile?.phoneNumber && (
                  <p className="mt-1 text-sm text-white/80 flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone size={15} />
                    {profile.phoneNumber}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/profile/edit")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-sky-600 px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-sky-50 transition-colors"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      router.push("/signin");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <InfoCard
                title="About"
                icon={<Atom size={18} />}
              >
                <p className="text-slate-600 leading-relaxed">{bio}</p>
              </InfoCard>

              <InfoCard
                title="Your Skills"
                icon={<Award size={18} />}
              >
                <ChipList items={teachSkills} variant="sky" />
              </InfoCard>

              <InfoCard
                title="Learning Goals"
                icon={<GraduationCap size={18} />}
              >
                <ChipList items={learnSkills} variant="violet" />
              </InfoCard>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <InfoCard
                title="Your Availability"
                icon={<CalendarDays size={18} />}
              >
                {scheduleRows.length === 0 ? (
                  <p className="text-slate-400">No availability set yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {scheduleRows.map((row) => (
                      <div
                        key={row.day}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <span className="font-semibold text-slate-700">{row.day}</span>
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4 text-[#0ea5e9]" />
                          {row.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </InfoCard>

              {socialLinks.length > 0 && (
                <InfoCard
                  title="Links"
                  icon={<Link2 size={18} />}
                >
                  <div className="space-y-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 hover:border-sky-300 hover:bg-sky-50 transition-colors"
                      >
                        <span className="font-medium">{link.label}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[55%]">{link.url}</span>
                      </a>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile/preview")}
            className="mt-8 md:hidden w-full rounded-2xl bg-sky-500 hover:bg-sky-600 py-4 text-base font-semibold text-white shadow-xl shadow-sky-500/25 transition-colors"
          >
            Preview Profile
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
          {icon}
        </span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const chipVariants = {
  sky: "bg-linear-to-b from-[#0ea5e9] to-[#11688b]",
  violet: "bg-linear-to-b from-violet-500 to-purple-700",
};

function ChipList({ items, variant = "sky" }: { items: string[]; variant?: "sky" | "violet" }) {
  if (items.length === 0) return <p className="text-slate-400">None added yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className={`rounded-lg ${chipVariants[variant]} px-3 py-2 text-[15px] font-semibold text-white shadow-sm`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
