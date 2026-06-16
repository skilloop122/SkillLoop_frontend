"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FolderOpen, Users } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";


export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!fullName || !email) return;
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          full_name: fullName,
          email,
        },
      ]);

    console.log("DATA:", data);
    console.log("ERROR:", error);
    if (error) {
      if (error.message.includes("duplicate")) {
        setMessage("You're already on the waitlist.");
      } else {
        setMessage("Something went wrong.");
      }
    } else {
      setFullName("")
      setEmail("");
      setMessage("");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    }

    setLoading(false);
  };
  return (
    <main className="min-h-screen bg-black font-sans">
      <section className="bg-white px-5 pt-20 pb-16 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 inline-flex items-center gap-2 rounded-[8px] bg-sky-100 px-3 py-2 text-[16px] font-medium text-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0ea5e9] text-white">
              <Image
                src="/images/SkilLoop.png"
                alt="Logo"
                width={30}
                height={30}
              />
            </span>
            <span>
              The End of Lonely Learning.
            </span>
          </div>

          <h1 className="mb-2 text-[30px] font-extrabold leading-tight text-black">
            Stop Learning in Isolation. Start Trading Your Skills.
          </h1>

          <p className="mx-auto mb-9 max-w-[900px] text-[17px] leading-snug text-slate-500 font-medium">
            Tired of burning data on endless, lonely tutorials? SkilLoop is a peer-to-peer knowledge bank where you trade what you know for what you need. 100% live, 100% human, and completely free.
          </p>

          <div className="rounded-[10px] bg-white px-4 py-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
            <div className="mb-7 flex -space-x-2">
              {[
                "/images/ebony.jpg",
                "/images/elizeu.jpg",
                "/images/good-faces.jpg",
              ].map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-slate-200"
                >
                  <Image
                    src={src}
                    alt="Waitlist member"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-[13px] font-semibold text-slate-400">
                +2K
              </div>
            </div>

            <h2 className="mb-1 text-[26px] font-semibold text-black">
              Secure Your Day-1 Beta Access
            </h2>
            <p className="mb-4 text-[16px] text-slate-500">
              Join the first 500 Professionals trading value without spending any money.
            </p>

            <div className="rounded-[8px] border border-[#0ea5e9] bg-white p-4">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
              >
                <input
                  type="full name"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-md border border-slate-300 text-black bg-white px-4 outline-none focus:border-[#0ea5e9]"
                />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-md border border-slate-300 text-black bg-white px-4 outline-none focus:border-[#0ea5e9]"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-md bg-[#0ea5e9] text-white font-semibold disabled:opacity-50"
                >
                  {loading ? "Getting..." : "Get My Free Slot →"}
                </button>

                {message && (
                  <p className="text-sm text-center text-slate-600">
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="py-20 px-6 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Why SkilLoop?
          </h2>
          <p className="text-base text-slate-500 font-medium mb-12">
            Built for ambitious professionals who want to scale their careers without financial barriers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#00CCFC]/20 flex items-center justify-center">
                <Image
                  src="/images/Group.png"
                  alt="Skill exchange"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sky-500 mb-2">
                  Skill Exchange
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Your mind is a goldmine. Use your current expertise as a currency to barter for the career skills you lack directly with ambitious peers.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                  <circle
                    cx="16"
                    cy="16"
                    r="11"
                    stroke="#f97316"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M16 10v6l4 2"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-2">
                  15-Minute Mastery
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Reclaim your time. Skip the fluff and hop into laser-focused, live peer interactions engineered to solve your exact roadblocks in minutes.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Users className="text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-500 mb-2">
                  Real Projects
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Stop building in a vacuum. Once you complete 3 exchange loops, join dynamic, cross-functional teams to collaborate on active building sprints.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <FolderOpen className="text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-500 mb-2">
                  Portfolio Builder
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Turn your knowledge into proof of work. Finish your team sprints with a live, employer-ready product portfolio that commands respect and gets you hired.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-5 py-24">
        <div className="mx-auto max-w-md rounded-[8px] border border-[#05abf8] bg-linear-to-b from-sky-300 to-[#05a5ef] px-3 py-6 text-center shadow-[0_0_20px_rgba(14,165,233,0.35)]">
          <h2 className="mb-3 text-[25px] font-semibold text-white">
            Ready to Build Together?
          </h2>
          <p className="mb-5 text-[16px] text-slate-600">
            Join a community of ambitious creators swapping skills and launching real projects. Secure your spot in our upcoming closed beta.
          </p>

          <div className="rounded-[8px] border border-[#0ea5e9] bg-white p-4">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-md border border-slate-300 px-4 outline-none focus:border-[#0ea5e9] text-black"
              />

              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-md border border-slate-300 px-4 outline-none focus:border-[#0ea5e9] text-black"
              />

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-md bg-[#0ea5e9] text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Claiming..." : "Claim My Early Access"}
              </button>

              {message && (
                <p className="text-sm text-center text-slate-600">
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/SkilLoop.png"
                alt="Logo"
                width={30}
                height={30}
              />
              <span className="text-lg font-bold tracking-tight text-white">
                Skil<span className="text-sky-400">Loop</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              SkilLoop is a peer-to-peer exchange community where African talent
              trades what they know for what they need. No long tutorials, no
              expensive fees—just 15-minute live loops and collaborative
              projects to build the portfolio that gets you hired.
            </p>
            <div className="mb-8 flex items-center gap-3 text-slate-300">
              <span className="font-semibold">Follow Us</span>
              <FaInstagram className="h-5 w-5" />
              <FaFacebook className="h-5 w-5" />
              <FaX className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-500">
              © 2026 SkilLoop, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircle2
                  size={40}
                  strokeWidth={2}
                  className="animate-bounce"
                />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-800">
                You&apos;re on the Waitlist! 🎉
              </h3>

              <p className="text-sm font-semibold text-slate-500">
                Thank you for joining SkilLoop. You&apos;ll be among the first to know
                when we launch and gain early access to skill exchanges, projects,
                and portfolio-building opportunities.
              </p>

              <div className="w-10 h-1 bg-sky-500 rounded-full animate-pulse mt-2" />

              <button
                onClick={() => setShowSuccess(false)}
                className="mt-4 px-5 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}