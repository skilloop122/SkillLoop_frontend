"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectCompletedPage() {
  const router = useRouter();
  const [showThanks, setShowThanks] = useState(false);

  return (
    <div className="min-h-screen bg-white px-5 pt-24 pb-10 font-sans text-black">
      <div className="mx-auto w-full max-w-md">
        <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-[#ccebf8] text-6xl">
          🎉
        </div>

        <h1 className="mb-8 text-center text-[32px] font-medium">
          Project Completed!
        </h1>

        <span className="mb-2 inline-block rounded-[8px] bg-[#ccebf8] px-3 py-1 text-[16px]">
          Preview
        </span>

        <div className="relative mb-8 h-[208px] overflow-hidden rounded-[8px] shadow-xl">
          <Image
            src="/images/Frame.png"
            alt="Completed project preview"
            fill
            className="object-cover"
          />
        </div>

        <h2 className="mb-2 text-[24px] font-normal">Completion Reward:</h2>

        <div className="mb-5 flex items-center gap-1 text-[17px]">
          <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
          <span>+40 Skill Points</span>
        </div>

        <div className="mb-3 flex">
          <div className="flex-1 rounded-l-[8px] bg-[#ccebf8] px-4 py-3 text-[16px]">
            Certification of Completion
          </div>
          <button className="rounded-r-[8px] bg-[#0ea5e9] px-4 py-3 text-[16px] text-white">
            Download
          </button>
        </div>

        <p className="mb-8 text-[16px]">Issued to Dalton Hopkins</p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowThanks(true)}
            className="flex-1 rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] text-white"
          >
            Leave Feedback
          </button>

          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="flex-1 rounded-[18px] border border-[#0ea5e9] py-4 text-[16px] text-black"
          >
            Explore Projects
          </button>
        </div>
      </div>

      {showThanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-[8px] bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-[18px] font-medium">
              Rate your Project Experience
            </h2>

            <div className="mb-6 flex gap-1 text-3xl text-amber-400">
              ☆ ☆ ☆ ☆ ☆
            </div>

            <label className="mb-2 block text-[16px]">
              Add comment (Optional)
            </label>

            <textarea className="mb-4 h-24 w-full rounded-[4px] border border-[#0ea5e9] p-3 outline-none" />

            <button
              type="button"
              onClick={() => setShowThanks(false)}
              className="rounded-[4px] bg-[#0ea5e9] px-4 py-2 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}