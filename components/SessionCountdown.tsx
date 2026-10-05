"use client";

import { Clock } from "lucide-react";
import { useNow } from "../lib/useNow";
import { SESSION_DURATION_MS } from "../lib/useSessionLifecycle";

function format(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function SessionCountdown({
  actualStartMs,
  scheduledLabel,
  className = "",
}: {
  actualStartMs?: number;
  /** Human-readable fallback shown when no actualStartMs is available, e.g. "Oct 10 at 14:00" */
  scheduledLabel?: string;
  className?: string;
}) {
  const now = useNow();

  // Renders nothing until mounted: the remaining time is derived from the clock,
  // so showing it during SSR would mismatch on hydration.
  if (!now) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`} aria-hidden="true">
        <Clock size={13} className="text-slate-300" />
        <span className="w-9 text-[13px] font-medium tabular-nums text-slate-300">
          --:--
        </span>
      </div>
    );
  }

  if (!actualStartMs) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Clock size={13} className="text-slate-400" />
        <span
          className="text-[13px] font-medium tabular-nums text-slate-500"
          role="timer"
          aria-live="off"
        >
          {scheduledLabel ?? "Scheduled"}
        </span>
      </div>
    );
  }

  const remaining = Math.min(
    Math.max(actualStartMs + SESSION_DURATION_MS - now, 0),
    SESSION_DURATION_MS,
  );
  const expired = remaining <= 0;
  const notStarted = actualStartMs - now > 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock size={13} className={expired ? "text-amber-500" : "text-slate-400"} />
      <span
        className={`text-[13px] font-medium tabular-nums ${
          expired ? "text-amber-600" : "text-slate-500"
        }`}
        role="timer"
        aria-live="off"
      >
        {expired ? "Ended" : format(remaining)}
      </span>
      {notStarted && !expired ? (
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          upcoming
        </span>
      ) : null}
    </div>
  );
}