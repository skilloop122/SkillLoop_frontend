"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";

const PROFILE_KEY = "skillLoopProfile";

type ProfileData = {
    fullName: string;
    title: string;
    experience: string;
    skills: string[];
    learningGoals: string[];
    days: string[];
    startTime: string;
    endTime: string;
    about: string;
    tools: string[];
    image: string;
};

const defaultProfile: ProfileData = {
    fullName: "Dalton Harris",
    title: "Product Designer",
    experience: "2-3 years",
    skills: ["UI/UX", "Prototype", "Webflow", "Figma"],
    learningGoals: ["Frontend", "Backend", "Web Development"],
    days: ["Mon", "Tue", "Wed"],
    startTime: "10:00 AM",
    endTime: "05:00 PM",
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

export default function ProfilePage() {
    const router = useRouter();

    const profileSnapshot = useSyncExternalStore(
        subscribeProfile,
        getProfileSnapshot,
        getServerProfileSnapshot
    );

    const profile = useMemo<ProfileData>(() => {
        try {
            return { ...defaultProfile, ...JSON.parse(profileSnapshot) };
        } catch {
            return defaultProfile;
        }
    }, [profileSnapshot]);

    return (
        <div className="min-h-screen bg-white font-sans flex text-black">
            <SideNav />

            <main className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
                <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-24 md:pt-12">
                    {/* <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-3 flex h-9 w-11 items-center justify-center rounded-[4px] border border-[#0ea5e9] bg-sky-50 text-black"
                    >
                        <ArrowLeft className="h-6 w-6" strokeWidth={1.8} />
                    </button> */}

                    <section className="mb-10 flex justify-center">
                        <div className="relative">
                            <div className="relative h-[168px] w-[168px] overflow-hidden rounded-full border-[6px] border-slate-200 bg-slate-100">
                                <Image src={profile.image} alt={profile.fullName} fill priority className="object-cover" />
                            </div>
                            <span className="absolute bottom-7 right-3 h-6 w-6 rounded-full bg-green-500 ring-4 ring-white" />
                        </div>
                    </section>

                    <section className="mb-9 space-y-5">
                        <ProfileField label="Full Name" value={profile.fullName} />
                        <ProfileField label="Title" value={profile.title} />
                        <ProfileField label="Years of Experience" value={profile.experience} />

                        <button
                            type="button"
                            onClick={() => router.push("/profile/edit")}
                            className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
                        >
                            Edit Profile
                        </button>
                    </section>

                    <ProfileSection title="Your Skills">
                        <ChipList items={profile.skills} />
                    </ProfileSection>

                    <ProfileSection title="Learning Goals">
                        <ChipList items={profile.learningGoals} />
                    </ProfileSection>

                    <ProfileSection title="Your Availability">
                        <ChipList items={profile.days} />
                        <div className="mt-3 flex items-center gap-2 text-[16px]">
                            <Clock className="h-5 w-5 text-[#0ea5e9]" />
                            <span>{profile.startTime} - {profile.endTime}</span>
                        </div>
                    </ProfileSection>

                    <ProfileSection title="About">
                        <p className="max-w-[360px] text-[18px] leading-snug">{profile.about}</p>
                    </ProfileSection>

                    <ProfileSection title="Your Tools">
                        <ChipList items={profile.tools} />
                    </ProfileSection>

                    <button
                        type="button"
                        onClick={() => router.push("/profile/preview")}
                        className="mt-6 w-full rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] font-semibold text-white shadow-xl shadow-sky-500/25"
                    >
                        Preview Profile
                    </button>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

function ProfileField({ label, value }: { label: string; value: string }) {
    return (
        <label className="block">
            <span className="mb-2 block text-[16px] font-medium text-slate-500">{label}</span>
            <div className="rounded-[18px] bg-[#e7e7e7] px-4 py-4 text-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                {value}
            </div>
        </label>
    );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-9">
            <h2 className="mb-3 text-[26px] font-normal">{title}</h2>
            {children}
        </section>
    );
}

function ChipList({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span key={item} className="rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-3 py-2 text-[16px] text-white">
                    {item}
                </span>
            ))}
        </div>
    );
}