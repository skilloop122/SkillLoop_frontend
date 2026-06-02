"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { SideNav } from "../../components/SideNav";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  image: string;
};

type MyProject = Project & {
  collaborators: string;
  role: string;
  status: "Active" | "Completed";
};

const availableProjects: Project[] = [
  {
    id: "available-1",
    title: "Frontend Project",
    description: "Code a desktop landing.....",
    skills: ["Frontend", "Web Dev"],
    image: "/james_klin.png",
  },
  {
    id: "available-2",
    title: "Frontend Project",
    description: "Code a desktop landing.....",
    skills: ["Frontend", "Web Dev"],
    image: "/james_klin.png",
  },
  {
    id: "available-3",
    title: "Frontend Project",
    description: "Code a desktop landing.....",
    skills: ["Frontend", "Web Dev"],
    image: "/james_klin.png",
  },
];

const myProjects: MyProject[] = [
  {
    id: "my-1",
    title: "Frontend Project",
    description: "Code a desktop landing.....",
    skills: ["Frontend", "Web Dev"],
    collaborators: "4/5 Collaborators",
    role: "Frontend Dev",
    status: "Active",
    image: "/james_klin.png",
  },
  {
    id: "my-2",
    title: "Frontend Project",
    description: "Code a desktop landing.....",
    skills: ["Frontend", "Web Dev"],
    collaborators: "4/5 Collaborators",
    role: "Frontend Dev",
    status: "Active",
    image: "/james_klin.png",
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [progressSlide, setProgressSlide] = useState(0);
  const [myProjectTab, setMyProjectTab] = useState<"Active" | "Completed">(
    "Active"
  );

  const [storedCompletedProjects] = useState<MyProject[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("completedProjects") || "[]");
    } catch {
      return [];
    }
  });

  const activeProjectsCount = myProjects.filter(
    (project) => project.status === "Active"
  ).length;

  const completedProjectsCount = storedCompletedProjects.length;

  const myProjectCounts = {
    Active: activeProjectsCount,
    Completed: completedProjectsCount,
  };

  const filteredMyProjects =
    myProjectTab === "Completed"
      ? storedCompletedProjects
      : myProjects.filter((project) => project.status === "Active");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgressSlide((current) => (current + 1) % 2);
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans flex">
      <SideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12">
        <div className="w-full max-w-md md:max-w-6xl mx-auto px-5 pt-10 md:pt-16">
          <header className="mb-6">
            <h1 className="text-[32px] md:text-4xl font-semibold text-black tracking-tight mb-2">
              Projects
            </h1>
            <p className="text-[15px] text-black leading-snug">
              Explore real world projects and work with others.
            </p>
          </header>

          <section className="mb-9 overflow-hidden rounded-[8px] bg-linear-to-b from-[#0ea5e9] to-[#b8e8fb] px-4 py-7 text-white">
            <div className="relative min-h-[112px]">
              {progressSlide === 0 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-[16px] font-medium mb-3">
                    Projects Progress
                  </h2>

                  <div className="grid grid-cols-3 gap-6">
                    {[
                      [String(activeProjectsCount), "Active Projects"],
                      ["12", "Sessions Done"],
                      [String(completedProjectsCount), "Completed"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="min-h-[72px] rounded-[4px] border border-white/70 bg-white/10 flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-[16px] font-medium">
                          {value}
                        </span>
                        <span className="mt-2 text-[13px] leading-tight">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {progressSlide === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-[24px] font-medium leading-tight mb-2">
                    Session Progress
                  </h2>

                  <div className="mb-2 h-1 rounded-full bg-white/80">
                    <div className="h-full w-2/3 rounded-full bg-slate-500/70" />
                  </div>

                  <p className="text-[22px] font-medium leading-tight mb-3">
                    2/3 Sessions Completed
                  </p>

                  <Link
                    href="/sessions"
                    className="rounded-[4px] bg-[#0ea5e9] px-2 py-1 text-[14px] font-medium text-white"
                  >
                    View Sessions
                  </Link>

                  <p className="mt-3 text-[14px] text-slate-600">
                    Take one more session to be eligible for Projects
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mb-9">
            <h2 className="text-[26px] font-medium text-black mb-3">
              Available Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableProjects.map((project) => (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-[8px] border border-[#bae6fd] bg-white flex"
                >
                  <div className="relative w-[44%] min-h-[160px] shrink-0 bg-slate-100">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 px-3 py-3">
                    <h3 className="text-[18px] font-medium text-black mb-3 leading-tight">
                      {project.title}
                    </h3>

                    <p className="text-[15px] text-black mb-3 truncate">
                      {project.description}
                    </p>

                    <div className="mb-3 flex flex-wrap items-center gap-1 text-[15px] text-black">
                      <span>Skill:</span>
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-[4px] bg-[#ccebf8] px-1.5 py-0.5 text-[14px] text-slate-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mb-2 flex items-center gap-1 text-black">
                      <Users className="h-5 w-5 fill-[#0ea5e9] text-[#0ea5e9]" />
                      <span className="text-[15px]">2 spots left</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/projects/join")}
                      className="rounded-[4px] bg-[#0ea5e9] px-2 py-1 text-[15px] font-medium text-white"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[26px] font-medium text-black mb-3">
              My Projects
            </h2>

            <div className="mb-6 flex gap-2">
              {(["Active", "Completed"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMyProjectTab(tab)}
                  className={`rounded-[4px] px-2.5 py-2 text-[16px] transition-colors ${
                    myProjectTab === tab
                      ? "bg-[#0ea5e9] text-black"
                      : "bg-[#ccebf8] text-black"
                  }`}
                >
                  {tab}
                  <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#bae6fd] px-2 text-[14px]">
                    {myProjectCounts[tab]}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyProjects.map((project) => (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-[8px] border border-[#bae6fd] bg-white flex"
                >
                  <div className="relative w-[44%] min-h-[190px] shrink-0 bg-slate-100">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 px-3 py-3">
                    <h3 className="text-[18px] font-medium text-black mb-3 leading-tight">
                      {project.title}
                    </h3>

                    <p className="text-[15px] text-black mb-3 truncate">
                      {project.description}
                    </p>

                    <div className="mb-3 flex flex-wrap items-center gap-1 text-[15px] text-black">
                      <span>Skill:</span>
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-[4px] bg-[#ccebf8] px-1.5 py-0.5 text-[14px] text-slate-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mb-3 flex items-center gap-1 text-black">
                      <Users className="h-5 w-5 fill-[#0ea5e9] text-[#0ea5e9]" />
                      <span className="text-[15px]">
                        {project.collaborators}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-1 text-[15px] text-black">
                      <span>Your Role:</span>
                      <span className="rounded-[4px] bg-[#ccebf8] px-1.5 py-0.5 text-[14px] text-slate-800">
                        {project.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/projects/workspace?status=${
                            project.status === "Completed"
                              ? "completed"
                              : "in-progress"
                          }`
                        )
                      }
                      className="rounded-[4px] bg-[#0ea5e9] px-2 py-1 text-[15px] font-medium text-white"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              ))}

              {filteredMyProjects.length === 0 && (
                <div className="md:col-span-2 py-16 text-center text-slate-500">
                  No {myProjectTab.toLowerCase()} projects yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}