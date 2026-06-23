"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Apple,
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
  Loader2
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { validatePassword } from "@/lib/utils";

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const remoteError = useAuthStore((state) => state.error);
  const [toasts, setToasts] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  }[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  // Background scattered icon layout positions (identical to sign-in for aesthetic symmetry)
  const bgIcons = [
    { icon: Atom, top: "8%", left: "10%", size: 36, delay: 0 },
    { icon: Terminal, top: "12%", right: "12%", size: 28, delay: 1 },
    { icon: Palette, top: "25%", left: "18%", size: 32, delay: 2 },
    { icon: Database, top: "30%", right: "8%", size: 40, delay: 0.5 },
    { icon: Settings, top: "45%", left: "6%", size: 30, delay: 1.5 },
    { icon: FileCode, top: "50%", right: "20%", size: 34, delay: 2.5 },
    { icon: BarChart, top: "68%", left: "12%", size: 38, delay: 0.8 },
    { icon: Cpu, top: "75%", right: "10%", size: 32, delay: 1.2 },
    { icon: Atom, bottom: "8%", left: "20%", size: 28, delay: 2 }
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      showToast("Please agree to the Terms and Conditions first.", "error");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      showToast("Please enter both first and last name.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      showToast(pwCheck.message || "Password does not meet requirements.", "error");
      return;
    }

    const result = await register({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    if (!result.success) {
      showToast(result.message || "Registration failed.", "error");
      return;
    }

    const loginResult = await login({ email, password });
    if (!loginResult.success) {
      showToast("Account created. Please sign in.", "success");
      setTimeout(() => router.push("/signin"), 800);
      return;
    }

    showToast("Account created successfully!", "success");
    setTimeout(() => router.push("/signup/profile"), 800);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 overflow-hidden select-none">

      {/* Toast container */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-xs px-4 py-2 rounded-lg shadow-md text-sm font-medium ${
              t.type === "success"
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
                animationDuration: "4s"
              }}
            >
              <IconComp size={item.size} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* Floating Back to Home button */}
      {/* <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/80 border border-slate-200 px-3.5 py-2 rounded-full shadow-sm hover:shadow active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div> */}

      {/* Sign Up Core Layout */}
      <div className="relative z-10 w-full max-w-107.5 mx-auto flex flex-col items-center">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight mb-2 text-center">
          Join SkilLoop
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide mb-10 text-center px-4">
          Provide your full name, email and password to get started with SkilLoop.
        </p>

        {/* Credentials Form */}
        <form onSubmit={handleSignUp} className="w-full space-y-6">

          {/* Name inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">First Name</label>
              <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">Last Name</label>
              <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">
              Email Address
            </label>
            <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">
              Password
            </label>
            <div className="relative rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50 flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {/* Agree Terms and Conditions Checkbox */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-slate-300 peer-checked:border-sky-500 peer-checked:bg-sky-500 rounded flex items-center justify-center transition-all">
                <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -translate-y-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-semibold text-slate-700 select-none">
                I agree to the{" "}
                <span className="text-sky-500 hover:text-sky-600 transition-colors">
                  Terms and Conditions
                </span>
              </span>
            </label>
          </div>

          {remoteError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {remoteError}
            </div>
          ) : null}

          {/* Primary Action Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-98 transition-all text-base"
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2 inline" /> Creating account...</> : "Sign Up"}
          </button>

        </form>

        {/* Separator */}
        <div className="w-full flex items-center justify-center my-8 gap-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm font-bold text-slate-800">Or Continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Social logins */}
        <div className="w-full grid grid-cols-2 gap-4">

          <button className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 py-3.5 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] hover:bg-slate-50 transition-colors active:scale-95 text-slate-700 font-semibold text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.63 1.45 7.45l3.77 2.92C6.12 6.84 8.84 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.48c-.28 1.48-1.12 2.74-2.38 3.59l3.69 2.86c2.16-1.99 3.7-4.92 3.7-8.54z"
              />
              <path
                fill="#FBBC05"
                d="M5.22 14.62c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.45 7.14C.52 9.07 0 11.23 0 13.5s.52 4.43 1.45 6.36l3.77-2.92c-.24-.44-.24-1.9-.24-2.32z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.03.69-2.34 1.1-4.27 1.1-3.16 0-5.88-1.8-6.84-5.33L1.39 15.9C3.33 19.74 7.3 23 12 23z"
              />
            </svg>
            Google
          </button>

          <button className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 py-3.5 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] hover:bg-slate-50 transition-colors active:scale-95 text-slate-700 font-semibold text-sm">
            <Apple size={16} className="text-slate-900 fill-slate-900" />
            Apple
          </button>

        </div>

        {/* Already have an account Footer */}
        <p className="text-sm font-semibold text-slate-400 mt-10">
          Already have an account?{" "}
          <Link href="/signin" className="text-sky-500 hover:text-sky-600 transition-colors">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
