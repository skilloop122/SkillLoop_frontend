"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfileStore, UpdateProfilePayload, Skill } from "../../../lib/profileStore";
import { useAuthStore } from "../../../lib/authStore";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading, updateProfile, fetchProfile } = useProfileStore();
  const { hydrated, token } = useAuthStore();
  
  const [draft, setDraft] = useState < UpdateProfilePayload > ({});
  const [localTeachSkills, setLocalTeachSkills] = useState < (string | Skill)[] | null > (null);
  const [localLearnSkills, setLocalLearnSkills] = useState < (string | Skill)[] | null > (null);

  useEffect(() => {
    if (hydrated) {
      if (token) {
        if (!profile) fetchProfile();
      } else {
        router.push("/signin");
      }
    }
  }, [hydrated, token, profile, fetchProfile, router]);

  const handleUpdate = (field: keyof UpdateProfilePayload, value: string | (string | Skill)[] | undefined) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const currentTeachSkills = localTeachSkills ?? profile?.teachSkills ?? [];
  const currentLearnSkills = localLearnSkills ?? profile?.learnSkills ?? [];

  const addItem = (type: "teach" | "learn") => {
    const promptMsg = "Add " + (type === "teach" ? "skill to teach" : "skill to learn");
    const value = window.prompt(promptMsg)?.trim();
    if (!value) return;
    
    if (type === "teach") {
      setLocalTeachSkills([...currentTeachSkills, value]);
    } else {
      setLocalLearnSkills([...currentLearnSkills, value]);
    }
  };

  const removeItem = (type: "teach" | "learn", index: number) => {
    if (type === "teach") {
      setLocalTeachSkills(currentTeachSkills.filter((_, i) => i !== index));
    } else {
      setLocalLearnSkills(currentLearnSkills.filter((_, i) => i !== index));
    }
  };

  const saveChanges = async () => {
    const payload: UpdateProfilePayload = {
      ...draft,
      teachSkills: localTeachSkills ?? undefined,
      learnSkills: localLearnSkills ?? undefined,
    };
    
    const result = await updateProfile(payload);
    if (result.success) {
      router.push("/profile");
    } else {
      alert(result.message || "Failed to update profile");
    }
  };

  if (!hydrated || (loading && !profile)) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white text-black">
            <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-5 pt-24 pb-10 font-sans text-black">
      <div className="mx-auto w-full max-w-md">
        <section className="mb-10 flex justify-center">
          <div className="relative">
            <div className="relative h-[168px] w-[168px] overflow-hidden rounded-full border-[6px] border-slate-200 bg-slate-100">
              <Image 
                src="/teacher.png" 
                alt="Profile" 
                fill 
                priority 
                className="object-cover" 
              />
            </div>
            <button className="absolute bottom-1 right-2 flex h-11 w-11 items-center justify-center rounded-[6px] bg-sky-300 text-white ring-4 ring-white">
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </section>

        <div className="space-y-5">
          <div className="block">
            <span className="mb-2 block text-[16px] font-medium text-slate-500">Bio</span>
            <textarea
                value={draft.bio ?? profile?.bio ?? ""}
                onChange={(e) => handleUpdate("bio", e.target.value)}
                className="w-full rounded-[18px] bg-white px-4 py-4 text-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.16)] outline-none min-h-[120px]"
            />
          </div>
          <Input 
            label="Phone Number" 
            value={draft.phoneNumber ?? profile?.phoneNumber ?? ""} 
            onChange={(v) => handleUpdate("phoneNumber", v)} 
          />
          <Input 
            label="LinkedIn URL" 
            value={draft.linkedinUrl ?? profile?.linkedinUrl ?? ""} 
            onChange={(v) => handleUpdate("linkedinUrl", v)} 
          />
          <Input 
            label="Github URL" 
            value={draft.githubUrl ?? profile?.githubUrl ?? ""} 
            onChange={(v) => handleUpdate("githubUrl", v)} 
          />
        </div>

        <EditableSection 
            title="Skills to Teach" 
            items={currentTeachSkills.map(s => typeof s === "string" ? s : s.name)} 
            onRemove={(i) => removeItem("teach", i)} 
            onAdd={() => addItem("teach")} 
        />
        
        <EditableSection 
            title="Learning Goals" 
            items={currentLearnSkills.map(s => typeof s === "string" ? s : s.name)} 
            onRemove={(i) => removeItem("learn", i)} 
            onAdd={() => addItem("learn")} 
        />

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
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="mt-9">
      <h2 className="mb-3 text-[26px] font-normal">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-2 py-2 text-[16px] text-white"
          >
            {item}
            <button type="button" onClick={() => onRemove(index)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <button type="button" onClick={onAdd} className="mt-4 text-[16px] text-[#0ea5e9]">
        + Add {title.includes("Teach") ? "Skill" : "Goal"}
      </button>
    </section>
  );
}
