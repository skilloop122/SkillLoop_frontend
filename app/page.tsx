"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Search,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Star,
  Palette,
  Handshake,
  GraduationCap,
  CircleDashed,
  LucideIcon,
  ChartColumnBig,
  LaptopMinimal,BrainCog,ClipboardList,
  FileText
} from "lucide-react";


type ExploreSkill = {
  label: string;
  meta: string;
  icon: LucideIcon;
  className: string;
  iconClassName: string;
};

const sessionCards = [
  {
    name: "James Klin",
    rating: "4.8",
    role: "Teaches",
    skills: ["Frontend", "Word Press"],
    image: "/james_klin.png",
  },
  {
    name: "James Klin",
    rating: "4.8",
    role: "Learning",
    skills: ["UI/UX", "Motion Design"],
    image: "/james_klin.png",
  },
];

const actionCards = [
  {
    name: "James Klin",
    rating: "4.8",
    teaches: ["Frontend", "Word Press"],
    learning: ["UI/UX", "Motion Design"],
    image: "/james_klin.png",
  },
  {
    name: "Maya Stone",
    rating: "4.9",
    teaches: ["Brand Design", "Figma"],
    learning: ["React", "Next.js"],
    image: "/james_klin.png",
  },
];

const exploreSkillSlides: ExploreSkill[][] = [
  [
    {
      label: "Explore Design",
      meta: "120+ Sessions",
      icon: Palette,
      iconClassName: "text-purple-700",

      className: "bg-[#b8a1e3]/50",
    },
    {
      label: "Explore Development",
      meta: "Top Rated",
      className: "bg-[#8fb8ed]/50",
      icon: LaptopMinimal,
      iconClassName: ""
    },
    {
      label: "Explore Marketing",
      meta: "Trending",
      className: "bg-[#f4a261]/40",
      icon: ChartColumnBig,
      iconClassName: ""
    },
  ],
  [
    {
      label: "Explore Product",
      meta: "80+ Sessions",
      className: "bg-emerald-300",
      icon: ClipboardList,
      iconClassName: ""
    },
    {
      label: "Explore Writing",
      meta: "New Skills",
      className: "bg-rose-300",
      icon: BrainCog,
      iconClassName: ""
    },
    {
      label: "Explore Business",
      meta: "Popular",
      className: "bg-amber-300",
      icon: FileText,
      iconClassName: ""
    },
  ],
];




export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [actionSlide, setActionSlide] = useState(0);
  const [exploreSlide, setExploreSlide] = useState(0);



  // Monitor scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance carousel on mobile
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (window.innerWidth < 768) {
        setActiveSlide((current) => (current + 1) % sessionCards.length);
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (window.innerWidth < 768) {
        setActionSlide((current) => (current + 1) % actionCards.length);
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (window.innerWidth < 768) {
        setExploreSlide((current) => (current + 1) % exploreSkillSlides.length);
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);



  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-950 text-slate-100 overflow-x-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-sky-400 to-blue-600 flex items-center justify-between p-1.5 shadow-md shadow-sky-500/20">
              <div className="w-2.5 h-6 bg-white rounded-full animate-pulse" />
              <div className="w-2.5 h-4 bg-white/70 rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Skill<span className="text-sky-400">Loop</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#simulator" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Matching Engine
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              How It Works
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/signin" className="text-sm font-semibold text-slate-200 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/10 bg-slate-950/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-300 py-2 border-b border-white/5">
                  Matching Engine
                </a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-300 py-2 border-b border-white/5">
                  How It Works
                </a>
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="w-full text-center text-sm font-semibold text-slate-200 py-3 rounded-full border border-white/15 hover:bg-white/5 transition-all">
                    Sign In
                  </Link>
                  <Link href="/signup" className="w-full text-center text-sm font-semibold bg-linear-to-r from-sky-500 to-blue-600 text-white py-3 rounded-full shadow-lg shadow-sky-500/25">
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 md:py-32 px-6">
        <div className="absolute inset-0 z-0">
          <Image src="/hero_collaboration.png" alt="SkilLoop Collaboration Background" fill priority quality={95} className="object-cover object-center select-none" />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/70 to-slate-950/90 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-slate-950/40 to-slate-950 z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-slate-950 to-transparent z-10" />
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none hidden md:block overflow-hidden max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="absolute top-[20%] left-[8%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl w-56 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Just Joined</span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <h4 className="text-sm font-semibold text-white">Design Mastery</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="relative flex -space-x-2 overflow-hidden">
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="/hero_collaboration.png" alt="User avatar" width={24} height={24} />
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900" src="/hero_collaboration.png" alt="User avatar" width={24} height={24} />
              </div>
              <span className="text-xs bg-sky-500/20 text-sky-400 font-bold px-2 py-0.5 rounded-full">+2 Joined</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="absolute top-[16%] right-[8%] bg-slate-900/60 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl w-64 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Session in progress</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div>
                <h4 className="text-sm font-bold text-white">Mentor Call</h4>
                <p className="text-[11px] text-slate-400">Sharing Figma Workflow</p>
              </div>
              <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white/80">14:52</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, duration: 0.8 }} className="absolute bottom-[25%] right-[6%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl w-60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-400/20">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Exchange Complete</h4>
              <p className="text-sm font-bold text-white">SEO for React Swap</p>
              <p className="text-[11px] text-sky-400 font-medium">15 min credit active</p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-30 max-w-4xl mx-auto text-center flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/20 px-4 py-1.5 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-bold tracking-wide uppercase text-sky-300">Your Skills are your Currency</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Exchange <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-cyan-300">Skills</span>
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-cyan-300">Grow</span> Faster.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
            Your Skills are now your Currency. Join SkilLoop to trade 15 minutes of your expertise for the skills you need today. No credit cards, no cost. Just pure knowledge transfer.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md">
            <Link href="/signup" className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-full shadow-xl shadow-sky-500/20 active:scale-98 transition-all overflow-hidden">
              Get Started
              <span className="bg-white/20 p-1 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>

            <Link href="/signin" className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/25 border border-white/20 text-white font-semibold px-8 py-4 rounded-full backdrop-blur-md active:scale-98 transition-all">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative z-30 bg-linear-to-r from-sky-500 via-blue-500 to-blue-600 py-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center">
            {[
              ["5K+", "Active Learners"],
              ["10K+", "Skills Taught"],
              ["20K+", "Sessions Completed"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col items-center text-center">
                <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-2">{value}</span>
                <span className="text-sky-100 font-medium text-sm uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="session-carousel" className="py-20 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10">Find the Right Match</h2>

          <div className="relative overflow-hidden rounded-[8px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
                className="bg-sky-50 border border-slate-200 rounded-[8px] p-2 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative w-[112px] h-[132px] shrink-0 overflow-hidden rounded-[8px] bg-slate-200">
                    <Image src={sessionCards[activeSlide].image} alt={sessionCards[activeSlide].name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="text-base font-semibold text-slate-950 truncate">{sessionCards[activeSlide].name}</h3>
                      <span className="flex items-center gap-1 text-base font-semibold text-slate-950">
                        <svg viewBox="0 0 16 16" className="w-5 h-5 fill-amber-400">
                          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
                        </svg>
                        {sessionCards[activeSlide].rating}
                      </span>
                    </div>

                    <span className="inline-flex rounded-[4px] bg-sky-200 px-2 py-1 text-base text-slate-950 mb-3">
                      {sessionCards[activeSlide].role}
                    </span>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
                      {sessionCards[activeSlide].skills.map((skill) => (
                        <span key={skill} className="text-base text-slate-950">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button className="w-full rounded-[4px] bg-sky-500 hover:bg-sky-400 text-white text-base font-medium py-1.5 transition-colors">
                      Join Session
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="hidden md:flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setActiveSlide((current) => (current - 1 + sessionCards.length) % sessionCards.length)}
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Previous session"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {sessionCards.map((card, index) => (
                  <button
                    key={card.role}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all ${activeSlide === index ? "w-6 bg-sky-500" : "w-2 bg-slate-300"
                      }`}
                    aria-label={`Show ${card.role} card`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveSlide((current) => (current + 1) % sessionCards.length)}
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Next session"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHARED EXPERIENCE SECTION ── */}
      <section className="px-6 pb-20 bg-white">
        <div className="max-w-lg mx-auto">
          <div className="relative min-h-[232px] overflow-hidden rounded-[8px] bg-slate-900">
            <Image src="/hero_collaboration.png" alt="SkilLoop Collaboration Background" fill priority quality={95} className="object-cover object-center select-none" />


            <div className="absolute inset-0 bg-slate-950/45" />

            <div className="relative z-10 flex min-h-[232px] items-end p-4">
              <p className="text-[17px] leading-[1.4] text-white">
                <span className="text-sky-400">SkilLoop</span> redefines how
                people learn by turning knowledge into a shared experience.
                Teach your skills, learn from others, and grow through real
                collaboration not just content.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="how-it-works" className=" px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10">How it Works</h2>

          <div className="flex flex-col gap-0">
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-linear-to-b from-sky-300 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-300/30">
                <Search className="w-9 h-9 text-slate-800 stroke-[1.8]" />
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold text-sky-500 mb-1">Find a Match</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Browse people by their skills.</p>
              </div>
            </div>

            <div className="ml-10 w-px h-10 bg-sky-400 my-1" />

            <div className="flex items-start gap-5">
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-linear-to-b from-sky-300 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-400/30">
                <Handshake className="w-9 h-9 text-slate-800" />
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold text-sky-500 mb-1">Request a Session</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Send a request and connect with your match.</p>
              </div>
            </div>

            <div className="ml-10 w-px h-10 bg-sky-400 my-1" />

            <div className="flex items-start gap-5">
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-linear-to-b from-sky-400 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <GraduationCap className="w-9 h-9 text-slate-800 stroke-[1.8]" />
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold text-sky-500 mb-1">Teach &amp; Learn</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Exchange Knowledge and grow together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="in-action" className="py-20 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            SkilLoop in Action
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-10">
            See how our users are learning and teaching in real-time.
          </p>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={actionSlide}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
                className="flex flex-col gap-0 items-center"
              >
                <div className="w-full bg-sky-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-200">
                    <Image
                      src={actionCards[actionSlide].image}
                      alt={actionCards[actionSlide].name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base font-extrabold text-slate-900">
                        {actionCards[actionSlide].name}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                        <svg viewBox="0 0 16 16" className="w-4 h-4 fill-amber-400">
                          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
                        </svg>
                        {actionCards[actionSlide].rating}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Teaches
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {actionCards[actionSlide].teaches.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-bold px-3 py-1 rounded-full bg-white text-slate-700 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center w-10 h-10 my-1 z-10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-sky-400/40">
                    <span className="font-black text-sm italic leading-none">
                      <Image src='/images/Group.png' alt="S" width={20} height={20} />
                    </span>
                  </div>
                </div>

                <div className="w-full bg-sky-500 rounded-3xl p-4 flex items-center gap-4 shadow-lg shadow-sky-400/25">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-sky-400">
                    <Image
                      src={actionCards[actionSlide].image}
                      alt={actionCards[actionSlide].name}
                      fill
                      className="object-cover opacity-90"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base font-extrabold text-white">
                        {actionCards[actionSlide].name}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold text-amber-300">
                        <svg viewBox="0 0 16 16" className="w-4 h-4 fill-amber-300">
                          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
                        </svg>
                        {actionCards[actionSlide].rating}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-sky-100 mb-2">
                      Learning
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {actionCards[actionSlide].learning.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-bold px-3 py-1 rounded-full bg-sky-400/60 text-white"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="hidden md:flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setActionSlide(
                    (current) => (current - 1 + actionCards.length) % actionCards.length
                  )
                }
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Previous action"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {actionCards.map((card, index) => (
                  <button
                    key={card.name}
                    type="button"
                    onClick={() => setActionSlide(index)}
                    className={`h-2 rounded-full transition-all ${actionSlide === index ? "w-6 bg-sky-500" : "w-2 bg-slate-300"
                      }`}
                    aria-label={`Show ${card.name}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setActionSlide((current) => (current + 1) % actionCards.length)
                }
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Next action"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>



      <section id="why" className="py-20 px-6 bg-slate-50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10">Why SkilLoop?</h2>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-[#00CCFC]/50 flex items-center justify-center">
                <Image src='/images/Group.png' alt="S" width={20} height={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-sky-500 mb-0.5">Skill Exchange</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Teach what you know and learn what you need.</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Image src='/images/mdi_puzzle-star.png' alt="S" width={30} height={30} />

              </div>
              <div>
                <h3 className="text-base font-bold text-purple-500 mb-0.5">Build your Portfolio</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Work on real-world projects to build experience.</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                  <circle cx="16" cy="16" r="11" stroke="#f97316" strokeWidth="2.5" />
                  <path d="M16 10v6l4 2" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-orange-500 mb-0.5">15 minutes Mastery</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Learn faster with short, focused sessions designed to deliver real skills.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GROWTH BENEFITS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-lg mx-auto flex flex-col gap-6">
          <h2 className="text-3xl font-extrabold text-slate-900">Earn as You Learn</h2>
          <p className="text-base font-semibold leading-relaxed text-slate-500">Get Rewarded for every skill you teah and learn</p>

          <div className="rounded-[8px] bg-[#ff6f47]/10 p-8 min-h-[205px] shadow-[0_14px_28px_rgba(0,0,0,0.45)]">
            <div className="flex justify-center mb-6">
              <Star className="w-14 h-14 fill-amber-300 text-amber-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-sky-400 mb-2">
              Earn Points
            </h2>
            <p className="text-base font-semibold leading-relaxed text-black">
              Gain points when you teach or complete sessions.
            </p>
          </div>

          <div className="rounded-[8px] bg-[#36a4cf]/10 p-8 min-h-[205px] shadow-[0_14px_28px_rgba(0,0,0,0.45)] flex flex-col justify-end">
            <div className="flex justify-center mb-6">
              <CircleDashed className="w-12 h-12 text-sky-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-sky-400 mb-2">
              Track Progress
            </h2>
            <p className="text-base font-semibold leading-relaxed text-black">
              Watch your skills grow over time.
            </p>
          </div>

          <div className="rounded-[8px] bg-[#e07f14]/10 p-8 min-h-[205px] shadow-[0_14px_28px_rgba(0,0,0,0.45)]">
            <div className="flex justify-center mb-6">
              <Image src='/images/wrapped-gift.png' alt="S" width={50} height={50} />
            </div>
            <h2 className="text-2xl font-extrabold text-sky-400 mb-2">
              Build your Portfolio
            </h2>
            <p className="text-base font-semibold leading-relaxed text-black">
              Work on real-world projects to build experience.
            </p>
          </div>
        </div>
      </section>

      {/* ── EXPLORE SKILLS CAROUSEL ── */}
      <section id="explore-skills" className="py-20 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Skills</h2>
          <p className="text-base font-semibold leading-relaxed text-slate-500 mb-10">Discover what you can learn or teach with <span className="text-sky-500">SkilLoop</span></p>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={exploreSlide}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
                className="flex flex-col gap-6"
              >
                {exploreSkillSlides[exploreSlide].map((skill) => {
                  const Icon = skill.icon;

                  return (
                    <div
                      key={skill.label}
                      className={`${skill.className} rounded-[8px] min-h-[72px] px-8 py-5 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-16 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                          <Icon className={`w-5 h-5 ${skill.iconClassName}`}/>
                        </div>
                        <div className="flex flex-col items-start gap-3">
                          <p className="text-lg font-extrabold text-white/85 truncate">
                            {skill.label}
                          </p>
                          <p className="text-base font-medium text-slate-900/50">
                            {skill.meta}
                          </p>
                        </div>

                      </div>

                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            <div className="hidden md:flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setExploreSlide(
                    (current) =>
                      (current - 1 + exploreSkillSlides.length) %
                      exploreSkillSlides.length
                  )
                }
                className="w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 flex items-center justify-center"
                aria-label="Previous skill group"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {exploreSkillSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setExploreSlide(index)}
                    className={`h-2 rounded-full transition-all ${exploreSlide === index ? "w-6 bg-sky-400" : "w-2 bg-white/30"
                      }`}
                    aria-label={`Show skill group ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setExploreSlide(
                    (current) => (current + 1) % exploreSkillSlides.length
                  )
                }
                className="w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 flex items-center justify-center"
                aria-label="Next skill group"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>



      <section id="cta" className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            No Payment. Just <span className="text-sky-500">Skill</span> for <span className="text-sky-500">Skill.</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-8">Start learning by teaching what you already know.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-sky-400/30 active:scale-95 transition-all text-sm">
            Get Started
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-sky-400 to-blue-600 flex items-center justify-between p-1.5">
                <div className="w-2 h-5 bg-white rounded-full" />
                <div className="w-2 h-3.5 bg-white/70 rounded-full" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Skill<span className="text-sky-400">Loop</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              SkilLoop is a collaborative marketplace enabling knowledge workers, designers, builders, and professionals to swap real-world skills instantly using structured 15-minute interactions.
            </p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} SkilLoop, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
