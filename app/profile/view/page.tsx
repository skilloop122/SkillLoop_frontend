"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Star, Loader2, Globe, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileStore, scheduleTime } from "../../../lib/profileStore";
import { useRequestStore } from "../../../lib/requestStore";
import { useSkillsStore, findListingForSkill } from "../../../lib/skillsStore";
import type { SkillSlotsResponse } from "../../../lib/requestStore";

function toLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nextDateForDay(day: string, from: Date = new Date()): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const target = days.indexOf(day);
  if (target === -1) return toLocalDate(from);
  let diff = (target - from.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  const d = new Date(from);
  d.setDate(d.getDate() + diff);
  return toLocalDate(d);
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [requestSent, setRequestSent] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    skillListingId: "",
    schedulingLink: "",
    message: "",
    proposedDate: "",
    proposedTime: "",
  });
  const [slots, setSlots] = useState<SkillSlotsResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);

  const { publicProfile, loading, error, fetchPublicProfile } = useProfileStore();
  const { createRequest, loading: requestLoading, error: requestError, fetchSkillSlots } = useRequestStore();
  const { fetchSkillListings } = useSkillsStore();
  const [resolvedTeachSkills, setResolvedTeachSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile(userId).then(res => {
        if (res.success && res.profile?.teachSkills?.length) {
          const profile = res.profile;
          fetchSkillListings({ limit: 200 }).then(listingRes => {
            const allListings = listingRes.success && listingRes.listings ? listingRes.listings : [];
            const listings = allListings.filter((l) => l.userId === userId);
            const resolved = profile.teachSkills
              .map((s: { id?: string; name?: string } | string) => {
                const skillName = typeof s === "string" ? s : (s.name || s.id || "");
                const listing = findListingForSkill(listings, skillName);
                return {
                  id: listing?.id || "",
                  name: skillName || listing?.title || "Unknown Skill",
                };
              })
              .filter((s) => s.id);
            setResolvedTeachSkills(resolved);
          });
        }
      });
    }
  }, [userId, fetchPublicProfile, fetchSkillListings]);

  const availabilityOptions = useMemo(() => {
    if (!publicProfile?.schedule?.length) return [];
    return publicProfile.schedule.map((s) => ({
      day: s.day,
      time: scheduleTime(s),
      date: nextDateForDay(s.day),
    }));
  }, [publicProfile]);

  const loadSlots = useCallback((skillId: string, date?: string) => {
    if (!skillId) return;
    const targetDate = date || slotDate;
    setSlotsLoading(true);
    setSlotsError("");
    setSlots([]);
    setSelectedSlot(null);
    setFormData(prev => ({ ...prev, proposedDate: "", proposedTime: "" }));
    fetchSkillSlots(skillId, targetDate).then(res => {
      if (res.success && res.data) {
        setSlots(res.data);
      } else {
        setSlotsError(res.message || "Failed to load available slots.");
      }
      setSlotsLoading(false);
    });
  }, [fetchSkillSlots, slotDate]);

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
  const skillOptions = resolvedTeachSkills;

  const initials = (profile?.firstName?.[0] ?? "?").toUpperCase() + (profile?.lastName?.[0] ?? "").toUpperCase();

  return (
    <div className="min-h-screen bg-sky-50 font-sans flex text-black">
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Left: Image */}
        <div className="relative w-full md:w-1/2 min-h-[40vh] md:min-h-screen bg-slate-100">
          <Image
            src="/hero_collaboration.png"
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

          {/* Availability */}
          <section className="mb-8">
            <h2 className="mb-2 text-[18px] font-semibold text-black">Availability</h2>
            {profile?.schedule && profile.schedule.length > 0 ? (
              <ul className="space-y-1">
                {profile.schedule.map((slot, idx: number) => (
                  <li key={idx} className="text-[15px] text-slate-700 flex items-center justify-between bg-slate-50 p-3 rounded-[8px] mb-2 border border-slate-100">
                    <span className="font-medium">{slot.day}</span>
                    <span className="text-slate-500">{scheduleTime(slot)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-slate-500">No availability set.</p>
            )}
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                const defaultSkillId = skillOptions[0]?.id || "";
                const firstDay = profile?.schedule && profile.schedule.length > 0 ? profile.schedule[0].day : "";
                const initialDate = firstDay ? nextDateForDay(firstDay) : toLocalDate(new Date(Date.now() + 86400000));
                setFormData(prev => ({ ...prev, skillListingId: defaultSkillId }));
                setSlotDate(initialDate);
                setShowRequestForm(true);
                loadSlots(defaultSkillId, initialDate);
              }}
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

      {showRequestForm && !requestSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 md:px-8">
          <div className="w-full max-w-md rounded-xl bg-white p-6 md:p-8 text-black shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Request a Session</h2>
            
            <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-100">
              <h3 className="font-semibold text-sm text-sky-800 mb-2">User&apos;s Availability</h3>
              {profile?.schedule && profile.schedule.length > 0 ? (
                <ul className="space-y-1">
                  {profile.schedule.map((slot, idx: number) => (
                    <li key={idx} className="text-sm text-slate-700 flex justify-between">
                      <span className="font-medium">{slot.day}</span>
                      <span>{scheduleTime(slot)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No specific availability set.</p>
              )}
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const result = await createRequest({
                ...formData,
                skillListingId: formData.skillListingId || "default-id"
              });
              if (result.success) {
                setShowRequestForm(false);
                setRequestSent(true);
              }
            }} className="space-y-4">
              
              {requestError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {requestError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skill to Learn</label>
                {skillOptions.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-sm">
                    This user hasn&apos;t set up any available sessions yet. Ask them to save their profile to enable session requests.
                  </div>
                ) : (
                <select 
                  required
                  className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  value={formData.skillListingId}
                  onChange={(e) => {
                    const next = e.target.value;
                    setFormData({...formData, skillListingId: next});
                    loadSlots(next, slotDate);
                  }}
                >
                  <option value="" disabled>Select a skill</option>
                  {skillOptions.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select an Available Slot</label>

                {availabilityOptions.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Available Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {availabilityOptions.map((opt) => {
                        const isActive = slotDate === opt.date;
                        return (
                          <button
                            key={opt.day}
                            type="button"
                            onClick={() => {
                              setSlotDate(opt.date);
                              if (formData.skillListingId) loadSlots(formData.skillListingId, opt.date);
                            }}
                            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-[#0ea5e9] border-[#0ea5e9] text-white"
                                : "bg-white border-slate-200 text-slate-700 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                            }`}
                          >
                            {opt.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    min={toLocalDate(new Date())}
                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={slotDate}
                    onChange={(e) => {
                      const next = e.target.value;
                      setSlotDate(next);
                      if (formData.skillListingId) loadSlots(formData.skillListingId, next);
                    }}
                  />
                </div>

                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading available slots...</span>
                  </div>
                ) : slotsError ? (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {slotsError}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-sm">
                    No available slots for this skill right now. Try another skill.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {slots.map((daySlots) => (
                      <div key={daySlots.date}>
                        <p className="text-xs font-semibold text-slate-600 mb-1.5 capitalize">
                          {daySlots.day}, {daySlots.date}
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {daySlots.slots.map((slot) => {
                            const isSelected = selectedSlot?.date === daySlots.date && selectedSlot?.startTime === slot.startTime;
                            return (
                              <button
                                key={slot.startTime}
                                type="button"
                                onClick={() => {
                                  setSelectedSlot({ date: daySlots.date, startTime: slot.startTime, endTime: slot.endTime });
                                  setFormData(prev => ({ ...prev, proposedDate: daySlots.date, proposedTime: slot.startTime }));
                                }}
                                className={`px-1.5 py-2 rounded-md border text-xs font-semibold transition-all ${
                                  isSelected
                                    ? "bg-[#0ea5e9] border-[#0ea5e9] text-white"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                                }`}
                              >
                                {slot.startTime}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSlot && (
                  <p className="text-xs text-slate-500 mt-2">
                    Selected: {selectedSlot.startTime} - {selectedSlot.endTime} on {selectedSlot.date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduling Link (Optional)</label>
                <input 
                  type="url" 
                  placeholder="e.g., https://calendly.com/your-link"
                  className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  value={formData.schedulingLink}
                  onChange={(e) => setFormData({...formData, schedulingLink: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  required
                  placeholder="Hi, I'd like to learn more about..."
                  rows={3}
                  className="w-full rounded-md border border-slate-300 p-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 rounded-md border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="flex-1 rounded-md bg-[#0ea5e9] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors disabled:opacity-50"
                >
                  {requestLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              onClick={() => {
                setRequestSent(false);
              }}
              className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
            >
              Close
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
