"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  AlertCircle,
} from "lucide-react";
import { useSkillsStore } from "@/lib/skillsStore";
import { useToast } from "@/hooks/useToast";

export default function ProfileSetupLearnPage() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toastElement, showToast } = useToast();
  const [customInput, setCustomInput] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [continuing, setContinuing] = useState(false);

  const { skills: apiSkills, loading: skillsLoading, fetchSkills } = useSkillsStore();

  useEffect(() => {
    fetchSkills({ limit: "50" });
  }, [fetchSkills]);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    try {
      const saved = localStorage.getItem("onboarding_learnSkills");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedSkills(parsed);
        }
      }
    } catch {
      // Ignore invalid saved data
    }
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, []);

  const allSkills = [...apiSkills, ...customSkills.map((s) => ({ id: `custom-${s}`, name: s }))];

  const categories = [...new Set(apiSkills.map((s) => s.category).filter(Boolean))].sort();
  const [skillCategory, setSkillCategory] = useState("");

  const visibleSkills = (() => {
    if (!skillCategory) return [];
    if (skillCategory === "custom") {
      return customSkills.map((s) => ({ id: `custom-${s}`, name: s }));
    }
    return allSkills.filter(
      (s) =>
        "category" in s &&
        (s as { category?: string }).category === skillCategory &&
        !s.id.startsWith("custom-")
    );
  })();

  const getSkillKey = (s: { id: string; name: string }) => s.id;
  const getSkillName = (s: { id: string; name: string }) => s.name;

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

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !allSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
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

  const handleContinue = () => {
    if (selectedSkills.length === 0) {
      showToast("Please select at least one skill you want to learn.");
      return;
    }

    localStorage.setItem("onboarding_learnSkills", JSON.stringify(selectedSkills));

    setContinuing(true);
    setTimeout(() => router.push("/signup/profile/availability"), 400);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-6 overflow-x-hidden overflow-y-auto select-none">
      {/* Scattered Tech Icons Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {bgIcons.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="absolute text-blue-300/50 dark:text-blue-300/30 animate-pulse"
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

      {/* ── Header ── */}
      <div className="w-full max-w-107.5 mx-auto pt-6 text-center z-10">
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight mb-2">
          Set up your Profile
        </h1>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col gap-6 my-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="hidden lg:flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-[40px] shadow-2xl">
              <Image
                src="/hero_collaboration.png"
                alt="SkilLoop Skills Collaboration"
                fill
                priority
                quality={95}
                className="object-cover object-center select-none"
              />
            </div>
          </div>

          <div className="w-full space-y-6 order-1 lg:order-2">
            {/* Section heading */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
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
              <>
                <div className="flex items-center gap-3">
                  <label className="block flex-1">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-500">
                      Select Category
                    </span>
                    <select
                      value={skillCategory}
                      onChange={(e) => {
                        setSkillCategory(e.target.value);
                        setSelectedSkills((prev) =>
                          prev.filter((s) => visibleSkills.some((vs) => vs.name === s))
                        );
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      {customSkills.length > 0 && <option value="custom">My Custom Skills</option>}
                    </select>
                  </label>
                </div>

                {!skillCategory ? (
                  <p className="text-sm text-slate-400">Select a category to see available skills.</p>
                ) : visibleSkills.length === 0 ? (
                  <p className="text-sm text-slate-400">No skills in this category.</p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    <AnimatePresence>
                      {visibleSkills
                        .filter((s) => s.name)
                        .map((skill) => {
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
                              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${isSelected
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
              </>
            )}

            {/* Add Custom Skill */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Add Custom skill</p>
              <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* ── Continue Button & Info Banner ── */}
      <div className="relative z-10 w-full max-w-107.5 mx-auto mt-8 flex flex-col gap-4">
        {/* Info Banner matching user specification */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-sky-400 bg-sky-100/70 px-4.5 py-3.5 shadow-xs">
          <AlertCircle className="h-6 w-6 text-sky-500 shrink-0" strokeWidth={2} />
          <p className="text-sm sm:text-[15px] font-normal text-slate-900 leading-snug">
            Select skills you want to learn in order to be matched with the right teacher.
          </p>
        </div>

        <button
          id="continue-btn"
          type="button"
          onClick={handleContinue}
          disabled={(continuing || selectedSkills.length === 0)}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base flex items-center justify-center gap-2"
        >
          {/* {continuing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )} */}
          Continue
        </button>
      </div>

      {toastElement}
    </div>
  );
}
