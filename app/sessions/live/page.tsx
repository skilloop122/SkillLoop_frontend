"use client";

import React from "react";
import Image from "next/image";
import { Video } from "lucide-react";

export default function OngoingSessionPage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-8">
      <div className="w-full max-w-md mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[32px] font-medium text-black leading-tight">
            Ongoing Session
          </h1>

          <div className="w-9 h-9 rounded-[6px] bg-sky-50 flex items-center justify-center">
            <Video className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="mb-6">
          <span className="inline-block rounded-[8px] bg-sky-50 px-3 py-1.5 text-[15px] text-black mb-2">
            Current meeting link
          </span>

          <a
            href="https://meet.google.com/eve-wcbd-yyx"
            target="_blank"
            rel="noreferrer"
            className="block text-[15px] text-sky-500 underline break-all"
          >
            https://meet.google.com/eve-wcbd-yyx
          </a>
        </div>

        <div className="space-y-3 mb-3">
          <div className="relative h-[190px] overflow-hidden rounded-[8px] bg-[#d7b28e]">
            <Image
              src="/james_klin.png"
              alt="You"
              fill
              className="object-cover object-center"
            />

            <span className="absolute top-3 left-2 rounded-[4px] border border-white/70 bg-white/20 px-2 py-0.5 text-[14px] text-slate-600">
              Teaching
            </span>

            <span className="absolute bottom-6 left-2 text-[15px] text-black">
              You
            </span>
          </div>

          <div className="relative h-[190px] overflow-hidden rounded-[8px] bg-slate-200">
            <Image
              src="/hero_collaboration.png"
              alt="Sander James"
              fill
              className="object-cover object-center"
            />

            <span className="absolute top-3 left-2 rounded-[4px] border border-white/70 bg-white/20 px-2 py-0.5 text-[14px] text-slate-600">
              Learning
            </span>

            <span className="absolute bottom-6 left-2 text-[15px] text-black">
              Sander James
            </span>
          </div>
        </div>

        <div className="flex justify-center mb-9">
          <button
            type="button"
            className="rounded-[4px] bg-[#0ea5e9] px-8 py-3 text-[15px] font-medium text-white shadow-sm hover:bg-sky-500 transition-colors"
          >
            Complete Session
          </button>
        </div>

        {/* <p className="text-center text-[15px] text-slate-400 mb-1">
          10 minutes remaining
        </p> */}

        <div className="border-t border-slate-300 pt-5 grid grid-cols-2 gap-5 text-center">
          <div>
            <h2 className="text-[15px] font-normal text-black mb-2">
              Session Topic
            </h2>
            <p className="text-[15px] text-black leading-snug">
              Introduction to Figma
            </p>
          </div>

          <div>
            <h2 className="text-[15px] font-normal text-black mb-2">
              Next Session
            </h2>
            <p className="text-[15px] text-black leading-snug">
              Sarah turn to teach HTML
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}