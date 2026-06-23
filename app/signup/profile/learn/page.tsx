"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../../../lib/authStore";
import { useProfileStore } from "../../../../lib/profileStore";
import type { Schedule } from "../../../../lib/profileStore";
import { useSkillsStore } from "../../../../lib/skillsStore";

// PRESET_SKILLS replaced by live API — see useSkillsStore below

export default function LearnSkills() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { createProfile, loading } = useProfileStore();
  const { user } = useAuthStore();
  const { skills: apiSkills, loading: skillsLoading, fetchSkills } = useSkillsStore();

  useEffect(() => {
    fetchSkills({ limit: "50" });
  }, [fetchSkills]);

  const allSkills = [...apiSkills, ...customSkills.map((s) => ({ id: `custom-${s}`, name: s }))];

  const getSkillKey = (s: { id: string; name: string }) => s.id;
  const getSkillName = (s: { id: string; name: string }) => s.name;

  const bgIcons = [
    { icon: Atom,     top: "5%",  left: "8%",   size: 36, delay: 0   },
    { icon: Terminal, top: "9%",  right: "9%",  size: 28, delay: 1   },
    { icon: Palette,  top: "20%", left: "14%",  size: 32, delay: 2   },
    { icon: Database, top: "27%", right: "5%",  size: 40, delay: 0.5 },
    { icon: Settings, top: "43%", left: "4%",   size: 30, delay: 1.5 },
    { icon: FileCode, top: "53%", right: "16%", size: 34, delay: 2.5 },
    { icon: BarChart, top: "67%", left: "9%",   size: 38, delay: 0.8 },
    { icon: Cpu,      top: "77%", right: "7%",  size: 32, delay: 1.2 },
    { icon: Atom,   bottom: "5%", left: "16%",  size: 28, delay: 2   },
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !allSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSkills((prev) => [...prev, trimmed]);
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleFindMatches = async () => {
    if (selectedSkills.length === 0) {
      alert("Please select at least one skill you want to learn.");
      return;
    }

    setErrorMsg("");

    // Read data persisted by previous onboarding steps
    let teachSkills: string[] = [];
    let schedule: Schedule[] = [];

    try {
      const rawTeach = localStorage.getItem("onboarding_teachSkills");
      if (rawTeach) teachSkills = JSON.parse(rawTeach) as string[];
    } catch { /* ignore */ }

    try {
      const rawAvail = localStorage.getItem("userAvailability");
      if (rawAvail) {
        const avail = JSON.parse(rawAvail) as {
          days: string[];
          timeRanges: Record<string, { start: string; end: string }>;
        };
        schedule = avail.days.map((day) => ({
          day,
          time: avail.timeRanges?.[day]
            ? `${avail.timeRanges[day].start} - ${avail.timeRanges[day].end}`
            : "",
        }));
      }
    } catch { /* ignore */ }

    const payload = {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      teachSkills,
      learnSkills: selectedSkills,
      schedule,
    };

    const result = await createProfile(payload);

    if (!result.success) {
      setErrorMsg(result.message ?? "Profile creation failed. Please try again.");
      return;
    }

    // Clean up onboarding keys
    localStorage.removeItem("onboarding_teachSkills");
    localStorage.removeItem("userAvailability");

    setShowSuccess(true);
    setTimeout(() => {
      router.push("/explore");
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col py-10 px-6 overflow-hidden select-none">

      {/* Scattered Tech Icons Background */}
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
                animationDuration: "4s"
              }}
            >
              <IconComp size={item.size} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 w-full max-w-[600px] mx-auto text-center mb-6">
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight">
          Set up your Profile
        </h1>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 w-full max-w-[600px] mx-auto flex-1 flex flex-col gap-6">

        {/* Section heading */}
        <div className="space-y-1.5">
          <h2 className="text-[1.75rem] font-extrabold text-slate-900 leading-tight">
            Choose the skill you want to learn
          </h2>
          <p className="text-sm font-medium text-slate-500">
            We will match you with people who can teach you.
          </p>
        </div>

        {/* Toggleable Skill Grid — API-sourced */}
        {skillsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={28} className="animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <AnimatePresence>
              {allSkills.filter((s) => s.name).map((skill) => {
                const key = getSkillKey(skill);
                const name = getSkillName(skill);
                const isSelected = selectedSkills.includes(name);
                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => toggleSkill(name)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${
                      isSelected
                        ? "bg-sky-500 text-white shadow-sky-200"
                        : "bg-[#c1c1c1] text-[#000000]/50 hover:bg-slate-300"
                    }`}
                  >
                    {name}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Add Custom Skill — mockup-accurate layout */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Add Custom skill</p>
          <div className="flex items-center gap-3">
            {/* Wide white rounded input */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:border-sky-300 transition-all">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                className="w-full bg-transparent text-slate-800 font-medium text-sm outline-hidden"
              />
            </div>
            {/* Square blue + button */}
            <button
              type="button"
              onClick={handleAddCustom}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-300/40 active:scale-95 transition-all shrink-0"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>

      {/* ── Find Matches Button — pill shape ── */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto mt-8 flex flex-col gap-3">
        {errorMsg && (
          <p className="text-center text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {errorMsg}
          </p>
        )}
        <button
          id="find-matches-btn"
          onClick={handleFindMatches}
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating Profile...
            </>
          ) : (
            "Find Matches"
          )}
        </button>
      </div>

      {/* ── Profile Complete Full-Screen Overlay ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
          >
            {/* Same scattered icon background */}
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
                      animationDuration: "4s"
                    }}
                  >
                    <IconComp size={item.size} strokeWidth={1.5} />
                  </div>
                );
              })}
            </div>

            {/* Center content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
              {/* Big sky-blue circle with white checkmark */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
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
                  You are all set&nbsp;🎉
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Find the best matches for you.
                </p>
              </motion.div>
            </div>

            {/* Go to Discover button pinned at the bottom */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="relative z-10 w-full max-w-[430px] mx-auto px-6 pb-10"
            >
              <button
                onClick={() => router.push("/explore")}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base"
              >
                Go to Discover
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
