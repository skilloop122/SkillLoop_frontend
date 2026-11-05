"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCode,
  Palette,
  Settings,
  Database,
  BarChart,
  Atom,
  Terminal,
  Cpu,
  Camera,
  Phone,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useProfileStore, type Schedule } from "@/lib/profileStore";
import { useSkillsStore } from "@/lib/skillsStore";
import { useToast } from "@/hooks/useToast";
import { isValidPhoneNumber } from "libphonenumber-js";

// type PhoneStep = "input" | "otp" | "verified";

export default function ProfileDetailsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createProfile, loading: profileLoading } = useProfileStore();
  const { syncSkillListings } = useSkillsStore();
  const { toastElement, showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Phone state (OTP verification flow commented out pending backend SMS integration)
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const isPhoneValid =
    phoneNumber.trim() !== "" &&
    isValidPhoneNumber(phoneNumber, "NG");

  /* OTP state commented out
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  */

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Background icons for visual continuity with other profile setup screens
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

  /* Cooldown timer for OTP resend — commented out
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  */

  // Handle image upload and convert to Data URL for instant preview & persistence
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      showToast("Profile picture selected!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  /* OTP verification handlers — commented out pending backend SMS integration
  const cleanPhone = (val: string) => val.replace(/[^\d+]/g, "");

  const handleSendOtp = async () => {
    const cleaned = cleanPhone(phoneNumber);
    if (!cleaned || cleaned.replace(/\D/g, "").length < 7) {
      showToast("Please enter a valid phone number (at least 7 digits).");
      return;
    }

    setSendingOtp(true);
    setOtpError("");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    await new Promise((resolve) => setTimeout(resolve, 600));

    setSendingOtp(false);
    setPhoneStep("otp");
    setResendCooldown(30);
    setOtp(["", "", "", "", "", ""]);

    showToast(`Verification code sent! (Use code: ${code})`);

    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const digit = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError("");

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (paste) {
      const digits = paste.split("");
      const newOtp = [...Array(6).fill("")];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      setOtpError("");
      const focusIdx = Math.min(digits.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const codeEntered = otp.join("");
    if (codeEntered.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setVerifyingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setVerifyingOtp(false);

    if (codeEntered === generatedOtp || codeEntered === "123456") {
      setPhoneStep("verified");
      setOtpError("");
      showToast("Phone number verified successfully!");
    } else {
      setOtpError("Incorrect verification code. Please check and try again.");
    }
  };
  */

  // Final submission: Create Profile & Sync Skills
  const handleFindMatches = async () => {
    // Phone verification is currently disabled — no gate needed

    setSubmitting(true);

    // Read stored onboarding data
    let learnSkills: string[] = [];
    let teachSkills: string[] = [];
    let schedule: Schedule[] = [];

    try {
      const rawLearn = localStorage.getItem("onboarding_learnSkills");
      if (rawLearn) learnSkills = JSON.parse(rawLearn) as string[];
    } catch {
      // ignore
    }

    try {
      const rawTeach = localStorage.getItem("onboarding_teachSkills");
      if (rawTeach) teachSkills = JSON.parse(rawTeach) as string[];
    } catch {
      // ignore
    }

    try {
      const rawAvail = localStorage.getItem("userAvailability");
      if (rawAvail) {
        const avail = JSON.parse(rawAvail) as {
          days: string[];
          timeRanges: Record<string, { start: string; end: string }>;
        };
        schedule = avail.days.map((day) => ({
          day,
          startTime: avail.timeRanges?.[day]?.start || "",
          endTime: avail.timeRanges?.[day]?.end || "",
        }));
      }
    } catch {
      // ignore
    }

    const payload = {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      teachSkills,
      learnSkills,
      schedule,
      phoneNumber: phoneNumber.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    };

    const result = await createProfile(payload);

    if (!result.success) {
      showToast(result.message ?? "Profile creation failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (teachSkills.length > 0) {
      await syncSkillListings(teachSkills);
    }

    // Clean up temporary onboarding storage
    localStorage.removeItem("onboarding_learnSkills");
    localStorage.removeItem("onboarding_teachSkills");
    localStorage.removeItem("userAvailability");

    setSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/explore");
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-6 overflow-x-hidden overflow-y-auto select-none">
      {/* Background Animated Tech Icons */}
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

      {/* Header */}
      <div className="w-full max-w-107.5 mx-auto pt-6 text-center z-10">
        <h1 className="text-4xl font-extrabold text-sky-500 tracking-tight mb-2">
          Set up your Profile
        </h1>
      </div>

      {/* Body Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center my-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column Image (matching other onboarding steps) */}
          <div className="hidden lg:flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-[40px] shadow-2xl">
              <Image
                src="/hero_collaboration.png"
                alt="SkilLoop Collaboration"
                fill
                priority
                quality={95}
                className="object-cover object-center select-none"
              />
            </div>
          </div>

          {/* Right Column Form */}
          <div className="w-full space-y-6 order-1 lg:order-2">
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Profile Photo & Phone
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Add a picture and your phone number to complete setup.
              </p>
            </div>

            {/* Profile Picture Card */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative h-28 w-28 shrink-0">
                {avatarUrl ? (
                  <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-sky-400 bg-slate-100 shadow-md">
                    <Image
                      src={avatarUrl}
                      alt="Profile preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-full bg-linear-to-br from-sky-400 to-blue-500 flex items-center justify-center border-4 border-slate-100 shadow-inner">
                    <span className="text-4xl font-extrabold text-white">
                      {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                      {user?.lastName?.[0]?.toUpperCase() ?? ""}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white ring-4 ring-white hover:bg-sky-600 transition-colors shadow-md"
                  aria-label="Upload photo"
                >
                  <Camera className="h-4 w-4" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Profile Picture</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Upload a photo so exchange partners can recognize you. JPG, PNG or WebP up to 5MB.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-sky-500 px-3.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    {avatarUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Number Card */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-sky-500" />
                  Phone Number <span className="text-red-500">*</span>
                </h3>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-3 pt-1">
                <label className="block">
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+234"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                    />
                  </div>
                </label>
                {phoneNumber.trim() !== "" && !isPhoneValid && (
                  <p className="mt-1 text-sm text-red-500">
                    Please enter a valid Nigerian phone number.
                  </p>
                )}

                {/* Send Verification Code button — commented out
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !phoneNumber.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
                */}
              </div>

              {/* OTP and verification flow — commented out
              <div className="space-y-4 pt-1">
                ... OTP verification UI
              </div>
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Find Matches (Complete Profile) Button & Info Banner */}
      <div className="w-full max-w-107.5 mx-auto z-10 flex flex-col gap-4">
        {/* Info Banner matching user specification */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-sky-400 bg-sky-100/70 px-4.5 py-3.5 shadow-xs">
          <AlertCircle className="h-6 w-6 text-sky-500 shrink-0" strokeWidth={2} />
          <p className="text-sm sm:text-[15px] font-normal text-slate-900 leading-snug">
            Upload your profile picture and phone number to complete your setup.
          </p>
        </div>

        {/* <button
          type="button"
          onClick={handleFindMatches}
          className="w-full text-center text-sm font-medium text-slate-700 hover:text-sky-500 transition-colors py-1"
        >
          Maybe Later? <span className="text-sky-700">Skip</span> 
        </button> */}

        <button
          type="button"
          onClick={handleFindMatches}
          disabled={
            submitting ||
            profileLoading ||
            !phoneNumber.trim() ||
            !isPhoneValid

          }
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-98 transition-all text-base text-center flex items-center justify-center gap-2"
        >
          {submitting || profileLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Completing Profile...
            </>
          ) : (
            "Find Matches"
          )}
        </button>
      </div>

      {/* Profile Complete Full-Screen Celebration Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
          >
            {/* Background floating icons */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {bgIcons.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="absolute text-sky-200/60 animate-pulse"
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

            {/* Celebration center content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                  delay: 0.1,
                }}
                className="w-36 h-36 rounded-full bg-sky-500 shadow-2xl shadow-sky-300/50 flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 52 52"
                  className="w-20 h-20"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="10,28 21,39 42,16" />
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-extrabold text-slate-900">
                  You are all set&nbsp;🎉
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Find the best matches for you.
                </p>
              </motion.div>
            </div>

            {/* Go to Discover button */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="relative z-10 w-full max-w-107.5 mx-auto px-6 pb-10"
            >
              <button
                type="button"
                onClick={() => router.push("/explore")}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-full shadow-xl shadow-sky-400/30 active:scale-98 transition-all text-base"
              >
                Go to Discover
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toastElement}
    </div>
  );
}

