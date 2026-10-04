"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";

interface ZoomPasscodeProps {
  passcode?: string;
  className?: string;
}

/**
 * Fallback for when a Zoom URL cannot carry `?pwd=` — a proxy that strips query
 * strings, a cached pre-fix URL, or a user pasting the link elsewhere. Without
 * this the passcode was fetched from the API and then never surfaced.
 */
export default function ZoomPasscode({ passcode, className = "" }: ZoomPasscodeProps) {
  const [copied, setCopied] = useState(false);

  if (!passcode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(passcode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be denied; the passcode is still visible on screen.
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1.5 text-xs text-sky-800 ${className}`}
    >
      <KeyRound size={12} className="shrink-0 text-sky-500" />
      <span className="font-medium text-sky-600">Passcode</span>
      <code className="font-mono text-[13px] font-bold tracking-wide text-sky-900">
        {passcode}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Passcode copied" : "Copy passcode"}
        className="ml-0.5 rounded p-0.5 text-sky-500 transition-colors hover:bg-sky-100 hover:text-sky-700"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}