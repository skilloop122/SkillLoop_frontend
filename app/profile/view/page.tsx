"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const teaches = ["Frontend", "Web Development"];
const wantsToLearn = ["UI/UX Design", "Figma"];

export default function ViewProfilePage() {
  const router = useRouter();
  const [requestSent, setRequestSent] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
      <Image
        src="/james_klin.png"
        alt="Sander James"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-linear-to-t from-black/70 via-black/35 to-transparent backdrop-blur-[2px]" />

      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-4 top-24 z-20 flex h-9 w-11 items-center justify-center rounded-[4px] border border-[#0ea5e9] bg-sky-50/90 text-black"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={1.8} />
      </button>

      <main className="relative z-10 flex min-h-screen flex-col justify-end px-4 pb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[25px] font-semibold leading-tight">
              Sander James
            </h1>
            <p className="text-[17px]">Web Developer</p>
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
          <ChipList items={teaches} />
        </section>

        <section className="mb-4">
          <h2 className="mb-2 text-[17px] font-semibold">Wants to learn</h2>
          <ChipList items={wantsToLearn} />
        </section>

        <section className="mb-7">
          <h2 className="mb-1 text-[17px] font-semibold">
            You Match because:
          </h2>
          <ul className="list-disc pl-6 text-[16px] leading-snug">
            <li>You want to learn Web Development</li>
            <li>They want to learn UI/UX Design</li>
          </ul>
        </section>

        <button
          type="button"
          onClick={() => setRequestSent(true)}
          className="w-full rounded-[18px] bg-[#0ea5e9] py-4 text-[16px] font-semibold text-white shadow-xl shadow-sky-500/25"
        >
          Request Session
        </button>
      </main>

      {requestSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-8">
          <div className="w-full max-w-[236px] rounded-[4px] bg-white px-5 py-7 text-center text-black shadow-2xl">
            <div className="mx-auto mb-5 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#0ea5e9] text-white">
              <Check className="h-12 w-12" strokeWidth={4} />
            </div>

            <h2 className="text-[18px] font-semibold">Request Sent!</h2>
            <p className="mb-4 text-[15px] leading-snug">
              Waiting for James to accept your request.
            </p>

            <button
              type="button"
              onClick={() => router.push("/sessions")}
              className="rounded-[4px] bg-[#0ea5e9] px-3 py-2 text-[16px] font-medium text-white"
            >
              Go to Sessions
            </button>
          </div>
        </div>
      )}
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