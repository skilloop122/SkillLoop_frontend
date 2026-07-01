"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Star, Loader2, Globe, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileStore } from "../../../lib/profileStore";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [requestSent, setRequestSent] = useState(false);
  const { publicProfile, loading, error, fetchPublicProfile } = useProfileStore();

  useEffect(() => {
    if (userId) {
      fetchPublicProfile(userId);
    }
  }, [userId, fetchPublicProfile]);

  if (loading && !publicProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (error && !publicProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sky-50 text-black p-5 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => userId && fetchPublicProfile(userId)}
          className="rounded-[4px] bg-[#0ea5e9] px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const profile = publicProfile;
  const fullName = profile ? (profile.firstName + " " + profile.lastName) : "User";
  const bio = profile?.bio || "No bio provided.";
  const extractNames = (arr: unknown) =>
    (Array.isArray(arr) ? arr : []).map((s: unknown) => (typeof s === "string" ? s : (s as { name?: string })?.name || "")).filter(Boolean);
  const teachSkills = extractNames(profile?.teachSkills);
  const learnSkills = extractNames(profile?.learnSkills);

  const initials = (profile?.firstName?.[0] ?? "?").toUpperCase() + (profile?.lastName?.[0] ?? "").toUpperCase();

  return (
    <div className="min-h-screen bg-sky-50 font-sans flex text-black">
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Left: Image */}
        <div className="relative w-full md:w-1/2 min-h-[40vh] md:min-h-screen bg-slate-100">
          <Image
            src="/james_klin.png"
            alt={fullName}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-4 top-6 z-20 flex h-9 w-11 items-center justify-center rounded-[4px] border border-white/60 bg-white/20 text-white backdrop-blur-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={1.8} />
          </button>
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
                <p className="text-[16px] text-slate-500">
                  {profile?.email || profile?.phoneNumber || "User Profile"}
                </p>
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
              {bio}
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
              onClick={() => setRequestSent(true)}
              className="flex-1 rounded-[12px] bg-[#0ea5e9] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-500 transition-colors"
            >
              Request Session
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

      {requestSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-8">
          <div className="w-full max-w-[236px] rounded-[4px] bg-white px-5 py-7 text-center text-black shadow-2xl">
            <div className="mx-auto mb-5 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#0ea5e9] text-white">
              <Check className="h-12 w-12" strokeWidth={4} />
            </div>
            <h2 className="text-[18px] font-semibold">Request Sent!</h2>
            <p className="mb-4 text-[15px] leading-snug">
              Waiting for {profile?.firstName || "them"} to accept your request.
            </p>
            <button
              type="button"
              onClick={() => router.push("/sessions")}
              className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
            >
              Go to Sessions
            </button>
          </div>
        </div>
      )}
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
  if (items.length === 0) return <p className="text-[14px] text-slate-400">None specified.</p>;
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

export default function ViewProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-sky-50 text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
