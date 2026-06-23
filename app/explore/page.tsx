"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Star, ChevronDown, Loader2 } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfileStore } from "../../lib/profileStore";
import { useAuthStore } from "../../lib/authStore";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const router = useRouter();
  
  const { matches, loading, error, fetchMatches, profile, fetchProfile } = useProfileStore();
  const { hydrated, token } = useAuthStore();

  useEffect(() => {
    if (hydrated && token) {
      if (!profile) fetchProfile();
      fetchMatches("20", selectedSkillId);
    }
  }, [hydrated, token, selectedSkillId, fetchMatches, profile, fetchProfile]);

  const handleSkillChange = (e: React.ChangeEvent < HTMLSelectElement >) => {
    const val = e.target.value;
    setSelectedSkillId(val === "all" ? "" : val);
  };

  const filteredMatches = matches.filter(m => 
    (m.firstName + " " + m.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans flex text-black">
      <SideNav />
      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-6 pt-12 md:pt-16">
          <div className="mb-10 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold text-black mb-2 tracking-tight">Explore</h1>
            <p className="text-[15px] md:text-lg text-black/80 font-medium">
              Find people to learn from and teach based on your skills.
            </p>
          </div>

          <div className="relative w-full mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-black" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#0ea5e9] rounded-2xl text-[15px] outline-none placeholder:text-slate-400 font-medium shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-10 md:mt-12">
            <span className="text-[15px] md:text-lg font-semibold text-black">
              {filteredMatches.length} Matches Found
            </span>
            <div className="relative self-start md:self-auto">
              <select 
                value={selectedSkillId || "all"}
                onChange={handleSkillChange}
                className="appearance-none bg-white border border-[#0ea5e9] text-black text-[15px] font-medium py-2 pl-4 pr-10 rounded-[6px] outline-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="all">All My Learning Goals</option>
                {profile?.learnSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-black" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#0ea5e9]" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button 
                onClick={() => fetchMatches("20", selectedSkillId)}
                className="px-6 py-2 bg-[#0ea5e9] text-white rounded-lg font-bold"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white border border-slate-200 rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative w-[52px] h-[52px] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <Image
                        src="/james_klin.png"
                        alt={match.firstName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-black truncate leading-tight">
                          {match.firstName} {match.lastName}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-black">
                            4.7
                          </span>
                        </div>
                      </div>
                      <p className="text-[14px] text-black mt-0.5 truncate">
                        {match.bio || "No bio available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 mt-1">
                    <div className="flex-1 min-w-0 flex flex-col gap-3">
                      <div>
                        <span className="inline-block bg-[#e0f2fe] text-[#0ea5e9] text-[13px] font-medium px-2.5 py-0.5 rounded-[4px] mb-1">
                          Teaches
                        </span>
                        <p className="text-[14px] font-medium text-black truncate">
                          {match.teachSkills.map(s => s.name).join(", ")}
                        </p>
                      </div>

                      <div>
                        <span className="inline-block bg-[#dcfce7] text-[#22c55e] text-[13px] font-medium px-2.5 py-0.5 rounded-[4px] mb-1">
                          Learning
                    </span>
                        <p className="text-[14px] font-medium text-black truncate">
                          {match.learnSkills.map(s => s.name).join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-[140px] shrink-0">
                      <Link href={"/explore/request?id=" + match.id} className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-1.5 rounded-[6px] text-sm transition-colors text-center inline-block">
                        Request Session
                      </Link>
                      <button 
                        type="button"
                        onClick={() => router.push("/profile/view?id=" + match.id)} 
                        className="w-full bg-white border border-[#0ea5e9] text-black font-medium py-1.5 rounded-[6px] text-sm hover:bg-slate-50 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredMatches.length === 0 && !error && (
            <div className="text-center py-20 text-slate-500 font-medium">
              No matches found. Try updating your skills!
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
