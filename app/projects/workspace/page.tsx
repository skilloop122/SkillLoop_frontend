"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CheckSquare,
    Paperclip,
    Clock,
    Square,
    Tag,
} from "lucide-react";
import Image from "next/image";

const tasks = [
    "Set up project structure",
    "Build homepage layout",
    "Implement responsive design",
    "Add project showcase section",
    "Optimize performance",
    "Submit for review",
];

export default function ProjectWorkspacePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCompleted = searchParams.get("status") === "completed";

    const [completed, setCompleted] = useState(initialCompleted);
    const [dueDateCompleted, setDueDateCompleted] = useState(completed);
    const [checkedTasks, setCheckedTasks] = useState<string[]>(
        initialCompleted ? tasks : []
    );

    const statusLabel = completed ? "Completed" : "In Progress";

    const allTasksDone = useMemo(
        () => checkedTasks.length === tasks.length,
        [checkedTasks]
    );

    const toggleTask = (task: string) => {
        if (completed) return;

        setCheckedTasks((current) =>
            current.includes(task)
                ? current.filter((item) => item !== task)
                : [...current, task]
        );
    };

    const handleSubmit = () => {
        if (!dueDateCompleted) return;

        const completedProject = {
            id: "completed-frontend-website",
            title: "Frontend Project",
            description: "Code a desktop landing.....",
            skills: ["Frontend", "Web Dev"],
            collaborators: "4/5 Collaborators",
            role: "Frontend Dev",
            status: "Completed",
            image: "/james_klin.png",
        };

        const existing = JSON.parse(
            localStorage.getItem("completedProjects") || "[]"
        );

        const alreadyExists = existing.some(
            (project: { id: string }) => project.id === completedProject.id
        );

        if (!alreadyExists) {
            localStorage.setItem(
                "completedProjects",
                JSON.stringify([...existing, completedProject])
            );
        }

        router.push("/projects/completed");
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <div className="w-full max-w-md mx-auto px-5 pt-24 pb-10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-5 flex h-9 w-11 items-center justify-center rounded-[4px] border border-[#0ea5e9] bg-sky-50 text-black"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" strokeWidth={1.8} />
                </button>

                <h1 className="mb-4 text-[32px] font-medium leading-tight">
                    Workspace
                </h1>

                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-[26px] font-normal">Frontend Website</h2>

                    <div className="flex items-center gap-2 shrink-0">
                        <Tag className="h-5 w-5 fill-[#fb9f45] text-[#fb9f45]" />
                        <span
                            className={`rounded-[4px] px-2 py-1 text-[14px] ${completed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#e8dfd7] text-slate-700"
                                }`}
                        >
                            {statusLabel}
                        </span>
                    </div>
                </div>

                <p className="mb-9 text-[17px] leading-snug">
                    Build a modern, aesthetic and user-friendly website for a hair vendor
                    to showcase different products and offerings of the brand including
                    their contact information
                </p>

                <h2 className="mb-4 text-[25px] font-normal">Quick Action</h2>

                <div className="mb-9 grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-[8px] bg-lime-100 px-3 py-3 text-[17px]"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-white">
                            <CheckSquare className="h-6 w-6" />
                        </span>
                        Add Checklist
                    </button>

                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-[8px] bg-sky-100 px-3 py-3 text-[17px]"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-white">
                            <Paperclip className="h-6 w-6" />
                        </span>
                        Add File
                    </button>
                </div>

                <h2 className="mb-4 text-[25px] font-normal">Project Timeline</h2>

                <div className="mb-8 space-y-3">
                    <div className="flex items-center gap-3 rounded-[8px] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
                        <Clock className="h-7 w-7 text-black" />
                        <span className="text-[16px]">Starts 8th May, at 10:00 PM</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => !completed && setDueDateCompleted((current) => !current)}
                        className="flex w-full items-center gap-3 rounded-[8px] bg-white px-5 py-5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
                    >
                        <span
                            className={`h-7 w-7 rounded-[4px] border-2 ${dueDateCompleted
                                ? "border-[#0ea5e9] bg-[#0ea5e9]"
                                : "border-sky-300 bg-white"
                                }`}
                        />
                        <span className="text-[16px]">Due on 16th May, at 04:00 PM</span>
                    </button>
                </div>

                <div className="mb-8">
                    <div className="relative mb-4">
                        <h2 className="text-[25px] font-normal">Your Role</h2>
                        {!completed && (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!dueDateCompleted}
                                className="absolute right-0 top-0 w-[205px] rounded-[18px] bg-[#0ea5e9] py-3 text-[16px] font-medium text-white disabled:opacity-40"
                            >
                                Submit
                            </button>
                        )}
                    </div>

                    <span className="rounded-[4px] bg-[#ccebf8] px-2 py-1 text-[16px]">
                        Frontend Developer
                    </span>

                    <p className="mt-4 text-[17px] leading-snug">
                        Responsible for translating UI designs into code, ensuring
                        responsiveness and core interactive features.
                    </p>
                </div>

                <section className="mb-9">
                    <h2 className="mb-4 text-[25px] font-normal">Your Tasks</h2>

                    <div className="space-y-2">
                        {tasks.map((task) => {
                            const isChecked = checkedTasks.includes(task);

                            return (
                                <button
                                    key={task}
                                    type="button"
                                    onClick={() => toggleTask(task)}
                                    className="flex items-center gap-2 text-left text-[16px]"
                                >
                                    <span
                                        className={`h-5 w-5 rounded-[3px] border-2 ${isChecked
                                            ? "border-[#0ea5e9] bg-[#0ea5e9]"
                                            : "border-sky-300 bg-white"
                                            }`}
                                    />
                                    <span className={completed ? "text-slate-500" : "text-black"}>
                                        {task}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mb-9">
                    <h2 className="mb-3 text-[25px] font-normal">Instructions</h2>
                    <ul className="list-disc space-y-1 pl-6 text-[16px] leading-snug">
                        <li>Follow the provided Figma design system</li>
                        <li>Use Grid for the layout</li>
                        <li>Maintain consistent spacing and typography</li>
                        <li>Test responsiveness across mobile and tablet screens</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-[25px] font-normal">Team Members</h2>

                    <div className="flex -space-x-1">
                        {[
                            "/james_klin.png",
                            "/hero_collaboration.png",
                            "/james_klin.png",
                            "/hero_collaboration.png",
                        ].map((src, index) => (
                            <div
                                key={`${src}-${index}`}
                                className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-slate-200"
                            >
                                <Image
                                    src={src}
                                    alt={`Team member ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}