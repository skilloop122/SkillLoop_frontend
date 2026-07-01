"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  Star,
  Loader2,
  Globe,
  ExternalLink,
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "../../../lib/profileStore";
import { useAuthStore } from "../../../lib/authStore";

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

export default function PreviewProfilePage() {
  const router = useRouter();
  const { profile, loading, fetchProfile } = useProfileStore();
  const { hydrated, token } = useAuthStore();

  useEffect(() => {
    if (hydrated) {
      if (token) {
        if (!profile) fetchProfile();
      } else {
        router.push("/signin");
      }
    }
  }, [hydrated, token, profile, fetchProfile, router]);

  if (!hydrated || (loading && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  const fullName = profile ? (profile.firstName + " " + profile.lastName) : "Dalton West";
  const teachSkills = profile?.teachSkills.map(s => s.name) || [];
  const learnSkills = profile?.learnSkills.map(s => s.name) || [];
  const bio = profile?.bio || "";

  const initials = (profile?.firstName?.[0] ?? "?").toUpperCase() + (profile?.lastName?.[0] ?? "").toUpperCase();

  return (
    <div className="relative min-h-screen bg-sky-50 font-sans flex text-black overflow-hidden">
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

      <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen">
        {/* Left: Image */}
        <div className="relative w-full md:w-1/2 min-h-[40vh] md:min-h-screen">
          <Image
            src="/hero_collaboration.png"
            alt={fullName}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:px-12 md:py-16 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-[80px] h-[80px] rounded-full bg-sky-100 flex items-center justify-center shrink-0 ring-4 ring-white shadow-md">
                <span className="text-3xl font-bold text-sky-600">
                  {initials}
                </span>
              </div>
              <div>
                <h1 className="text-[28px] font-semibold text-black leading-tight">
                  {fullName}
                </h1>
                <p className="text-[16px] text-slate-500">User Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-[4px] border border-slate-200 bg-white px-2.5 py-1 text-[14px]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-700">4.7 Rating</span>
              </div>
              <span className="text-[14px] text-slate-400">122 Reviews</span>
            </div>
          </div>

          {/* About */}
          <section className="mb-6">
            <h2 className="mb-1.5 text-[18px] font-semibold text-black">About</h2>
            <p className="text-[15px] text-slate-600 leading-relaxed">
              {bio || "No bio available."}
            </p>
          </section>

          {/* Teaches */}
          <section className="mb-6">
            <h2 className="mb-2 text-[18px] font-semibold text-black">Teaches</h2>
            <ChipList items={teachSkills} />
          </section>

          {/* Wants to learn */}
          <section className="mb-6">
            <h2 className="mb-2 text-[18px] font-semibold text-black">Wants to learn</h2>
            <ChipList items={learnSkills} />
          </section>

          {/* Links */}
          <section className="mb-8">
            <h2 className="mb-2 text-[18px] font-semibold text-black">Links</h2>
            <div className="flex flex-col gap-2">
              <LinkItem href={profile?.linkedinUrl} label="LinkedIn" />
              <LinkItem href={profile?.githubUrl} label="GitHub" />
              <LinkItem href={profile?.twitterUrl} label="Twitter / X" />
              <LinkItem href={profile?.portfolioUrl} label="Portfolio" />
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/profile/edit")}
              className="flex-1 rounded-[12px] bg-[#0ea5e9] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-500 transition-colors"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-[12px] border border-slate-200 bg-white py-3.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkItem({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-[15px] text-[#0ea5e9] hover:text-sky-600 transition-colors underline truncate"
    >
      <Globe className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-auto" />
    </a>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-[14px] text-slate-400">None added yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#0c7aa5] px-3 py-1.5 text-[14px] text-white"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
