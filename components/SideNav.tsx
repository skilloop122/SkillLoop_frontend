"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, CalendarDays, Folder, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "../lib/authStore";
import { useProfileStore } from "../lib/profileStore";
import { UserAvatar } from "./UserAvatar";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (token && !profile) {
      fetchProfile();
    }
  }, [token, profile, fetchProfile]);

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Sessions", href: "/sessions", icon: CalendarDays },
    { name: "Projects", href: "/projects", icon: Folder },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 py-8 px-4">
      <div className="flex items-center gap-2 px-4 mb-12">
        <Image src="/images/SkilLoop.png" alt="Logo" width={30} height={30} />
        {/* <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-sky-400 to-blue-600 flex items-center justify-between p-1.5 shadow-md">
          <div className="w-2 h-5 bg-white rounded-full" />
          <div className="w-2 h-3.5 bg-white/70 rounded-full" />
        </div> */}
        <Link href="/landing" className="text-xl font-extrabold tracking-tight text-slate-900">
          Skil<span className="text-sky-500">Loop</span>
        </Link>
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
                  ? "bg-sky-50 text-sky-500"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-sky-500 stroke-[2.5]"
                    : "text-slate-400 stroke-2 group-hover:text-slate-600"
                }`}
              />
              <span
                className={`text-[15px] font-semibold transition-colors ${
                  isActive ? "text-sky-500" : ""
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Snippet */}
      <div className="mt-auto px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar
            avatarUrl={profile?.avatarUrl}
            firstName={user?.firstName}
            lastName={user?.lastName}
            className="w-10 h-10 rounded-full text-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.firstName ?? "User"}
            </p>
            <p className="text-xs font-medium text-slate-500 truncate">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/signin");
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-red-400 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
