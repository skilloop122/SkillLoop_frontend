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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email) return;

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    console.log("DATA:", data);
    console.log("ERROR:", error);
    if (error) {
      if (error.message.includes("duplicate")) {
        setMessage("You're already on the waitlist.");
      } else {
        setMessage("Something went wrong.");
      }
    } else {
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
              <span className="text-[#0ea5e9]">SkilLoop</span> is launching
              soon.
            </span>
          </div>

          <h1 className="mb-2 text-[30px] font-extrabold leading-tight text-black">
            Grow Together through{" "}
            <span className="text-[#0ea5e9]">Skill Exchange.</span>
          </h1>

          <p className="mx-auto mb-9 max-w-[400px] text-[17px] leading-snug text-slate-500 font-medium">
            Teach what you know, learn what you don’t and build meaningful
            experience with real projects.
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
              Join the Waitlist
            </h2>
            <p className="mb-4 text-[16px] text-slate-500">
              Signup to be one of the first to use SkilLoop
            </p>

            <div className="rounded-[8px] border border-[#0ea5e9] bg-white p-4">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
              >
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
                  {loading ? "Joining..." : "Join Waitlist"}
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

      <section className="bg-white px-5 pb-16 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-2 text-[26px] font-extrabold text-black">
            What you’ll get
          </h2>
          <p className="mx-auto mb-7 max-w-[400px] font-medium text-[17px] leading-snug text-slate-500">
            SkilLoop gives you the tools and community to grow through skill
            exchange.
          </p>

          <div className="grid grid-cols-[1fr_150px] gap-3 text-left">
            <div className="space-y-5">
              <FeatureMini
                icon={
                  <Image
                    src="/images/Group.png"
                    alt="Skill exchange"
                    width={24}
                    height={24}
                  />
                }
                title="Skill Exchange"
                body="Offer your skills, learn from others."
              />
              <FeatureMini
                icon={
                  <Users className="h-5 w-5 fill-[#0ea5e9] text-[#0ea5e9]" />
                }
                title="Real Projects"
                body="Build experience through real projects."
              />
              <FeatureMini
                icon={<FolderOpen className="h-5 w-5 text-[#0ea5e9]" />}
                title="Portfolio Builder"
                body="Showcase your work and gain recognition."
              />
            </div>

            <div className="relative min-h-[260px]">
              <div className="absolute right-0 top-7 h-[230px] w-[145px] overflow-hidden rounded-[22px] bg-white shadow-2xl">
                <Image
                  src="/images/Phone.png"
                  alt="SkilLoop app preview"
                  fill
                  className="object-cover"
                />
              </div>
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
            Built for people who want to grow fast and give back.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  Teach what you know and learn what you need — no money, just
                  value for value.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Image
                  src="/images/mdi_puzzle-star.png"
                  alt="Portfolio builder"
                  width={30}
                  height={30}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-500 mb-2">
                  Build your Portfolio
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Work on real-world projects alongside peers to build a
                  portfolio that stands out.
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
                  Learn faster with short, focused sessions designed to deliver
                  real, actionable skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-5 py-24">
        <div className="mx-auto max-w-md rounded-[8px] border border-[#05abf8] bg-linear-to-b from-sky-300 to-[#05a5ef] px-3 py-6 text-center shadow-[0_0_20px_rgba(14,165,233,0.35)]">
          <h2 className="mb-3 text-[25px] font-semibold text-white">
            Limited Early Access
          </h2>
          <p className="mb-5 text-[16px] text-slate-600">
            Join now and get priority when we launch.
          </p>

          <div className="rounded-[8px] border border-[#0ea5e9] bg-white p-4">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >
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
                {loading ? "Joining..." : "Join Waitlist"}
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


function FeatureMini({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-sky-50">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 text-[16px] font-semibold text-[#0ea5e9]">
          {title}
        </h3>
        <p className="text-[15px] leading-snug text-slate-500">{body}</p>
      </div>
    </div>
  );
}