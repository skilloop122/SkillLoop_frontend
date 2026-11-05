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
  CalendarDays,
  X,
  Loader2,
  AlertCircle,
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

type TimeRange = {
  start: string;
  end: string;
};

export default function SetAvailability() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeRanges, setTimeRanges] = useState<Record<string, TimeRange>>({});
  const [activeDay, setActiveDay] = useState("");
  const [saving, setSaving] = useState(false);

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

  const formatTime = (time: string) => {
    if (!time) return "";

    const [hourValue, minute] = time.split(":");
    const hour = Number(hourValue);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const isSelected = prev.includes(day);

      if (isSelected) {
        const nextRanges = { ...timeRanges };
        delete nextRanges[day];
        setTimeRanges(nextRanges);

        if (activeDay === day) {
          setActiveDay("");
        }

        return prev.filter((item) => item !== day);
      }

      setActiveDay(day);
      setTimeRanges((current) => ({
        ...current,
        [day]: current[day] || { start: "09:00", end: "16:00" },
      }));

      return [...prev, day];
    });
  };

  const updateTimeRange = (
    day: string,
    field: keyof TimeRange,
    value: string
  ) => {
    setTimeRanges((current) => ({
      ...current,
      [day]: {
        start: current[day]?.start || "09:00",
        end: current[day]?.end || "16:00",
        [field]: value,
      },
    }));
  };

  const removeTime = (day: string) => {
    setSelectedDays((current) => current.filter((item) => item !== day));

    setTimeRanges((current) => {
      const next = { ...current };
      delete next[day];
      return next;
    });

    if (activeDay === day) {
      setActiveDay("");
    }
  };

  const selectedTimeRows = selectedDays
    .map((day) => {
      const range = timeRanges[day];

      if (!range?.start || !range?.end) return null;

      return {
        day,
        label: `${day}; ${formatTime(range.start)} - ${formatTime(range.end)}`,
      };
    })
    .filter(Boolean) as { day: string; label: string }[];

  const handleFinishSetup = () => {
    const times = selectedTimeRows.map((row) => row.label);

    localStorage.setItem(
      "userAvailability",
      JSON.stringify({
        days: selectedDays,
        times,
        timeRanges,
      })
    );

    setSaving(true);
    setTimeout(() => router.push("/signup/profile/skills"), 400);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-6 overflow-x-hidden overflow-y-auto select-none">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {bgIcons.map((item, idx) => {
          const IconComp = item.icon;

          return (
            <div
              key={idx}
              className="absolute text-blue-300/50 dark:text-blue-300/30 animate-pulse"
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

      <div className="w-full max-w-107.5 mx-auto pt-6 text-center z-10">
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight mb-2">
          Set up your Profile
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-107.5 mx-auto flex-1 flex flex-col gap-7 my-8">
        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Set your Availability
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Select the days and times that work best for you.
          </p>
        </div>

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
                className={`px-4 py-3 rounded-[8px] text-base font-normal transition-all duration-200 shadow-lg ${isSelected
                    ? "bg-sky-500 text-white shadow-sky-200"
                    : "bg-[#c1c1c1] text-black/50 hover:bg-slate-300"
                  }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>

        {selectedDays.length > 0 && (
          <div className="rounded-[12px] border border-sky-100 bg-white/80 p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Pick exact time
            </p>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {selectedDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`shrink-0 rounded-[8px] px-3 py-2 text-sm ${activeDay === day
                      ? "bg-sky-500 text-white"
                      : "bg-sky-100 text-slate-700"
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {activeDay && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    Start time
                  </span>
                  <input
                    type="time"
                    value={timeRanges[activeDay]?.start || ""}
                    onChange={(e) =>
                      updateTimeRange(activeDay, "start", e.target.value)
                    }
                    className="w-full rounded-[8px] border border-sky-200 px-3 py-2 text-sm text-black outline-none focus:border-sky-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    End time
                  </span>
                  <input
                    type="time"
                    value={timeRanges[activeDay]?.end || ""}
                    onChange={(e) =>
                      updateTimeRange(activeDay, "end", e.target.value)
                    }
                    className="w-full rounded-[8px] border border-sky-200 px-3 py-2 text-sm text-black outline-none focus:border-sky-500"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="mb-4 text-[25px] font-medium text-black">
            Selected Time
          </h2>

          <div className="flex flex-col gap-3">
            {selectedTimeRows.map((row) => (
              <div key={row.day} className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-sky-500" />
                <span className="flex-1 text-base text-black">
                  {row.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeTime(row.day)}
                  className="text-slate-600 hover:text-sky-500"
                  aria-label={`Remove ${row.day}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {selectedTimeRows.length === 0 && (
              <p className="text-sm text-slate-400">
                Select a day and choose your available time.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-107.5 mx-auto mt-8 flex flex-col gap-4">
        {/* Info Banner matching user specification */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-sky-400 bg-sky-100/70 px-4.5 py-3.5 shadow-xs">
          <AlertCircle className="h-6 w-6 text-sky-500 shrink-0" strokeWidth={2} />
          <p className="text-sm sm:text-[15px] font-normal text-slate-900 leading-snug">
            Set your preferred time most suitable for you to have both learning and teaching sessions.
          </p>
        </div>

        <button
          id="finish-setup-btn"
          type="button"
          onClick={handleFinishSetup}
          disabled={selectedTimeRows.length === 0 || saving}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-200 disabled:cursor-not-allowed text-white font-normal py-4 rounded-[18px] shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving Schedule...
            </>
          ) : (
            "Continue"
          )}
        </button>


      </div>
    </div>
  );
}