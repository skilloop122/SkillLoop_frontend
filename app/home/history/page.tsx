"use client";

import React from "react";
import { ArrowLeft, Star, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { SideNav } from "../../../components/SideNav";

export default function HistoryPage() {
  const router = useRouter();

  const historyItems = [
    { id: 1, title: "3-Days Streak reward", date: "Today, 8: 47am", amount: "+ 10", total: 82, positive: true },
    { id: 2, title: "Feedback Reward", date: "March 2, 2026", amount: "+ 2", total: 72, positive: true },
    { id: 3, title: "Learned from Sasha Nen", date: "March 2, 2026", amount: "+ 10", total: 70, positive: true },
    { id: 4, title: "Session with Sasha Nen", date: "March 2, 2026", amount: "- 20", total: 60, positive: false },
    { id: 5, title: "⭐ 4.1Rating from Sarah", date: "March 2, 2026", amount: "+ 10", total: 80, positive: true },
    { id: 6, title: "Session with Sarah Leo", date: "March 2, 2026", amount: "+ 20", total: 70, positive: true },
    { id: 7, title: "Sign Up Bonus", date: "March 1, 2026", amount: "+ 50", total: 50, positive: true },
  ];

  return (
    <div className="min-h-screen bg-white font-sans pb-10 flex">
      <SideNav />
      <div className="flex-1 w-full md:ml-64">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-12 md:pt-16">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-10 h-10 border border-[#0ea5e9] rounded-[4px] flex items-center justify-center mb-6 hover:bg-sky-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={1.5} />
        </button>

        {/* Available Points Card */}
        <div className="bg-linear-to-br from-[#2dbcf8] to-[#60cbf9] rounded-[16px] p-6 shadow-sm mb-8 text-white relative overflow-hidden">
          <h2 className="text-[20px] font-semibold mb-2">Available Points</h2>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[48px] font-semibold leading-tight tracking-tight">150</span>
              <Star className="w-10 h-10 fill-amber-400 text-amber-400 mb-2" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="bg-white/40 backdrop-blur-md rounded-[6px] px-3 py-1 flex flex-col items-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/20">
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-bold text-black">+10</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-[10px] font-medium text-black/80">Rating</span>
              </div>
              <div className="bg-white/40 backdrop-blur-md rounded-[6px] px-3 py-1 flex flex-col items-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/20">
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-bold text-black">+20</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-[10px] font-medium text-black/80">Session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Your Activity */}
        <div className="mb-8">
          <h2 className="text-[22px] font-medium text-black mb-4">Your Activity</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0ea5e9] rounded-[8px] p-3 flex flex-col items-center justify-center text-center text-white h-[90px]">
              <span className="text-[15px] font-medium">5 days</span>
              <span className="text-[12px] font-normal mt-1 opacity-90">Streak</span>
            </div>
            <div className="bg-[#0ea5e9] rounded-[8px] p-3 flex flex-col items-center justify-center text-center text-white h-[90px]">
              <span className="text-[15px] font-medium">3</span>
              <span className="text-[12px] font-normal mt-1 opacity-90 leading-tight">Skills Learned</span>
            </div>
            <div className="bg-[#0ea5e9] rounded-[8px] p-3 flex flex-col items-center justify-center text-center text-white h-[90px]">
              <span className="text-[15px] font-medium">6</span>
              <span className="text-[12px] font-normal mt-1 opacity-90 leading-tight">Sessions Done</span>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-[#0ea5e9] rounded-[12px] p-5 mb-10 text-white flex flex-col items-center text-center">
          <h3 className="text-[16px] font-medium leading-snug mb-3 w-[85%] mx-auto">
            Share SkilLoop with friends & family and earn rewards.
          </h3>
          <div className="bg-white text-black px-4 py-1.5 rounded-[4px] flex items-center gap-1 mb-2 shadow-sm font-semibold text-[15px]">
            +20 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <p className="text-[13px] font-medium mb-3">Share invitation code</p>
          <div className="flex w-full">
            <input 
              type="text" 
              readOnly 
              value="gdhshwshhsjbjbjbbjhbsjs" 
              className="bg-white text-slate-500 text-[13px] px-3 py-2.5 rounded-l-[4px] flex-1 outline-hidden"
            />
            <button className="bg-white/20 text-white text-[13px] font-medium px-4 py-2.5 rounded-r-[4px] flex items-center border-l border-white/10">
              Copy Link
            </button>
          </div>
        </div>

        {/* Skill points History */}
        <div>
          <h2 className="text-[22px] font-medium text-black mb-6">Skill points History</h2>
          <div className="flex flex-col gap-6">
            {historyItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-black mb-0.5">{item.title}</span>
                  <span className="text-[13px] text-slate-400">{item.date}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[15px] font-medium ${item.positive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                    {item.amount}
                  </span>
                  <span className="text-[13px] text-slate-400 mt-0.5">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
