"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Star, ChevronDown } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProfileMatch = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  experience: string;
  rating: number;
  reviews: number;
  teaches: string[];
  learning: string[];
};

const mockMatches: ProfileMatch[] = [
  {
    id: "1",
    name: "Jackman Anthor",
    avatar: "/james_klin.png",
    role: "Web Developer",
    experience: "2 years",
    rating: 4.7,
    reviews: 122,
    teaches: ["Frontend", "Web Development"],
    learning: ["UI/UX Design", "Figma"],
  },
  {
    id: "2",
    name: "Sarah lenten",
    avatar: "/james_klin.png",
    role: "Web Developer",
    experience: "2 years",
    rating: 4.7,
    reviews: 122,
    teaches: ["Web Development"],
    learning: ["UI/UX Design"],
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
      const router = useRouter();
  

  return (
    <div className="min-h-screen bg-white font-sans flex">
      <SideNav />
      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-6 pt-12 md:pt-16">
          {/* Header Title */}
          <div className="mb-10 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold text-black mb-2 tracking-tight">Explore</h1>
            <p className="text-[15px] md:text-lg text-black/80 font-medium">
              Find people to learn from and teach.
            </p>
          </div>

          {/* Search Bar */}
        <div className="relative w-full mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-black" strokeWidth={2} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Skills, Mentors......."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#0ea5e9] rounded-2xl text-[15px] outline-hidden placeholder:text-slate-400 font-medium shadow-sm"
          />
        </div>

        {/* Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-10 md:mt-12">
          <span className="text-[15px] md:text-lg font-semibold text-black">
            12 Matches Found
          </span>
          <div className="relative self-start md:self-auto">
            <select className="appearance-none bg-white border border-[#0ea5e9] text-black text-[15px] font-medium py-2 pl-4 pr-10 rounded-[6px] outline-hidden shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <option>All Skills</option>
              <option>Frontend</option>
              <option>Design</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-black" />
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMatches.map((match) => (
            <div
              key={match.id}
              className="bg-white border border-slate-200 rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Profile Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="relative w-[52px] h-[52px] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src={match.avatar}
                    alt={match.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-black truncate leading-tight">
                      {match.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-black">
                        {match.rating}
                      </span>
                      <span className="text-sm font-medium text-slate-500">
                        ({match.reviews})
                      </span>
                    </div>
                  </div>
                  <p className="text-[14px] text-black mt-0.5">
                    {match.role} • {match.experience}
                  </p>
                </div>
              </div>

              {/* Details & Actions Row */}
              <div className="flex items-end justify-between gap-4 mt-1">
                {/* Left: Skills */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  {/* Teaches */}
                  <div>
                    <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[13px] font-medium px-2.5 py-0.5 rounded-[4px] mb-1">
                      Teaches
                    </span>
                    <p className="text-[14px] font-medium text-black">
                      {match.teaches.join(", ")}
                    </p>
                  </div>

                  {/* Learning */}
                  <div>
                    <span className="inline-block bg-[#dcfce7] text-[#22c55e] text-[13px] font-medium px-2.5 py-0.5 rounded-[4px] mb-1">
                      Learning
                    </span>
                    <p className="text-[14px] font-medium text-black">
                      {match.learning.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 w-[140px] shrink-0">
                  <Link href="/explore/request" className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 rounded-[6px] text-sm transition-colors text-center inline-block">
                    Request Session
                  </Link>
                  <button type="button"
                        onClick={() => router.push("/profile/view")} className="w-full bg-white border border-[#0ea5e9] text-black font-medium py-1.5 rounded-[6px] text-sm hover:bg-slate-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      <BottomNav />
    </div>
  );
}
