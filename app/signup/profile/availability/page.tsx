"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
} from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "Morning (6am – 12pm)",
  "Afternoon (12pm – 5pm)",
  "Evening (5pm – 9pm)",
  "Night (9pm – 12am)",
];

export default function SetAvailability() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

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

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleFinishSetup = () => {
    localStorage.setItem(
      "userAvailability",
      JSON.stringify({ days: selectedDays, times: selectedTimes })
    );
    router.push("/signup/profile/learn");
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col py-10 px-6 overflow-hidden select-none">
      {/* Scattered Tech Icons Background */}
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

      {/* Header */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto text-center mb-6">
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight">
          Set your Availability
        </h1>
      </div>

      {/* Body */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto flex-1 flex flex-col gap-8">
        {/* Subtitle */}
        <p className="text-sm font-medium text-slate-500">
          Select the days and times that work best for you.
        </p>

        {/* Days */}
        <div className="flex flex-wrap gap-3">
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <motion.button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                  isSelected
                    ? "bg-sky-500 text-white shadow-sky-200"
                    : "bg-[#c1c1c1] text-black/50 hover:bg-slate-300"
                }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Preferred time of day
          </p>
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedTimes.includes(slot);
            return (
              <motion.button
                key={slot}
                type="button"
                onClick={() => toggleTime(slot)}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                  isSelected
                    ? "bg-sky-500 text-white shadow-sky-200"
                    : "bg-[#c1c1c1] text-black/50 hover:bg-slate-300"
                }`}
              >
                {slot}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Finish Setup Button */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto mt-8">
        <button
          id="finish-setup-btn"
          onClick={handleFinishSetup}
          className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );
}
