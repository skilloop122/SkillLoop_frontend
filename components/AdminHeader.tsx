"use client";

import React from "react";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminSidebarStore } from "@/lib/adminSidebarStore";

interface AdminHeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, children }: AdminHeaderProps) {
  const admin = useAdminAuthStore((s) => s.admin);
  const { isOpen, toggle } = useAdminSidebarStore();

  return (
    <div className="mb-10 space-y-4">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-lg bg-white p-2 shadow"
            aria-label="Toggle admin navigation"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
          <Image
            src="/images/SkilLoop.png"
            alt="SkilLoop"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold tracking-tight text-sky-500">
            Skil<span className="text-slate-900">Loop</span>
          </span>
        </div>

        <div className="w-11 h-11 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">
          <Image
            src="/images/ebony.jpg"
            alt="Admin"
            width={44}
            height={44}
            className="w-full h-full object-cover"
            onError={() => {}}
          />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search
            size={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search for users, skills......."
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center justify-end gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">
              <Image
                src="/images/ebony.jpg"
                alt="Admin"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={() => {}}
              />
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-3xl tracking-tight truncate">
                Welcome,{" "}
                {admin?.firstName
                  ? `${admin.firstName} ${admin.lastName || ""}`
                  : "Admin"}
              </h1>
              <p className="text-gray-500 text-sm truncate">
                {admin?.email || "Platform Admin"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="relative w-full md:hidden">
        <Search
          size={22}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search for users, skills......."
          className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Page title + actions */}
      {(title || subtitle || children) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && (typeof title === "string" ? (
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">{title}</h1>
            ))}
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          {children && <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>}
        </div>
      )}
    </div>
  );
}
