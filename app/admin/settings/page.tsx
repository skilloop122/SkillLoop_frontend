"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Loader2,
  User,
  ShieldCheck,
  Bell,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";

type SettingsTab = "profile" | "security" | "notifications";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { token, admin, hydrated, loading: authLoading, logout } = useAdminAuthStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form state — seeded from admin once hydration completes.
  // No sync effect needed: the loading guard below ensures admin is
  // available before the form ever renders.
  const [firstName, setFirstName] = useState(admin?.firstName ?? "");
  const [lastName, setLastName] = useState(admin?.lastName ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");

  // Notification toggles
  const [notifNewUser, setNotifNewUser] = useState(true);
  const [notifSession, setNotifSession] = useState(true);
  const [notifFeedback, setNotifFeedback] = useState(false);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  const tabs: { key: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "security", label: "Security", icon: ShieldCheck },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">

          <AdminHeader
            title={<><Settings size={28} className="text-sky-500" /> Settings</>}
            subtitle="Manage your admin account and preferences"
          />

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar tabs */}
            <div className="md:w-56 shrink-0">
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors border-b last:border-0 ${
                        isActive
                          ? "bg-sky-50 text-sky-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-sky-500" : "text-gray-400"} />
                        {tab.label}
                      </div>
                      <ChevronRight size={15} className={isActive ? "text-sky-400" : "text-gray-300"} />
                    </button>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>

              {/* Admin info card */}
              <div className="mt-4 bg-white border rounded-2xl p-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-sky-600 font-bold text-xl">
                    {(admin?.firstName?.[0] ?? admin?.email?.[0] ?? "A").toUpperCase()}
                  </span>
                </div>
                <p className="text-center font-semibold text-sm text-gray-900">
                  {admin?.firstName
                    ? `${admin.firstName} ${admin.lastName ?? ""}`
                    : "Admin"}
                </p>
                <p className="text-center text-xs text-gray-400 mt-0.5 truncate">{admin?.email}</p>
                <div className="mt-3 flex justify-center">
                  <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-xs font-semibold">
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Content panel */}
            <div className="flex-1 min-w-0">
              {activeTab === "profile" && (
                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-lg mb-1">Profile Information</h2>
                  <p className="text-sm text-gray-500 mb-6">Update your admin display name and contact details</p>

                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                        placeholder="Email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                      <input
                        type="text"
                        value="Administrator"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Save size={16} />
                        {saved ? "Saved!" : "Save Changes"}
                      </button>
                      {saved && (
                        <span className="text-green-600 text-sm font-medium animate-pulse">
                          ✓ Profile updated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-lg mb-1">Security</h2>
                  <p className="text-sm text-gray-500 mb-6">Manage your password and account security</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm pr-12"
                          placeholder="Enter current password"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
                        <ShieldCheck size={16} />
                        Password requirements
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-amber-600 list-disc list-inside">
                        <li>Minimum 8 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number or symbol</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Save size={16} />
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-lg mb-1">Notifications</h2>
                  <p className="text-sm text-gray-500 mb-6">Choose which events you want to be notified about</p>

                  <div className="space-y-0 divide-y divide-gray-100">
                    {[
                      {
                        label: "New User Registrations",
                        desc: "Get notified when a new user signs up",
                        value: notifNewUser,
                        set: setNotifNewUser,
                      },
                      {
                        label: "Session Updates",
                        desc: "Get notified when sessions are created or completed",
                        value: notifSession,
                        set: setNotifSession,
                      },
                      {
                        label: "Feedback Received",
                        desc: "Get notified when users leave feedback",
                        value: notifFeedback,
                        set: setNotifFeedback,
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => item.set(!item.value)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            item.value ? "bg-sky-500" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              item.value ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Save size={16} />
                      {saved ? "Saved!" : "Save Preferences"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
