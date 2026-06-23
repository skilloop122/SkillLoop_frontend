"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "../../../lib/profileStore";
import { useAuthStore } from "../../../lib/authStore";

export default function PreviewProfilePage() {
    const router = useRouter();
    const { profile, loading, fetchProfile } = useProfileStore();
    const { hydrated, token } = useAuthStore();

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
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
            </div>
        );
    }

    const fullName = profile ? (profile.firstName + " " + profile.lastName) : "Dalton West";
    const teachSkills = profile?.teachSkills.map(s => s.name) || ["UI/UX Design", "Figma"];
    const learnSkills = profile?.learnSkills.map(s => s.name) || ["Frontend", "Backend"];
    const bio = profile?.bio || "";

    return (
        <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
            <Image
                src="/hero_collaboration.png"
                alt={fullName}
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
                            {fullName}
                        </h1>
                        <p className="text-[17px] text-white">User Profile</p>
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
                    <ChipList items={teachSkills} />
                </section>

                <section className="mb-4">
                    <h2 className="mb-2 text-[17px] font-semibold">Wants to learn</h2>
                    <ChipList items={learnSkills} />
                </section>

                <section className="mb-7">
                    <h2 className="mb-1 text-[17px] font-semibold">
                        About
                    </h2>
                    <p className="text-[16px] leading-snug text-white">
                        {bio || "No bio available."}
                    </p>
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
            {items.map((item, index) => (
                <span
                    key={index}
                    className="rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-3 py-2 text-[16px] text-white"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}
