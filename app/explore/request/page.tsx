"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Atom,
  Terminal,
  Palette,
  Database,
  Settings,
  FileCode,
  BarChart,
  Cpu,
  Loader2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useProfileStore, Schedule } from "../../../lib/profileStore";
import { useRequestStore } from "../../../lib/requestStore";
import type { ZoomStatus } from "../../../lib/requestStore";

import { Suspense } from "react";

function RequestSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");

  const { publicProfile, fetchPublicProfile, loading: profileLoading } = useProfileStore();
  const { createRequest, loading: requestLoading, error: requestError, checkZoomStatus } = useRequestStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [zoomStatus, setZoomStatus] = useState<ZoomStatus | null>(null);

  const [skillListingId, setSkillListingId] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [sessionLink, setSessionLink] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (matchId) {
      fetchPublicProfile(matchId);
    }
  }, [matchId, fetchPublicProfile]);

  useEffect(() => {
    checkZoomStatus().then(res => {
      if (res.data) setZoomStatus(res.data);
    });
  }, [checkZoomStatus]);


  const bgIcons = [
    { icon: Atom, top: "5%", left: "8%", size: 36, delay: 0 },
    { icon: Terminal, top: "9%", right: "9%", size: 28, delay: 1 },
    { icon: Palette, top: "20%", left: "14%", size: 32, delay: 2 },
    { icon: Database, top: "27%", right: "5%", size: 40, delay: 0.5 },
    { icon: Settings, top: "43%", left: "4%", size: 30, delay: 1.5 },
    { icon: FileCode, top: "53%", right: "16%", size: 34, delay: 2.5 },
    { icon: BarChart, top: "67%", left: "9%", size: 38, delay: 0.8 },
    { icon: Cpu, top: "77%", right: "7%", size: 32, delay: 1.2 },
    { icon: Atom, bottom: "5%", left: "16%", size: 28, delay: 2 },
  ];

  const profile = publicProfile;
  const effectiveSkillListingId = skillListingId || (profile?.teachSkills?.length ? (profile.teachSkills[0].id || profile.teachSkills[0].name || "") : "");
  console.log("REQUEST PAGE - skillListingId:", skillListingId, "effectiveSkillListingId:", effectiveSkillListingId, "teachSkills:", profile?.teachSkills);

  const handleConfirmSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!proposedDate || !proposedTime || !effectiveSkillListingId || !message) {
      alert("Please fill in all required fields.");
      return;
    }
    console.log("CREATING REQUEST WITH:", { skillListingId: effectiveSkillListingId, schedulingLink: sessionLink, message, proposedDate, proposedTime });
    const result = await createRequest({
      skillListingId: effectiveSkillListingId,
      schedulingLink: sessionLink,
      message,
      proposedDate,
      proposedTime
    });
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/explore");
      }, 5000);
    }
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "User";

  return (
    <div className="min-h-screen bg-white font-sans pb-10">
      <div className="w-full max-w-md md:max-w-6xl md:pt-16  mx-auto px-5 pt-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 border border-[#0ea5e9] rounded-[4px] flex items-center justify-center mb-6 hover:bg-sky-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={1.5} />
        </button>

        {profileLoading ? (
          <div className="flex justify-center py-20">
            <span className="text-slate-500">Loading profile...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden bg-sky-100 flex items-center justify-center shrink-0 ring-4 ring-white shadow-md">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-sky-600">
                    {(profile?.firstName?.[0] || "?").toUpperCase()}{(profile?.lastName?.[0] || "").toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-[26px] font-medium text-black leading-tight mb-1">
                  {fullName}
                </h1>
                <span className="inline-block bg-[#ccebf8] text-[#334155] text-[13px] font-medium px-3 py-1 rounded-[4px]">
                  Teaching
                </span>
              </div>
            </div>

            {/* <div className="mb-8 p-5 bg-sky-50 rounded-xl border border-sky-100">
              <h2 className="text-lg font-semibold text-sky-800 mb-3">User&apos;s Availability</h2>
              {profile?.schedule && profile.schedule.length > 0 ? (
                <ul className="space-y-2">
                  {profile.schedule.map((slot: Schedule, idx: number) => (
                    <li key={idx} className="text-[15px] text-slate-700 flex justify-between bg-white px-4 py-2 rounded-lg border border-slate-200">
                      <span className="font-medium text-sky-900">{slot.day}</span>
                      <span>{slot.time}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] text-slate-500">No specific availability set.</p>
              )}
            </div> */}

            {requestError && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {requestError}
              </div>
            )}

            {zoomStatus && (
              <div className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${zoomStatus.connected && zoomStatus.isConfigured ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${zoomStatus.connected && zoomStatus.isConfigured ? "bg-emerald-500" : "bg-amber-400"}`} />
                <div>
                  <p className="font-semibold mb-0.5">{zoomStatus.connected && zoomStatus.isConfigured ? "Zoom integration is active" : "Zoom not connected"}</p>
                  <p className="font-normal">{zoomStatus.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmSession}>
              <div className="mb-6">
              <label className="block text-[15px] font-medium text-black mb-2">Skill to Learn *</label>
              <select 
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[15px] font-medium text-black outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 transition-all"
                value={effectiveSkillListingId}
                onChange={(e) => setSkillListingId(e.target.value)}
              >
                <option value="" disabled>Select a skill...</option>
                {profile?.teachSkills?.map((skill: { id?: string; name?: string } | string, index: number) => {
                  const skillId = typeof skill === 'string' ? skill : (skill.id || skill.name || `skill-${index}`);
                  const skillName = typeof skill === 'string' ? skill : (skill.name || "Unknown Skill");
                  return (
                    <option key={skillId} value={skillId}>
                      {skillName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-[15px] font-medium text-black mb-2">Proposed Day *</label>
                <select 
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[15px] font-medium text-black outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 transition-all"
                  value={proposedDate}
                  onChange={(e) => {
                    setProposedDate(e.target.value);
                    setProposedTime("");
                  }}
                >
                  <option value="" disabled>Select a day</option>
                  {profile?.schedule?.map((slot: Schedule) => (
                    <option key={slot.day} value={slot.day}>{slot.day}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[15px] font-medium text-black mb-2">Proposed Time *</label>
                <input 
                  type="time" 
                  required
                  min={profile?.schedule?.find((s: Schedule) => s.day === proposedDate)?.time?.split(" - ")[0]}
                  max={profile?.schedule?.find((s: Schedule) => s.day === proposedDate)?.time?.split(" - ")[1]}
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[15px] font-medium text-black outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 transition-all"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                />
                {proposedDate && profile?.schedule?.find((s: Schedule) => s.day === proposedDate) && (
                  <p className="text-xs text-slate-500 mt-1">Available: {profile?.schedule?.find((s: Schedule) => s.day === proposedDate)?.time}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[15px] font-medium text-black mb-2">Scheduling Link (Optional)</label>
              <input
                type="url"
                value={sessionLink}
                onChange={(e) => setSessionLink(e.target.value)}
                placeholder="e.g. https://calendly.com/your-link"
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[15px] font-medium text-black outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="mb-8">
              <label className="block text-[15px] font-medium text-black mb-2">Message *</label>
              <textarea 
                required
                placeholder="Hi, I'd like to learn more about..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[15px] font-medium text-black outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-400 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

              <button
                id="confirm-session-btn"
                type="submit"
                disabled={requestLoading}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold py-4 rounded-xl text-[17px] shadow-sm transition-colors disabled:opacity-50"
              >
                {requestLoading ? "Sending..." : "Confirm Session"}
              </button>
            </form>
          </>
        )}

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {bgIcons.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={idx}
                      className="absolute text-sky-200/60 animate-pulse"
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

              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 22,
                    delay: 0.1,
                  }}
                  className="w-36 h-36 rounded-full bg-sky-500 shadow-2xl shadow-sky-300/50 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 52 52"
                    className="w-20 h-20"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="10,28 21,39 42,16" />
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    You are all set 🎉
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Your session has been requested.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="relative z-10 w-full max-w-[430px] mx-auto px-6 pb-10"
              >
                <button
                  type="button"
                  onClick={() => router.push("/explore")}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base"
                >
                  Back to Explore
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RequestSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    }>
      <RequestSessionContent />
    </Suspense>
  );
}