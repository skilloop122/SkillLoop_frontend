"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Atom,
  Terminal,
  Palette,
  Database,
  Settings,
  FileCode,
  BarChart,
  Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ALL_TIMES = [
  "Morning (9am – 12pm)",
  "Afternoon (1pm – 3pm)",
  "Evening (6pm – 9pm)",
  "Night (10pm – 12am)",
];

export default function RequestSessionPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionLink, setSessionLink] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userAvailability");

      if (raw) {
        const parsed = JSON.parse(raw) as { days: string[]; times: string[] };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvailableDays(parsed.days?.length ? parsed.days : ALL_DAYS);
        setAvailableTimes(parsed.times?.length ? parsed.times : ALL_TIMES);
      } else {
        setAvailableDays(ALL_DAYS);
        setAvailableTimes(ALL_TIMES);
      }
    } catch {
      setAvailableDays(ALL_DAYS);
      setAvailableTimes(ALL_TIMES);
    }
  }, []);

  const bgIcons = [
    { icon: Atom, top: "5%", left: "8%", size: 36, delay: 0 },
    { icon: Terminal, top: "9%", right: "9%", size: 28, delay: 1 },
    { icon: Palette, top: "20%", left: "14%", size: 32, delay: 2 },
    { icon: Database, top: "27%", right: "5%", size: 40, delay: 0.5 },
    { icon: Settings, top: "43%", left: "4%", size: 30, delay: 1.5 },
    { icon: FileCode, top: "53%", right: "16%", size: 34, delay: 2.5 },
    { icon: BarChart, top: "67%", left: "9%", size: 38, delay: 0.8 },
    { icon: Cpu, top: "77%", right: "7%", size: 32, delay: 1.2 },
    { icon: Atom, bottom: "5%", left: "16%", size: 28, delay: 2 },
  ];

  const handleConfirmSession = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/home");
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-10">
      <div className="w-full max-w-md mx-auto px-5 pt-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 border border-[#0ea5e9] rounded-[4px] flex items-center justify-center mb-6 hover:bg-sky-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={1.5} />
        </button>

        <div className="relative w-full h-[220px] rounded-[12px] overflow-hidden mb-6 bg-slate-200">
          <Image
            src="/hero_collaboration.png"
            alt="Sander James"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-medium text-black leading-tight mb-1">
              Sander James
            </h1>
            <p className="text-[15px] text-slate-700 font-medium">
              Frontend Session
            </p>
          </div>
          <span className="inline-block bg-[#ccebf8] text-[#334155] text-[13px] font-medium px-3 py-1 rounded-[4px]">
            Learning
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-[22px] font-medium text-black mb-4">
            Select a Day
          </h2>
          <div className="flex flex-wrap gap-3">
            {availableDays.map((day) => (
              <motion.button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200 shadow-sm ${
                  selectedDay === day
                    ? "bg-[#0ea5e9] text-white shadow-sky-200"
                    : "bg-[#d1d5db] text-black/60 hover:bg-[#9ca3af]"
                }`}
              >
                {day}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[22px] font-medium text-black mb-4">
            Select a Time
          </h2>
          <div className="flex flex-col gap-3">
            {availableTimes.map((slot) => (
              <motion.button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 shadow-sm ${
                  selectedTime === slot
                    ? "bg-[#0ea5e9] text-white shadow-sky-200"
                    : "bg-[#d1d5db] text-black/60 hover:bg-[#9ca3af]"
                }`}
              >
                {slot}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[22px] font-medium text-black mb-4">
            Add a Link
          </h2>

          <input
            type="url"
            value={sessionLink}
            onChange={(e) => setSessionLink(e.target.value)}
            placeholder="Paste link here"
            className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-[14px] font-medium text-black outline-none transition-all placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-100"
          />
        </div>

        {(selectedDay || selectedTime || sessionLink) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-8 rounded-2xl border border-[#0ea5e9] px-5 py-4 bg-sky-50"
          >
            <h2 className="text-[16px] font-semibold text-sky-600 mb-2">
              Proposed Schedule
            </h2>
            <p className="text-[14px] text-slate-700">
              {selectedDay && <span className="font-medium">{selectedDay}</span>}
              {selectedDay && selectedTime && " · "}
              {selectedTime && (
                <span className="font-medium">{selectedTime}</span>
              )}
              {sessionLink && (
                <>
                  {(selectedDay || selectedTime) && <br />}
                  <span className="font-medium break-all">{sessionLink}</span>
                </>
              )}
            </p>
          </motion.div>
        )}

        <button
          id="confirm-session-btn"
          type="button"
          onClick={handleConfirmSession}
          className="w-full bg-[#7dd3fc] hover:bg-[#38bdf8] text-white font-semibold py-4 rounded-[12px] text-[17px] shadow-sm transition-colors"
        >
          Confirm Session
        </button>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {bgIcons.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={idx}
                      className="absolute text-sky-200/60 animate-pulse"
                      style={{
                        top: item.top,
                        left: item.left,
                        right: item.right,
                        bottom: item.bottom,
                        animationDelay: `${item.delay}s`,
                        animationDuration: "4s",
                      }}
                    >
                      <IconComp size={item.size} strokeWidth={1.5} />
                    </div>
                  );
                })}
              </div>

              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 22,
                    delay: 0.1,
                  }}
                  className="w-36 h-36 rounded-full bg-sky-500 shadow-2xl shadow-sky-300/50 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 52 52"
                    className="w-20 h-20"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="10,28 21,39 42,16" />
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    You are all set 🎉
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Your session has been requested.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="relative z-10 w-full max-w-[430px] mx-auto px-6 pb-10"
              >
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}