"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Users, BookOpen, LogOut, Menu, X, Settings, BarChart3, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useRouter } from "next/navigation";

export function AdminSideNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAdminAuthStore();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Activity },
    { name: "Waitlist", href: "/admin/waitlist", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-60 p-2 bg-white rounded-md shadow-md text-slate-700"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`flex flex-col fixed pt-20 left-0 top-0 bottom-0 w-64 bg-sky-500 border-r border-slate-800 z-50 py-8 px-4 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center gap-2 px-4 mb-12">
          <Image src="/images/SkilLoop.png" alt="Logo" width={30} height={30} />
          <span className="text-3xl font-extrabold tracking-tight text-white">
            Skil<span className="text-sky-900">Loop</span>
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-sky-900 text-white"
                    : "text-white hover:bg-sky-900 hover:text-sky-400"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-sky-400 stroke-[2.5]"
                      : "text-white stroke-2 group-hover:text-slate-200"
                  }`}
                />
                <span
                  className={`text-[15px] font-semibold transition-colors ${
                    isActive ? "text-sky-400" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4">
          <button
            onClick={() => router.push("/admin/settings")}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all group text-white hover:bg-sky-900 hover:text-sky-400"
          >
            <Settings className="w-5 h-5 stroke-2 group-hover:text-sky-400" />
            <span className="text-[15px] font-semibold">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all group text-red-900 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-5 h-5 stroke-2 group-hover:text-red-400" />
            <span className="text-[15px] font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
