"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const loading = useAuthStore((s) => s.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email.");
      return;
    }

    const result = await forgotPassword(email.trim());
    if (!result.success) {
      setFormError(result.message || "Failed to request password reset");
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 overflow-hidden select-none">
      <div className="relative z-10 w-full max-w-md mx-auto">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

        {sent ? (
          <div className="bg-white rounded-2xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="text-sky-500" size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              If an account exists for <span className="font-semibold text-slate-700">{email}</span>,
              a password reset link has been sent. Follow the link in the email
              to create a new password.
            </p>
            <Link
              href="/reset-password"
              className="inline-block mt-6 text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors"
            >
              Already have a reset link?
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">
                  Email Address
                </label>
                <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="Enter your email"
                    className="w-full bg-transparent pl-11 pr-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}