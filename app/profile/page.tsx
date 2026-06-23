"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import { useProfileStore } from "../../lib/profileStore";
import { useAuthStore } from "../../lib/authStore";

export default function ProfilePage() {
    const router = useRouter();
    const { profile, loading, error, fetchProfile } = useProfileStore();
    const { hydrated, token } = useAuthStore();

    useEffect(() => {
        if (hydrated) {
            if (token) {
                fetchProfile();
            } else {
                router.push("/signin");
            }
        }
    }, [hydrated, token, fetchProfile, router]);

    if (!hydrated || (loading && !profile)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-black">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-5 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={() => fetchProfile()}
                    className="rounded-[4px] bg-[#0ea5e9] px-4 py-2 text-white"
                >
                    Retry
                </button>
            </div>
        );
    }

    const fullName = profile ? (profile.firstName + " " + profile.lastName) : "Dalton Harris";
    const bio = profile?.bio || "No bio provided.";
    const teachSkills = profile?.teachSkills.map(s => s.name) || [];
    const learnSkills = profile?.learnSkills.map(s => s.name) || [];
    const days = profile?.schedule.map(s => s.day) || [];
    const timeRange = profile?.schedule[0]?.time || "Not set";

    return (
        <div className="min-h-screen bg-white font-sans flex text-black">
            <SideNav />

            <main className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
                <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-24 md:pt-12">
                    <section className="mb-10 flex justify-center">
                        <div className="relative">
                            <div className="relative h-[168px] w-[168px] overflow-hidden rounded-full border-[6px] border-slate-200 bg-slate-100">
                                <Image 
                                    src="/teacher.png" 
                                    alt={fullName} 
                                    fill 
                                    priority 
                                    className="object-cover" 
                                />
                            </div>
                            <span className="absolute bottom-7 right-3 h-6 w-6 rounded-full bg-green-500 ring-4 ring-white" />
                        </div>
                    </section>

                    <section className="mb-9 space-y-5">
                        <ProfileField label="Full Name" value={fullName} />
                        <ProfileField label="Phone Number" value={profile?.phoneNumber || "Not set"} />
                        
                        <button
                            type="button"
                            onClick={() => router.push("/profile/edit")}
                            className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
                        >
                            Edit Profile
                        </button>
                    </section>

                    <ProfileSection title="Your Skills">
                        <ChipList items={teachSkills} />
                    </ProfileSection>

                    <ProfileSection title="Learning Goals">
                        <ChipList items={learnSkills} />
                    </ProfileSection>

                    <ProfileSection title="Your Availability">
                        <ChipList items={days} />
                        <div className="mt-3 flex items-center gap-2 text-[16px]">
                            <Clock className="h-5 w-5 text-[#0ea5e9]" />
                            <span>{timeRange}</span>
                        </div>
                    </ProfileSection>

                    <ProfileSection title="About">
                        <p className="max-w-[360px] text-[18px] leading-snug">{bio}</p>
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
    if (items.length === 0) return <p className="text-slate-400">None added yet.</p>;
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <span key={index} className="rounded-[4px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-3 py-2 text-[16px] text-white">
                    {item}
                </span>
            ))}
        </div>
    );
}
