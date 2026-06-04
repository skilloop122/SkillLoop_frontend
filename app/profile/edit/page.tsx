"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";

const PROFILE_KEY = "skillLoopProfile";
const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sun", "Sat"];

const defaultProfile = {
  fullName: "Dalton Harris",
  title: "Product Designer",
  experience: "2-3 years",
  skills: ["UI/UX", "Prototype", "Webflow", "Figma"],
  learningGoals: ["Frontend", "Backend", "Web Development"],
  days: ["Mon", "Tue", "Wed"],
  startTime: "09:00 AM",
  endTime: "03:00 PM",
  about:
    "I am a Product Designer focused on crafting clean, intuitive and conversion-driven digital experiences. I am continuously improving my process, exploring better ways to design and pushing towards building valuable products.",
  tools: ["Figma", "Notion", "Adobe"],
  image: "/teacher.png",
};

const subscribeProfile = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("profileChanged", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("profileChanged", callback);
  };
};

const getProfileSnapshot = () => {
  if (typeof window === "undefined") return JSON.stringify(defaultProfile);
  return localStorage.getItem(PROFILE_KEY) || JSON.stringify(defaultProfile);
};

const getServerProfileSnapshot = () => JSON.stringify(defaultProfile);

export default function EditProfilePage() {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    getServerProfileSnapshot
  );

  const savedProfile = useMemo(() => {
    try {
      return { ...defaultProfile, ...JSON.parse(snapshot) };
    } catch {
      return defaultProfile;
    }
  }, [snapshot]);

  const [draft, setDraft] = useState<Partial<typeof defaultProfile>>({});

  const profile = { ...savedProfile, ...draft };

  const update = <K extends keyof typeof defaultProfile>(
    key: K,
    value: (typeof defaultProfile)[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const addItem = (key: "skills" | "learningGoals" | "tools", label: string) => {
    const value = window.prompt(label)?.trim();
    if (!value) return;
    update(key, [...profile[key], value]);
  };

  const removeItem = (key: "skills" | "learningGoals" | "tools", item: string) => {
    update(
      key,
      profile[key].filter((value: string) => value !== item)
    );
  };

  const toggleDay = (day: string) => {
    update(
      "days",
      profile.days.includes(day)
        ? profile.days.filter((item: string) => item !== day)
        : [...profile.days, day]
    );
  };

  const saveChanges = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("profileChanged"));
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-white px-5 pt-24 pb-10 font-sans text-black">
      <div className="mx-auto w-full max-w-md">
        <section className="mb-10 flex justify-center">
          <div className="relative">
            <div className="relative h-[168px] w-[168px] overflow-hidden rounded-full border-[6px] border-slate-200 bg-slate-100">
              <Image src={profile.image} alt={profile.fullName} fill priority className="object-cover" />
            </div>
            <button className="absolute bottom-1 right-2 flex h-11 w-11 items-center justify-center rounded-[6px] bg-sky-300 text-white ring-4 ring-white">
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </section>

        <div className="space-y-5">
          <Input label="Full Name" value={profile.fullName} onChange={(value) => update("fullName", value)} />
          <Input label="Title" value={profile.title} onChange={(value) => update("title", value)} />

          <label className="block">
            <span className="mb-2 block text-[16px] font-medium text-slate-500">
              Years of Experience
            </span>
            <select
              value={profile.experience}
              onChange={(e) => update("experience", e.target.value)}
              className="w-full rounded-[18px] bg-white px-4 py-4 text-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.16)] outline-none"
            >
              <option>0-1 years</option>
              <option>2-3 years</option>
              <option>4-5 years</option>
              <option>5+ years</option>
            </select>
          </label>
        </div>

        <EditableSection title="Your Skills" items={profile.skills} onRemove={(item) => removeItem("skills", item)} onAdd={() => addItem("skills", "Add skill")} />
        <EditableSection title="Learning Goals" items={profile.learningGoals} onRemove={(item) => removeItem("learningGoals", item)} onAdd={() => addItem("learningGoals", "Add learning goal")} />

        <section className="mt-9">
          <h2 className="mb-3 text-[26px] font-normal">Your Availability</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {allDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-[4px] px-3 py-2 text-[16px] ${
                  profile.days.includes(day)
                    ? "bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] text-white"
                    : "bg-[#c1c1c1] text-black/60"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" value={profile.startTime} onChange={(value) => update("startTime", value)} />
            <Input label="End Time" value={profile.endTime} onChange={(value) => update("endTime", value)} />
          </div>

          <label className="mt-3 flex items-center gap-2 text-[14px]">
            <span className="h-5 w-5 rounded-[4px] border-2 border-sky-400" />
            Apply to all selected days
          </label>
        </section>

        <section className="mt-9">
          <h2 className="mb-3 text-[26px] font-normal">About</h2>
          <textarea
            value={profile.about}
            onChange={(e) => update("about", e.target.value)}
            maxLength={1000}
            className="h-48 w-full rounded-[8px] border border-[#0ea5e9] p-3 text-[16px] leading-snug outline-none"
          />
          <p className="mt-1 text-right text-sm text-slate-400">
            {profile.about.length}/1000 Characters
          </p>
        </section>

        <EditableSection title="Your Tools" items={profile.tools} onRemove={(item) => removeItem("tools", item)} onAdd={() => addItem("tools", "Add tool")} />

        <button
          type="button"
          onClick={saveChanges}
          className="mt-8 w-full rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] font-semibold text-white shadow-xl shadow-sky-500/25"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
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

function EditableSection({
  title,
  items,
  onRemove,
  onAdd,
}: {
  title: string;
  items: string[];
  onRemove: (item: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="mt-9">
      <h2 className="mb-3 text-[26px] font-normal">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-2 py-2 text-[16px] text-black"
          >
            {item}
            <button type="button" onClick={() => onRemove(item)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <button type="button" onClick={onAdd} className="mt-4 text-[16px]">
        + Add {title === "Your Tools" ? "Tool" : "Skill"}
      </button>
    </section>
  );
}