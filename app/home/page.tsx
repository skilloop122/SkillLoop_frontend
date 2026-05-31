"use client";

import React from "react";
import Image from "next/image";
import { Bell, Settings, Calendar, FileText, Star, Clock } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans flex">
      <SideNav />
      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-10 md:pt-16">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 ">
            <h1 className="text-3xl font-semibold text-black tracking-tight">
              Hello, Blessing
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer">
                <Bell className="w-6 h-6 text-[#0ea5e9]" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0ea5e9] text-[10px] font-bold text-white border border-white">
                  2
                </span>
              </div>
              <button className="cursor-pointer">
                <Settings className="w-6 h-6 text-[#0ea5e9]" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Dashboard Summary Card */}
          <div className="bg-linear-to-br from-[#2dbcf8] to-[#60cbf9] rounded-[16px] p-5 shadow-sm text-white mb-10">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg font-medium leading-snug max-w-[180px]">
                What are you learning or teaching today?
              </h2>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 border border-white/40 rounded-full px-2.5 py-1 mb-1 bg-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-white">4.7 Rating</span>
                </div>
                <span className="text-[12px] text-white/80 font-medium px-1">
                  122 Reviews
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Upcoming Session Box */}
              <div className="bg-white/20 border border-white/30 rounded-[8px] p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1.5 text-white/90">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Session</span>
                </div>
                <span className="text-xl font-bold leading-tight">2</span>
                <span className="text-[11px] font-medium text-white/90">Upcoming</span>
              </div>
              
              {/* Request Pending Box */}
              <div className="bg-white/20 border border-white/30 rounded-[8px] p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1.5 text-white/90">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-semibold">Request</span>
                </div>
                <span className="text-xl font-bold leading-tight">3</span>
                <span className="text-[11px] font-medium text-white/90">Pending</span>
              </div>

              {/* Skill Points Box */}
              <div className="bg-white rounded-[12px] p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-slate-800">150</span>
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-slate-800 mb-1.5">
                  Skill Points
                </span>
                <Link href="/home/history" className="text-[11px] font-semibold text-[#0ea5e9] hover:underline">
                  View History
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions Section */}
          <div className="mb-10">
            <h2 className="text-[22px] font-medium text-black mb-4 tracking-tight">
              Upcoming Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* Session Card 1 */}
              <div className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100">
                    <Image src="/james_klin.png" alt="Sander James" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[11px] font-semibold px-2 py-0.5 rounded-[4px]">
                        Teaching
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-semibold text-black">3.8</span>
                        <span className="text-[13px] font-medium text-slate-500">(72)</span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-black leading-snug">
                      UI/UX Design
                    </h3>
                    <p className="text-[15px] text-black/80 mt-0.5">
                      to Sander James
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Today, 9:00AM</span>
                  </div>
                  <button className="bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 px-4 rounded-[6px] text-sm transition-colors">
                    Join Session
                  </button>
                </div>
              </div>

              {/* Session Card 2 */}
              <div className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100">
                    <Image src="/james_klin.png" alt="Sam fetch" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-block bg-[#dcfce7] text-[#22c55e] text-[11px] font-semibold px-2 py-0.5 rounded-[4px]">
                        Learning
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-semibold text-black">3.8</span>
                        <span className="text-[13px] font-medium text-slate-500">(72)</span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-black leading-snug">
                      Web Development
                    </h3>
                    <p className="text-[15px] text-black/80 mt-0.5">
                      with Sam fetch
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Today, 2:00PM</span>
                  </div>
                  <button className="bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 px-4 rounded-[6px] text-sm transition-colors">
                    Join Session
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Recent Request Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-medium text-black tracking-tight">
                Recent Request
              </h2>
              <button className="text-[13px] font-medium text-black hover:underline">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* Request Card 1 */}
              <div className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100">
                    <Image src="/james_klin.png" alt="Sander James" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[11px] font-semibold px-2 py-0.5 rounded-[4px]">
                        Teaching
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-semibold text-black">3.8</span>
                        <span className="text-[13px] font-medium text-slate-500">(72)</span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-black leading-snug">
                      UI/UX Design
                    </h3>
                    <p className="text-[15px] text-black/80 mt-0.5">
                      to Sander James
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 px-6 rounded-[6px] text-sm transition-colors">
                    Accept
                  </button>
                  <button className="bg-white border border-[#0ea5e9] text-black font-medium py-1.5 px-6 rounded-[6px] text-sm hover:bg-slate-50 transition-colors">
                    Decline
                  </button>
                </div>
              </div>

              {/* Request Card 2 */}
              <div className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100">
                    <Image src="/james_klin.png" alt="Sander James" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[11px] font-semibold px-2 py-0.5 rounded-[4px]">
                        Teaching
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-semibold text-black">3.8</span>
                        <span className="text-[13px] font-medium text-slate-500">(72)</span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-black leading-snug">
                      UI/UX Design
                    </h3>
                    <p className="text-[15px] text-black/80 mt-0.5">
                      to Sander James
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 px-6 rounded-[6px] text-sm transition-colors">
                    Accept
                  </button>
                  <button className="bg-white border border-[#0ea5e9] text-black font-medium py-1.5 px-6 rounded-[6px] text-sm hover:bg-slate-50 transition-colors">
                    Decline
                  </button>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
