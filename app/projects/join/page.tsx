"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JoinProjectPage() {
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-black font-sans text-white">
            <Image
                src="/hero_collaboration.png"
                alt="Frontend Project"
                fill
                priority
                className="object-cover"
            />

            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            <div className="relative z-10 flex min-h-dvh w-full flex-col px-4 pt-14 pb-10 md:max-w-4xl md:mx-auto md:justify-center md:py-20">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="relative z-20 mb-auto md:absolute md:top-12 md:left-4 flex h-10 w-12 md:h-9 md:w-11 items-center justify-center rounded-[4px] border border-[#0ea5e9] bg-sky-50/80 text-black hover:bg-sky-100 transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" strokeWidth={1.8} />
                </button>

                <div className="mt-auto md:mt-0 md:bg-black/60 md:backdrop-blur-lg md:p-10 md:rounded-[24px] md:border md:border-white/10 md:shadow-2xl">
                    <h1 className="mb-1 text-[26px] md:text-4xl md:mb-4 font-medium leading-tight">
                        Frontend Project
                    </h1>

                    <p className="mb-4 max-w-[340px] md:max-w-2xl text-[18px] md:text-[20px] leading-snug text-white md:text-slate-200">
                        Build a desktop landing page for a hair salon brand that helps new
                        users looking to buy hair from the comfort of their home.
                    </p>

                    <h2 className="mb-1 text-[22px] md:text-[24px] font-medium md:mb-3">Skills Required</h2>
                    <div className="mb-4 flex flex-wrap gap-1 md:gap-2 md:mb-6">
                        {["Frontend", "Web Development"].map((skill) => (
                            <span
                                key={skill}
                                className="rounded-[4px] bg-[#0ea5e9]/85 px-1.5 py-0.5 md:px-3 md:py-1 text-[14px] md:text-[15px] font-medium text-white"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <h2 className="mb-1 text-[22px] md:text-[24px] font-medium md:mb-3">Project Goal</h2>
                    <p className="mb-4 max-w-[340px] md:max-w-2xl text-[18px] md:text-[20px] leading-snug text-white md:text-slate-200 md:mb-8">
                        Build a simple, clear and user- friendly landing page that gives the
                        user clarity and earns their trust.
                    </p>

                    <div className="mb-6 flex items-center gap-1 text-[15px] md:text-[17px] text-white md:mb-8">
                        <span>Collaborators</span>
                        <Users className="h-5 w-5 md:h-6 md:w-6 fill-[#0ea5e9] text-[#0ea5e9] ml-1 mr-1" />
                        <span>2 spots left</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSuccess(true)}
                        className="w-full md:w-auto md:px-12 md:text-[18px] rounded-[18px] md:rounded-full bg-[#0ea5e9] hover:bg-sky-400 py-4 text-[16px] font-medium text-white shadow-xl shadow-sky-500/30 transition-all active:scale-95"
                    >
                        Request to join
                    </button>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-8">
                    <div className="w-full max-w-[236px] rounded-[4px] bg-white px-4 py-6 text-center text-black shadow-2xl">
                        <div className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#0ea5e9] text-white">
                            <Check className="h-12 w-12" strokeWidth={4} />
                        </div>

                        <h2 className="mb-1 text-[18px] font-semibold">
                            Request sent Successfully!
                        </h2>

                        <p className="mb-4 text-[15px] leading-snug">
                            You will gain access to the project once you are accepted.
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push("/projects")}
                            className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
                        >
                            Back to Projects
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}