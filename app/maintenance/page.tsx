import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SkilLoop | Scheduled Maintenance",
  robots: { index: false, follow: false },
};

/**
 * Rendered while MAINTENANCE_MODE is on. Intentionally a server component with
 * no client JS, so it stays reachable even when every other route is gated off.
 */
export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/30">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-sky-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          We&apos;ll be right back
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
          SkilLoop is undergoing scheduled maintenance for the next 24 hours. We&apos;re
          making some improvements, and the app will be unavailable during this
          time.
        </p>

        <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <span className="text-sm font-medium text-slate-300">
            Maintenance in progress
          </span>
        </div>

        <p className="mt-10 text-xs text-slate-600">
          Any session scheduled during this window is unaffected and will be honoured
          once we&apos;re back.
        </p>
      </div>
    </main>
  );
}