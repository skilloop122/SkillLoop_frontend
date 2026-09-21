"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Atom,
  Terminal,
  Cpu,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const loading = useAuthStore((state) => state.loading);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  }[]>([]);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setEmail(params.get("email") || "");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const digit = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (paste) {
      const digits = paste.split("");
      const newOtp = [...Array(6).fill("")];
      digits.forEach((d, i) => { newOtp[i] = d; });
      setOtp(newOtp);
      setError("");
      const focusIdx = Math.min(digits.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    const result = await verifyOtp(email, otpValue);
    if (result.success) {
      showToast(result.message || "Email verified!", "success");
      router.push("/signup/profile");
    } else {
      showToast(result.message || "Invalid OTP.", "error");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    const result = await resendOtp(email);
    if (result.success) {
      showToast(result.message || "OTP resent!", "success");
      setResendCooldown(30);
    } else {
      showToast(result.message || "Failed to resend OTP.", "error");
    }
  };

  const bgIcons = [
    { icon: Atom, top: "8%", left: "10%", size: 36, delay: 0 },
    { icon: Terminal, top: "12%", right: "12%", size: 28, delay: 1 },
    { icon: Cpu, top: "25%", left: "18%", size: 32, delay: 2 },
    { icon: Atom, top: "30%", right: "8%", size: 40, delay: 0.5 },
    { icon: Terminal, top: "45%", left: "6%", size: 30, delay: 1.5 },
    { icon: Cpu, top: "68%", left: "12%", size: 38, delay: 0.8 },
    { icon: Atom, bottom: "8%", left: "20%", size: 28, delay: 1.2 },
    { icon: Terminal, bottom: "12%", right: "10%", size: 32, delay: 2 },
    { icon: Cpu, top: "75%", right: "20%", size: 26, delay: 1 },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 overflow-hidden select-none">
      {/* Toast container */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-xs px-4 py-2 rounded-lg shadow-md text-sm font-medium ${t.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
              }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Scattered Tech Icons Background */}
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

      {/* OTP Core Layout */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-5 shadow-sm">
          <ShieldCheck size={28} className="text-sky-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-sky-500 tracking-tight mb-2 text-center">
          Verify Your Email
        </h1>
        <p className="text-sm text-slate-500 font-medium tracking-wide mb-2 text-center px-4">
          We sent a 6-digit code to{" "}
          <span className="text-sky-500 font-bold">{email}</span>
        </p>
        <p className="text-sm text-slate-400 mb-8 text-center px-4">
          Enter the code below to verify your account
        </p>

        {/* OTP Inputs */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
          className="w-full space-y-5"
        >
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type={showOtp ? "text" : "password"}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 bg-white shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-colors text-slate-700"
              />
            ))}
          </div>

          {/* Show/hide OTP toggle */}
          <button
            type="button"
            onClick={() => setShowOtp((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto"
          >
            {showOtp ? <EyeOff size={14} /> : <Eye size={14} />}
            {showOtp ? "Hide" : "Show"} code
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-sky-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-sm text-slate-500">
          {resendCooldown > 0 ? (
            <span className="text-slate-400">
              Resend code in {resendCooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sky-500 font-bold hover:underline disabled:opacity-50 cursor-pointer"
            >
              Resend code
            </button>
          )}
        </div>

        {/* Back to signup */}
        <Link
          href="/signup"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to signup
        </Link>
      </div>
    </div>
  );
}
