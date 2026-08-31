"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ToastOptions {
  type?: "success" | "error" | "info";
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" | "info" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const type = options.type || "error";
    const duration = options.duration ?? 3500;
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type });
    timer.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const toastElement = toast ? (
    <div className="fixed left-1/2 bottom-24 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
      <div
        key={toast.id}
        className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-transform ${
          toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-sky-600"
        }`}
      >
        <span className="flex-1 break-words">{toast.message}</span>
        <button onClick={() => setToast(null)} className="shrink-0 rounded-md p-0.5 hover:bg-white/20 transition-colors" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  ) : null;

  return { toastElement, showToast };
}

export type { ToastOptions };
