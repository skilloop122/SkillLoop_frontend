"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

const PROFILE_KEY = "skillLoopProfile";

const defaultProfile = {
    fullName: "Dalton West",
    title: "UI/UX Designer",
    experience: "2-3 years",
    skills: ["UI/UX Design", "Figma"],
    learningGoals: ["Frontend", "Backend", "Web Development"],
    days: ["Mon", "Tue", "Wed"],
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    about: "",
    tools: ["Figma", "Notion", "Adobe"],
    image: "/hero_collaboration.png",
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

export default function PreviewProfilePage() {
    const router = useRouter();

    const snapshot = useSyncExternalStore(
        subscribeProfile,
        getProfileSnapshot,
        getServerProfileSnapshot
    );

    const profile = useMemo(() => {
        try {
            return { ...defaultProfile, ...JSON.parse(snapshot) };
        } catch {
            return defaultProfile;
        }
    }, [snapshot]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
            <Image
                src="/hero_collaboration.png"
                alt={profile.fullName}
                fill
                priority
                className="object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-x-0 bottom-0 h-[62%] bg-linear-to-t from-black/70 via-black/35 to-transparent backdrop-blur-[2px]" />

            <main className="relative z-10 flex min-h-screen flex-col justify-end px-4 pb-14">
                <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[25px] font-semibold leading-tight text-white">
                            {profile.fullName}
                        </h1>
                        <p className="text-[17px] text-white">{profile.title}</p>
                    </div>

                    <div className="text-right">
                        <div className="inline-flex items-center gap-1 rounded-[4px] border border-white/70 bg-white/20 px-2 py-1 text-[16px]">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>4.7 Rating</span>
                        </div>
                        <p className="mt-1 text-[15px] text-white/80">122 Reviews</p>
                    </div>
                </div>

                <section className="mb-4">
                    <h2 className="mb-2 text-[17px] font-semibold">Teaches</h2>
                    <ChipList items={profile.skills} />
                </section>

                <section className="mb-4">
                    <h2 className="mb-2 text-[17px] font-semibold">Wants to learn</h2>
                    <ChipList items={profile.learningGoals} />
                </section>

                <section className="mb-7">
                    <h2 className="mb-1 text-[17px] font-semibold">
                        You Match because:
                    </h2>
                    <ul className="list-disc pl-6 text-[16px] leading-snug text-white">
                        <li>You want to learn web development</li>
                        <li>They want to learn UI/UX Design</li>
                    </ul>
                </section>

                <button
                    type="button"
                    onClick={() => router.push("/profile/edit")}
                    className="w-full rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] font-semibold text-white shadow-xl shadow-sky-500/25"
                >
                    Edit Profile
                </button>
            </main>
        </div>
    );
}

function ChipList({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span
                    key={item}
                    className="rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-3 py-2 text-[16px] text-white"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}