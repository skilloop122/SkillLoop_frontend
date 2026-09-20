"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { validatePassword } from "@/lib/utils";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const loading = useAuthStore((s) => s.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!token.trim()) {
      setFormError("Please enter your reset token.");
      return;
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) {
      setFormError(pwCheck.message || "Please enter a valid password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const result = await resetPassword(token.trim(), newPassword);
    if (!result.success) {
      setFormError(result.message || "Password reset failed");
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-emerald-500" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Password updated
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your password has been reset successfully. Sign in with your new
            password.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/signin")}
            className="w-full mt-6 bg-sky-500 hover:bg-sky-400 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-98 transition-all text-base"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Link
        href="/signin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Sign In
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Reset your password
      </h1>
      <p className="text-sm text-slate-500 font-medium mb-8">
        Enter the reset token from your email and choose a new password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400">
            Reset Token
          </label>
          <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
            <KeyRound
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            />
            <input
              type="text"
              required
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Paste your reset token"
              className="w-full bg-transparent pl-11 pr-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400">
            New Password
          </label>
          <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50 flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Enter new password"
              className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400">
            Confirm New Password
          </label>
          <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Re-enter new password"
              className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
            />
          </div>
        </div>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-98 transition-all text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2 inline" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 overflow-hidden select-none">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}