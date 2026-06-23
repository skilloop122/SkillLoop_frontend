"use client";

import React, { useState } from "react";
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
  X,
  CheckCircle2,
  Paperclip,
  Trash2,
  Loader2,
} from "lucide-react";

type AddedSkill = {
  name: string;
  experience: string;
  proofs: string[];
  portfolio: string;
  linkedin: string;
  certification: string;
};

const proofOptions = [
  { value: "portfolio", label: "Portfolio Link" },
  { value: "linkedin", label: "LinkedIn link" },
  { value: "certification", label: "Certifications, others" },
];

export default function ProfileSetup() {
  const router = useRouter();

  const [customSkills, setCustomSkills] = useState<AddedSkill[]>([]);

  const [inputValue, setInputValue] = useState("");
  const [showSuccess] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [skillForm, setSkillForm] = useState({
    skill: "",
    experience: "",
    proofs: [] as string[],
    portfolio: "",
    linkedin: "",
    certification: "",
  });

  const totalSelected = customSkills.length;

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

  const handleAddSkill = (
    skill: string,
    experience = "",
    proofs: string[] = [],
    portfolio = "",
    linkedin = "",
    certification = ""
  ) => {
    const trimmed = skill.trim();
    if (trimmed && !customSkills.some((item) => item.name === trimmed)) {
      setCustomSkills([
        ...customSkills,
        {
          name: trimmed,
          experience: experience.trim() || "2",
          proofs,
          portfolio,
          linkedin,
          certification,
        },
      ]);
      setInputValue("");
    }
  };

  const handleRemoveCustom = (skillToRemove: string) => {
    setCustomSkills(customSkills.filter((skill) => skill.name !== skillToRemove));
  };

  const openSkillDropdown = () => {
    setSkillForm((current) => ({
      ...current,
      skill: inputValue.trim(),
    }));
    setShowSkillDropdown(true);
  };

  const closeSkillDropdown = () => {
    setShowSkillDropdown(false);
  };

  const toggleProof = (proof: string) => {
    setSkillForm((current) => ({
      ...current,
      proofs: current.proofs.includes(proof)
        ? current.proofs.filter((item) => item !== proof)
        : [...current.proofs, proof],
    }));
  };

  const handleDropdownAdd = () => {
    handleAddSkill(
      skillForm.skill,
      skillForm.experience,
      skillForm.proofs,
      skillForm.portfolio,
      skillForm.linkedin,
      skillForm.certification
    );
    setSkillForm({
      skill: "",
      experience: "",
      proofs: [],
      portfolio: "",
      linkedin: "",
      certification: "",
    });
    setShowSkillDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openSkillDropdown();
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasSelectedProof = skillForm.proofs.length > 0;

  const hasFilledSelectedProofs = skillForm.proofs.every((proof) => {
    if (proof === "portfolio") return skillForm.portfolio.trim().length > 0 && isValidUrl(skillForm.portfolio);
    if (proof === "linkedin") return skillForm.linkedin.trim().length > 0 && isValidUrl(skillForm.linkedin);
    if (proof === "certification") return skillForm.certification.trim().length > 0;
    return false;
  });

  const isSkillFormComplete =
    skillForm.skill.trim().length > 0 &&
    skillForm.experience.trim().length > 0 &&
    !isNaN(Number(skillForm.experience.trim())) &&
    hasSelectedProof &&
    hasFilledSelectedProofs;

  const expError = skillForm.experience.trim() && isNaN(Number(skillForm.experience.trim()));
  const portfolioError = skillForm.proofs.includes("portfolio") && skillForm.portfolio.trim() && !isValidUrl(skillForm.portfolio);
  const linkedinError = skillForm.proofs.includes("linkedin") && skillForm.linkedin.trim() && !isValidUrl(skillForm.linkedin);

  const handleContinue = () => {
    if (totalSelected === 0) {
      alert("Please add at least one skill to set up your profile.");
      return;
    }

    const customTitles = customSkills.map((s) => s.name);

    localStorage.setItem(
      "onboarding_teachSkills",
      JSON.stringify(customTitles)
    );

    setContinuing(true);
    setTimeout(() => router.push("/signup/profile/availability"), 400);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-6 overflow-x-hidden overflow-y-auto select-none">
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

      <div className="w-full max-w-[430px] mx-auto pt-6 text-center z-10">
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight mb-2">
          Set up your Profile
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-[430px] mx-auto flex-1 flex flex-col justify-center my-8">
        <div className="w-full space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Add your Skills
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold tracking-wide">
              Add a skill you can confidently teach others.
            </p>
          </div>

          {/* Custom-added skills (card list) */}
          <AnimatePresence>
            {customSkills.map((skill) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="w-full rounded-[25px] bg-white px-4 py-6 shadow-[0_12px_28px_rgba(0,0,0,0.18)] flex items-start justify-between gap-4"
              >
                <div className="w-full">
                  <h3 className="text-xl font-medium text-sky-500">{skill.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{skill.experience} years Experience</p>
                  
                  {skill.proofs && skill.proofs.length > 0 && (
                    <div className="mt-3 text-sm text-slate-600 flex flex-col gap-2">
                      {skill.proofs.includes("portfolio") && skill.portfolio && (
                         <span className="flex items-center gap-1.5"><span className="font-semibold text-slate-400">Portfolio:</span> <a href={skill.portfolio} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-600 underline truncate max-w-[200px]">{skill.portfolio}</a></span>
                      )}
                      {skill.proofs.includes("linkedin") && skill.linkedin && (
                         <span className="flex items-center gap-1.5"><span className="font-semibold text-slate-400">LinkedIn:</span> <a href={skill.linkedin} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-600 underline truncate max-w-[200px]">{skill.linkedin}</a></span>
                      )}
                      {skill.proofs.includes("certification") && skill.certification && (
                         <span className="flex items-center gap-1.5"><span className="font-semibold text-slate-400">Cert:</span> <span className="text-slate-700 truncate max-w-[200px]">{skill.certification}</span></span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(skill.name)}
                  className="mt-1 text-cyan-900 hover:text-sky-600 transition-colors"
                  aria-label={`Remove ${skill.name}`}
                >
                  <Trash2 size={20} strokeWidth={3} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="space-y-4 relative rounded-[4px] bg-white px-3 py-2">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add skill"
                className="w-full bg-transparent pr-12 pl-1 py-2 text-black font-normal text-xl outline-hidden placeholder:text-black transition-all"
              />
              <button
                type="button"
                onClick={openSkillDropdown}
                className="absolute right-1 text-sky-500 hover:text-sky-600 transition-colors p-1"
                aria-label="Open add skill form"
              >
                <Plus size={24} strokeWidth={2} />
              </button>
            </div>

            <div className="flex gap-1.5 w-full">
              {Array.from({ length: 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-0.75 flex-1 rounded-full transition-all duration-300 ${inputValue.trim().length > 0 &&
                      i < Math.ceil((inputValue.trim().length / 15) * 8)
                      ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                      : "bg-sky-500"
                    }`}
                />
              ))}
            </div>

            <AnimatePresence>
              {showSkillDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="relative z-30 mt-3 rounded-[8px] border border-slate-300 bg-white p-3 shadow-2xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-medium text-black">
                      Add skill
                    </h3>
                    <button
                      type="button"
                      onClick={closeSkillDropdown}
                      className="p-1 text-black"
                      aria-label="Close add skill form"
                    >
                      <X size={20} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1 block text-base text-slate-500">
                        Skill
                      </span>
                      <input
                        type="text"
                        value={skillForm.skill}
                        onChange={(e) =>
                          setSkillForm((current) => ({
                            ...current,
                            skill: e.target.value,
                          }))
                        }
                        className="w-full rounded-[8px] border border-slate-500 px-3 py-2 text-base text-gray-500 outline-none"
                        placeholder="UI/UX Design"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 flex items-center justify-between text-base text-slate-500">
                        <span>Years of Experience</span>
                        {expError ? <span className="text-xs text-red-500">Must be a number</span> : null}
                      </span>
                      <input
                        type="text"
                        value={skillForm.experience}
                        onChange={(e) =>
                          setSkillForm((current) => ({
                            ...current,
                            experience: e.target.value,
                          }))
                        }
                        className={`w-full rounded-[8px] border px-3 py-2 text-base outline-none ${expError ? "border-red-500 text-red-500 focus:border-red-600" : "border-slate-500 text-gray-500"}`}
                        placeholder="2"
                      />
                    </label>

                    <div className="rounded-[8px] border border-slate-500 p-2">
                      <span className="mb-1 block text-base text-slate-500">
                        Proof of Skill
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {proofOptions.map((option) => {
                          const isSelected = skillForm.proofs.includes(
                            option.value
                          );

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleProof(option.value)}
                              className={`rounded-[6px] border px-3 py-1.5 text-sm font-medium transition-colors ${isSelected
                                  ? "border-sky-500 bg-sky-50 text-sky-600"
                                  : "border-slate-300 bg-white text-slate-600"
                                }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-3 text-sm text-slate-400">
                        Add at least one proof of your skills
                      </p>

                      {skillForm.proofs.includes("portfolio") && (
                        <label className="mt-4 block">
                          <span className="mb-1 flex items-center justify-between text-base text-slate-500">
                            <span>Portfolio Link</span>
                            {portfolioError ? <span className="text-xs text-red-500">Invalid URL</span> : null}
                          </span>
                          <input
                            type="url"
                            value={skillForm.portfolio}
                            onChange={(e) =>
                              setSkillForm((current) => ({
                                ...current,
                                portfolio: e.target.value,
                              }))
                            }
                            className={`w-full rounded-[8px] border px-3 py-2 text-sm outline-none ${portfolioError ? "border-red-500 text-red-500" : "border-black text-black"}`}
                            placeholder="https://yourportfolio.com"
                          />
                        </label>
                      )}

                      {skillForm.proofs.includes("linkedin") && (
                        <label className="mt-4 block">
                          <span className="mb-1 flex items-center justify-between text-base text-slate-500">
                            <span>LinkedIn link</span>
                            {linkedinError ? <span className="text-xs text-red-500">Invalid URL</span> : null}
                          </span>
                          <input
                            type="url"
                            value={skillForm.linkedin}
                            onChange={(e) =>
                              setSkillForm((current) => ({
                                ...current,
                                linkedin: e.target.value,
                              }))
                            }
                            className={`w-full rounded-[8px] border px-3 py-2 text-sm outline-none ${linkedinError ? "border-red-500 text-red-500" : "border-black text-black"}`}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </label>
                      )}

                      {skillForm.proofs.includes("certification") && (
                        <div className="mt-4">
                          <span className="mb-1 block text-base text-slate-500">
                            Certifications, others
                          </span>
                          <label className="flex w-full cursor-pointer items-center gap-3 rounded-[8px] border border-black px-3 py-2 text-sm text-slate-500">
                            <Paperclip size={20} className="text-black" />
                            <span>
                              {skillForm.certification || "Upload file"}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                setSkillForm((current) => ({
                                  ...current,
                                  certification:
                                    e.target.files?.[0]?.name || "",
                                }))
                              }
                            />
                          </label>
                        </div>
                      )}

                      {/* <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={closeSkillDropdown}
                          className="border border-black px-4 py-1.5 text-base text-black"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleDropdownAdd}
                          disabled={!skillForm.skill.trim()}
                          className="rounded-[2px] bg-slate-400 px-4 py-1.5 text-base text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Add
                        </button>
                      </div> */}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={closeSkillDropdown}
                        className="rounded-[6px] border border-sky-500 px-4 py-1.5 text-base text-sky-500"
                      >
                        Discard
                      </button>

                      <button
                        type="button"
                        onClick={handleDropdownAdd}
                        disabled={!isSkillFormComplete}
                        className={`rounded-[6px] px-4 py-1.5 text-base text-white transition-colors ${isSkillFormComplete
                            ? "bg-sky-500 hover:bg-sky-400"
                            : "bg-sky-300 cursor-not-allowed opacity-60"
                          }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[430px] mx-auto z-10">
        <button
          type="button"
          onClick={handleContinue}
          disabled={continuing}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 disabled:cursor-not-allowed text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-98 transition-all text-base text-center flex items-center justify-center gap-2"
        >
          {continuing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving Skills...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircle2
                  size={40}
                  strokeWidth={2}
                  className="animate-bounce"
                />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">
                Profile Complete!
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Welcome to SkilLoop. Your skills are now registered. Let&apos;s
                find your first match!
              </p>
              <div className="w-10 h-1 bg-sky-500 rounded-full animate-pulse mt-2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}