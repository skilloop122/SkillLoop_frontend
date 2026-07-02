"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, X, Loader2, Plus, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useProfileStore, UpdateProfilePayload, Skill, Schedule, UserProfile } from "../../../lib/profileStore";
import { useAuthStore } from "../../../lib/authStore";
import { useSkillsStore } from "../../../lib/skillsStore";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type TimeRange = { start: string; end: string };

function parseScheduleToState(schedule: Schedule[] | undefined) {
  const days: string[] = [];
  const ranges: Record<string, TimeRange> = {};
  for (const s of schedule ?? []) {
    days.push(s.day);
    const parts = s.time.split(" - ");
    ranges[s.day] = {
      start: parts[0] || "09:00",
      end: parts[1] || "16:00",
    };
  }
  return { days, ranges };
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const { skills: apiSkills, loading: skillsLoading } = useSkillsStore();
  const { updateProfile, loading } = useProfileStore();
  const router = useRouter();
  const { user } = useAuthStore();

  const { days: initialDays, ranges: initialRanges } = parseScheduleToState(profile.schedule);

  const [draft, setDraft] = useState<UpdateProfilePayload>({
    bio: profile.bio,
    phoneNumber: profile.phoneNumber,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    twitterUrl: profile.twitterUrl,
    portfolioUrl: profile.portfolioUrl,
    avatarUrl: profile.avatarUrl,
  });

  const [teachSkills, setTeachSkills] = useState<string[]>(
    profile.teachSkills.map((s) => (typeof s === "string" ? s : s.name))
  );
  const [learnSkills, setLearnSkills] = useState<string[]>(
    profile.learnSkills.map((s) => (typeof s === "string" ? s : s.name))
  );
  const [teachCustomInput, setTeachCustomInput] = useState("");
  const [learnCustomInput, setLearnCustomInput] = useState("");
  const [customTeachSkills, setCustomTeachSkills] = useState<string[]>([]);
  const [customLearnSkills, setCustomLearnSkills] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [timeRanges, setTimeRanges] = useState<Record<string, TimeRange>>(initialRanges);
  const [activeDay, setActiveDay] = useState(initialDays.length > 0 ? initialDays[0] : "");

  const allTeachSkills = [...apiSkills, ...customTeachSkills.map((s) => ({ id: `custom-${s}`, name: s }))];
  const allLearnSkills = [...apiSkills, ...customLearnSkills.map((s) => ({ id: `custom-${s}`, name: s }))];

  const handleUpdate = (field: keyof UpdateProfilePayload, value: string | (string | Skill)[] | undefined) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTeach = (name: string) => {
    setTeachSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const toggleLearn = (name: string) => {
    setLearnSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const addCustom = (type: "teach" | "learn") => {
    const input = type === "teach" ? teachCustomInput : learnCustomInput;
    const trimmed = input.trim();
    if (!trimmed) return;
    const pool = type === "teach" ? allTeachSkills : allLearnSkills;
    if (pool.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    if (type === "teach") {
      setCustomTeachSkills((prev) => [...prev, trimmed]);
      setTeachSkills((prev) => [...prev, trimmed]);
      setTeachCustomInput("");
    } else {
      setCustomLearnSkills((prev) => [...prev, trimmed]);
      setLearnSkills((prev) => [...prev, trimmed]);
      setLearnCustomInput("");
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent, type: "teach" | "learn") => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom(type);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const isSelected = prev.includes(day);
      if (isSelected) {
        const nextRanges = { ...timeRanges };
        delete nextRanges[day];
        setTimeRanges(nextRanges);
        if (activeDay === day) setActiveDay("");
        return prev.filter((d) => d !== day);
      }
      setActiveDay(day);
      setTimeRanges((current) => ({
        ...current,
        [day]: current[day] || { start: "09:00", end: "16:00" },
      }));
      return [...prev, day];
    });
  };

  const updateTimeRange = (day: string, field: keyof TimeRange, value: string) => {
    setTimeRanges((current) => ({
      ...current,
      [day]: {
        start: current[day]?.start || "09:00",
        end: current[day]?.end || "16:00",
        [field]: value,
      },
    }));
  };

  const removeDay = (day: string) => {
    setSelectedDays((prev) => prev.filter((d) => d !== day));
    setTimeRanges((current) => {
      const next = { ...current };
      delete next[day];
      return next;
    });
    if (activeDay === day) setActiveDay("");
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hourValue, minute] = time.split(":");
    const hour = Number(hourValue);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
  };

  const selectedTimeRows = selectedDays
    .map((day) => {
      const range = timeRanges[day];
      if (!range?.start || !range?.end) return null;
      return { day, label: `${day}; ${formatTime(range.start)} - ${formatTime(range.end)}` };
    })
    .filter(Boolean) as { day: string; label: string }[];

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate("avatarUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = async () => {
    const schedule: Schedule[] = selectedTimeRows.map((row) => ({
      day: row.day,
      time: `${timeRanges[row.day].start} - ${timeRanges[row.day].end}`,
    }));

    const payload: UpdateProfilePayload = {
      bio: draft.bio,
      phoneNumber: draft.phoneNumber,
      email: draft.email,
      avatarUrl: draft.avatarUrl,
      linkedinUrl: draft.linkedinUrl,
      githubUrl: draft.githubUrl,
      twitterUrl: draft.twitterUrl,
      portfolioUrl: draft.portfolioUrl,
      teachSkills,
      learnSkills,
      schedule,
      avatarFile: avatarFile || undefined,
    };

    const result = await updateProfile(payload);
    if (result.success) {
      router.push("/profile");
    } else {
      alert(result.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-white px-5 pt-24 pb-10 font-sans text-black">
      <div className="mx-auto w-full max-w-md md:max-w-6xl">
        <section className="mb-10 flex justify-center">
          <div className="relative h-[168px] w-[168px]">
            {draft.avatarUrl ? (
              <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-slate-200 bg-slate-100">
                <Image
                  src={draft.avatarUrl}
                  alt="Profile"
                  fill
                  priority
                  className="object-cover"
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
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-2 flex h-11 w-11 items-center justify-center rounded-[6px] bg-sky-300 text-white ring-4 ring-white"
            >
              <Camera className="h-6 w-6" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
        </section>

        <div className="space-y-5">
          <div className="block">
            <span className="mb-2 block text-[16px] font-medium text-slate-500">Bio</span>
            <textarea
              value={draft.bio ?? ""}
              onChange={(e) => handleUpdate("bio", e.target.value)}
              className="w-full rounded-[18px] bg-white px-4 py-4 text-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.16)] outline-none min-h-[120px]"
            />
          </div>
          <Input
            label="Phone Number"
            value={draft.phoneNumber ?? ""}
            onChange={(v) => handleUpdate("phoneNumber", v)}
          />
          <Input
            label="LinkedIn URL"
            value={draft.linkedinUrl ?? ""}
            onChange={(v) => handleUpdate("linkedinUrl", v)}
          />
          <Input
            label="Github URL"
            value={draft.githubUrl ?? ""}
            onChange={(v) => handleUpdate("githubUrl", v)}
          />
          <Input
            label="Twitter / X URL"
            value={draft.twitterUrl ?? ""}
            onChange={(v) => handleUpdate("twitterUrl", v)}
          />
          <Input
            label="Portfolio URL"
            value={draft.portfolioUrl ?? ""}
            onChange={(v) => handleUpdate("portfolioUrl", v)}
          />
        </div>

        {/* Skills to Teach */}
        <section className="mt-9">
          <h2 className="mb-1 text-[26px] font-normal">Skills to Teach</h2>
          <p className="text-sm text-slate-400 mb-3">Select skills you can teach others</p>

          {skillsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-sky-500" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              <AnimatePresence>
                {allTeachSkills.filter((s) => s.name).map((skill) => {
                  const isSelected = teachSkills.includes(skill.name);
                  return (
                    <motion.button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleTeach(skill.name)}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${isSelected
                        ? "bg-sky-500 text-white shadow-sky-200"
                        : "bg-[#c1c1c1] text-[#000000]/50 hover:bg-slate-300"
                        }`}
                    >
                      {skill.name}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:border-sky-300 transition-all">
              <input
                type="text"
                value={teachCustomInput}
                onChange={(e) => setTeachCustomInput(e.target.value)}
                onKeyDown={(e) => handleCustomKeyDown(e, "teach")}
                placeholder="Add custom skill"
                className="w-full bg-transparent text-slate-800 font-medium text-sm outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => addCustom("teach")}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-300/40 active:scale-95 transition-all shrink-0"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* Learning Goals */}
        <section className="mt-9">
          <h2 className="mb-1 text-[26px] font-normal">Learning Goals</h2>
          <p className="text-sm text-slate-400 mb-3">Select skills you want to learn</p>

          {skillsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-sky-500" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              <AnimatePresence>
                {allLearnSkills.filter((s) => s.name).map((skill) => {
                  const isSelected = learnSkills.includes(skill.name);
                  return (
                    <motion.button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleLearn(skill.name)}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${isSelected
                        ? "bg-sky-500 text-white shadow-sky-200"
                        : "bg-[#c1c1c1] text-[#000000]/50 hover:bg-slate-300"
                        }`}
                    >
                      {skill.name}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:border-sky-300 transition-all">
              <input
                type="text"
                value={learnCustomInput}
                onChange={(e) => setLearnCustomInput(e.target.value)}
                onKeyDown={(e) => handleCustomKeyDown(e, "learn")}
                placeholder="Add custom goal"
                className="w-full bg-transparent text-slate-800 font-medium text-sm outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => addCustom("learn")}
              className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-300/40 active:scale-95 transition-all shrink-0"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* Availability */}
        <section className="mt-9">
          <h2 className="mb-1 text-[26px] font-normal">Availability</h2>
          <p className="text-sm text-slate-400 mb-3">Select the days and times that work for you</p>

          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <motion.button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  className={`px-4 py-3 rounded-[8px] text-base font-normal transition-all duration-200 shadow-lg ${isSelected
                    ? "bg-sky-500 text-white shadow-sky-200"
                    : "bg-[#c1c1c1] text-black/50 hover:bg-slate-300"
                    }`}
                >
                  {day}
                </motion.button>
              );
            })}
          </div>

          {selectedDays.length > 0 && (
            <div className="mt-4 rounded-[12px] border border-sky-100 bg-white/80 p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-slate-700">Pick exact time</p>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {selectedDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`shrink-0 rounded-[8px] px-3 py-2 text-sm ${activeDay === day
                      ? "bg-sky-500 text-white"
                      : "bg-sky-100 text-slate-700"
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {activeDay && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Start time</span>
                    <input
                      type="time"
                      value={timeRanges[activeDay]?.start || ""}
                      onChange={(e) => updateTimeRange(activeDay, "start", e.target.value)}
                      className="w-full rounded-[8px] border border-sky-200 px-3 py-2 text-sm text-black outline-none focus:border-sky-500"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">End time</span>
                    <input
                      type="time"
                      value={timeRanges[activeDay]?.end || ""}
                      onChange={(e) => updateTimeRange(activeDay, "end", e.target.value)}
                      className="w-full rounded-[8px] border border-sky-200 px-3 py-2 text-sm text-black outline-none focus:border-sky-500"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <h3 className="mb-3 text-base font-semibold text-slate-700">Selected Time</h3>
            <div className="flex flex-col gap-2">
              {selectedTimeRows.map((row) => (
                <div key={row.day} className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-sky-500 shrink-0" />
                  <span className="flex-1 text-sm text-black">{row.label}</span>
                  <button
                    type="button"
                    onClick={() => removeDay(row.day)}
                    className="text-slate-600 hover:text-sky-500"
                    aria-label={`Remove ${row.day}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {selectedTimeRows.length === 0 && (
                <p className="text-sm text-slate-400">Select a day and choose your available time.</p>
              )}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={saveChanges}
          disabled={loading}
          className="mt-8 w-full rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] font-semibold text-white shadow-xl shadow-sky-500/25 flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading, fetchProfile } = useProfileStore();
  const { hydrated, token } = useAuthStore();
  const { fetchSkills } = useSkillsStore();

  useEffect(() => {
    fetchSkills({ limit: "50" });
  }, [fetchSkills]);

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
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!profile) return null;

  return <ProfileForm profile={profile} />;
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-medium text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[18px] bg-white px-4 py-4 text-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.16)] outline-none"
      />
    </label>
  );
}
