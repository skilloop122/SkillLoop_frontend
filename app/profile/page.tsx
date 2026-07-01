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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useProfileStore } from "../../lib/profileStore";
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
          className="rounded-[4px] bg-[#0ea5e9] px-4 py-2 text-white"
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
  const days = profile?.schedule.map(s => s.day) || [];
  const timeRange = profile?.schedule[0]?.time || "Not set";

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
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-10 md:pt-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-black tracking-tight">
              My Profile
            </h1>
          </div>

          <section className="mb-8 flex justify-center">
            <div className="relative h-[168px] w-[168px]">
              {profile?.avatarUrl ? (
                <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-slate-200 bg-slate-100">
                  <Image
                    src={profile.avatarUrl}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="h-full w-full rounded-full bg-sky-100 flex items-center justify-center shrink-0 border-[6px] border-slate-200">
                  <span className="text-6xl font-bold text-sky-600">
                    {user?.firstName?.[0]?.toUpperCase() ?? "?"}
                    {user?.lastName?.[0]?.toUpperCase() ?? ""}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="mb-9 space-y-5">
            <ProfileField label="Full Name" value={fullName} />
            <ProfileField label="Email" value={user?.email || "Not set"} />
            <ProfileField label="Phone Number" value={profile?.phoneNumber || "Not set"} />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/profile/edit")}
                className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/signin");
                }}
                className="rounded-[4px] border border-red-200 px-3 py-2 text-[16px] font-medium text-red-400 hover:bg-red-50"
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </section>

          <ProfileSection title="About">
            <p className="max-w-[360px] text-[18px] leading-snug">{bio}</p>
          </ProfileSection>

          <ProfileSection title="Your Skills">
            <ChipList items={teachSkills} />
          </ProfileSection>

          <ProfileSection title="Learning Goals">
            <ChipList items={learnSkills} />
          </ProfileSection>

          <ProfileSection title="Your Availability">
            <ChipList items={days} />
            <div className="mt-3 flex items-center gap-2 text-[16px]">
              <Clock className="h-5 w-5 text-[#0ea5e9]" />
              <span>{timeRange}</span>
            </div>
          </ProfileSection>

          <div className="space-y-5">
            <ProfileField label="LinkedIn URL" value={profile?.linkedinUrl || "Not set"} />
            <ProfileField label="GitHub URL" value={profile?.githubUrl || "Not set"} />
            <ProfileField label="Twitter / X URL" value={profile?.twitterUrl || "Not set"} />
            <ProfileField label="Portfolio URL" value={profile?.portfolioUrl || "Not set"} />
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile/preview")}
            className="mt-6 w-full rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] font-semibold text-white shadow-xl shadow-sky-500/25"
          >
            Preview Profile
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-medium text-slate-500">{label}</span>
      <div className="rounded-[18px] bg-[#e7e7e7] px-4 py-4 text-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
        {value}
      </div>
    </label>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="mb-3 text-[26px] font-normal">{title}</h2>
      {children}
    </section>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-slate-400">None added yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={index} className="rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#11688b] px-3 py-2 text-[16px] text-white">
          {item}
        </span>
      ))}
    </div>
  );
}
