"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  HandCoins,
  MessageSquareText,
  HelpCircle,
  LogOut,
  Folder,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminSidebarStore } from "@/lib/adminSidebarStore";

export function AdminSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuthStore();
  const { isOpen, setIsOpen } = useAdminSidebarStore();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "User",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Skills",
      href: "/admin/skills",
      icon: Briefcase,
    },
    {
      name: "Requests",
      href: "/admin/requests",
      icon: HandCoins,
    },
    {
      name: "Feedbacks",
      href: "/admin/feedback",
      icon: MessageSquareText,
    },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: Folder,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-70 md:hidden" />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-80 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex flex-col h-full mt-5">

          {/* Logo */}
          <div className="px-5 pt-8 pb-10">
            <div className="flex items-center gap-3">
              <Image
                src="/images/SkilLoop.png"
                alt="SkillLoop"
                width={44}
                height={44}
              />

              <div>
                <h1 className="text-[20px] font-bold text-sky-500">
                  SkilLoop
                </h1>

                <p className="text-[14px] text-slate-700">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all
                    ${active
                      ? "bg-sky-500 text-white"
                      : "text-sky-500 hover:bg-sky-50"
                    }`}
                >
                  {active && (
                    <span className="absolute -left-4 h-10 w-1 rounded-r-full bg-slate-200" />
                  )}

                  <Icon
                    size={20}
                    className={
                      active ? "text-white" : "text-sky-500"
                    }
                  />

                  <span className="font-medium">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-slate-200 px-4 py-5 space-y-2">

            <button
              onClick={() => router.push("/admin/settings")}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all group text-sky-500 hover:bg-sky-50 hover:text-sky-400"
            >
              <HelpCircle size={20} />
              <span>Help Center</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sky-500 hover:bg-sky-50 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>

          </div>
        </div>
      </aside>
    </>
  );
}