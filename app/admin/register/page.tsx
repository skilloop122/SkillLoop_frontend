"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Shield,
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { validatePassword } from "@/lib/utils";

export default function AdminRegister() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const register = useAdminAuthStore((state) => state.register);
  const loading = useAdminAuthStore((state) => state.loading);
  const remoteError = useAdminAuthStore((state) => state.error);

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

  const bgIcons = [
    { icon: Atom, top: "8%", left: "10%", size: 36, delay: 0 },
    { icon: Terminal, top: "12%", right: "12%", size: 28, delay: 1 },
    { icon: Palette, top: "25%", left: "18%", size: 32, delay: 2 },
    { icon: Database, top: "30%", right: "8%", size: 40, delay: 0.5 },
    { icon: Settings, top: "45%", left: "6%", size: 30, delay: 1.5 },
    { icon: FileCode, top: "50%", right: "20%", size: 34, delay: 2.5 },
    { icon: BarChart, top: "68%", left: "12%", size: 38, delay: 0.8 },
    { icon: Cpu, top: "75%", right: "10%", size: 32, delay: 1.2 },
    { icon: Atom, bottom: "8%", left: "20%", size: 28, delay: 2 },
  ];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      showToast("Please enter both first and last name.", "error");
      return;
    }

    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      showToast(pwCheck.message || "Password does not meet requirements.", "error");
      return;
    }

    if (!secret.trim()) {
      showToast("Admin secret key is required.", "error");
      return;
    }

    const result = await register({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      secret: secret.trim(),
    });

    if (!result.success) {
      showToast(result.message || "Admin registration failed.", "error");
      return;
    }

    showToast("Admin account created!", "success");
    setTimeout(() => router.push("/admin"), 800);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 py-12 px-6 overflow-hidden select-none">
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

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {bgIcons.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="absolute text-blue-300/50 animate-pulse"
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

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-sky-500" />
          <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight">
            Admin Registration
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide mb-10 text-center px-4">
          Create an admin account with a secret key
        </p>

        <form onSubmit={handleRegister} className="w-full space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">First Name</label>
              <div className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400">Last Name</label>
              <div className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">Email Address</label>
            <div className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skilloop.com"
                className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">Password</label>
            <div className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50 flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number, special"
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

          {/* Secret */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">Admin Secret Key</label>
            <div className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100/50 flex items-center">
              <input
                type={showSecret ? "text" : "password"}
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter the admin secret key"
                className="w-full bg-transparent px-5 py-4.5 rounded-2xl text-slate-800 font-medium text-base outline-hidden placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showSecret ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          {remoteError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {remoteError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-98 transition-all text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2 inline" /> Creating admin account...</>
            ) : (
              "Register Admin"
            )}
          </button>
        </form>

        <p className="text-sm font-semibold text-slate-400 mt-10">
          Already have admin access?{" "}
          <Link href="/admin/login" className="text-sky-500 hover:text-sky-600 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
