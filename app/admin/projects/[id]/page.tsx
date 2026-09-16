"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  GitBranch,
  Globe,
  BookOpen,
  MessageSquare,
  Star,
  Paperclip,
  Upload,
  Loader2,
  Pencil,
  Plus,
  X,
  Save,
  Search,
  Award,
} from "lucide-react";
import { useAdminAuthStore } from "@/lib/adminAuthStore";
import { useAdminProjectStore } from "@/lib/adminProjectStore";
import { AdminSideNav } from "@/components/AdminSideNav";
import { AdminHeader } from "@/components/AdminHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/useToast";

type Tab = "overview" | "activity" | "feedback" | "submission";

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  active: { label: "Active", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "In Progress", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
  canceled: { label: "Canceled", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
  pending: { label: "Pending", icon: Clock, cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

function statusInfo(raw?: string) {
  const key = (raw ?? "pending").toLowerCase();
  return STATUS_MAP[key] ?? STATUS_MAP.pending;
}

const DELIVERABLE_ICONS: Record<string, React.ElementType> = {
  figma: FileText,
  github: GitBranch,
  "live-url": Globe,
  "case-study": BookOpen,
};

function deliverableIcon(label: string) {
  return DELIVERABLE_ICONS[label.toLowerCase().replace(/\s+/g, "-")] ?? FileText;
}

const DELIVERABLE_TYPES = [
  { id: "figma", label: "Figma", icon: FileText },
  { id: "github", label: "Github", icon: GitBranch },
  { id: "live-url", label: "Live URL", icon: Globe },
  { id: "case-study", label: "Case Study", icon: BookOpen },
];

interface DeliverableEntry { type: string; value: string; }
interface DeliverableData {
  githubUrl?: string;
  liveUrl?: string;
  note?: string;
  submittedAt?: string;
  entries: DeliverableEntry[];
}

function typeKey(t: string) {
  return t.toLowerCase().replace(/[-\s_]/g, "");
}

const isGitType = (t: string) => ["github", "repo", "repository"].includes(typeKey(t));
const isLiveType = (t: string) => ["liveurl", "live", "website", "app", "demo"].includes(typeKey(t));

function pickString(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function collectEntries(src: unknown): DeliverableEntry[] {
  const out: DeliverableEntry[] = [];
  if (!Array.isArray(src)) return out;
  src.forEach((item: unknown) => {
    if (typeof item === "string") {
      out.push({ type: "", value: item });
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      out.push({
        type: pickString(o.type, o.name, o.title, o.deliverableType),
        value: pickString(o.value, o.url, o.link, o.uri, o.file),
      });
    }
  });
  return out;
}

function buildDeliverableData(
  merged: Record<string, unknown>,
  entriesSrc: unknown,
): DeliverableData {
  const entries = collectEntries(entriesSrc);
  let githubUrl = pickString(merged.githubUrl, merged.github_url);
  let liveUrl = pickString(merged.liveUrl, merged.live_url);
  if (!githubUrl) {
    const hit = entries.find((e) => isGitType(e.type) && e.value);
    if (hit) githubUrl = hit.value;
  }
  if (!liveUrl) {
    const hit = entries.find((e) => isLiveType(e.type) && e.value);
    if (hit) liveUrl = hit.value;
  }
  const otherEntries = entries.filter(
    (e) =>
      e.value &&
      !(isGitType(e.type) && githubUrl) &&
      !(isLiveType(e.type) && liveUrl),
  );
  return {
    githubUrl,
    liveUrl,
    note: pickString(merged.note, merged.notes, merged.submissionNotes, merged.submission_note, merged.comment),
    submittedAt: pickString(merged.submittedAt, merged.submissionDate, merged.createdAt, merged.created_at, merged.submitted_date),
    entries: otherEntries,
  };
}

function normalizeDeliverables(raw: unknown): DeliverableData {
  if (Array.isArray(raw)) {
    return buildDeliverableData({}, raw);
  }

  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const dataField = obj.data;
  if (Array.isArray(dataField)) {
    return buildDeliverableData(obj, dataField);
  }

  const nested = dataField && typeof dataField === "object"
    ? dataField as Record<string, unknown>
    : obj;
  const proj = nested.project && typeof nested.project === "object"
    ? nested.project as Record<string, unknown>
    : null;
  const sub = nested.submission && typeof nested.submission === "object"
    ? nested.submission as Record<string, unknown>
    : null;
  const next = nested.submissions && typeof nested.submissions === "object" && !Array.isArray(nested.submissions)
    ? nested.submissions as Record<string, unknown>
    : null;

  const merged: Record<string, unknown> = {};
  const layers = [obj, nested, next, sub, proj];
  layers.forEach((r) => {
    if (r) Object.assign(merged, r);
  });

  let entriesSrc: unknown = null;
  for (const r of layers) {
    if (!r) continue;
    for (const k of ["deliverables", "deliverableList", "submittedDeliverables", "submissions", "entries"]) {
      if (Array.isArray(r[k])) {
        entriesSrc = r[k];
        break;
      }
    }
    if (entriesSrc) break;
  }

  const arrayScalars: Record<string, unknown> = {};
  if (Array.isArray(entriesSrc)) {
    for (const item of entriesSrc) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const o = item as Record<string, unknown>;
        for (const k of ["githubUrl", "github_url", "liveUrl", "live_url", "notes", "note", "submissionNotes", "submission_note", "submittedAt", "submissionDate", "createdAt", "created_at", "submitted_date", "comment"]) {
          if (o[k] !== undefined && arrayScalars[k] === undefined) arrayScalars[k] = o[k];
        }
      }
    }
  }

  return buildDeliverableData({ ...arrayScalars, ...merged }, entriesSrc ?? []);
}

interface AssignedUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  skill?: string;
}

function normalizeAssignedUser(u: unknown): AssignedUser | null {
  if (!u || typeof u !== "object") return null;
  const o = u as Record<string, unknown>;
  const profile = o.profile && typeof o.profile === "object"
    ? o.profile as Record<string, unknown>
    : null;
  return {
    id: pickString(o.id),
    firstName: pickString(o.firstName, profile?.firstName) || undefined,
    lastName: pickString(o.lastName, profile?.lastName) || undefined,
    name: pickString(o.name) || undefined,
    email: pickString(o.email) || undefined,
    avatarUrl:
      (typeof o.avatarUrl === "string" && o.avatarUrl) ||
      (typeof profile?.avatarUrl === "string" && profile.avatarUrl) ||
      null,
    skill: pickString(o.skill, profile?.skill) || undefined,
  };
}

function assignedUserName(u: AssignedUser): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || "Unknown";
}

function assignedUserKey(u: AssignedUser): string {
  return u.id || u.email || assignedUserName(u);
}

function assignedUsersList(p: Record<string, unknown> | null | undefined): AssignedUser[] {
  const out: AssignedUser[] = [];
  const seen = new Set<string>();
  const add = (u: unknown) => {
    const n = normalizeAssignedUser(u);
    if (!n) return;
    const key = assignedUserKey(n);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(n);
  };

  const arr = Array.isArray(p?.users)
    ? p.users as unknown[]
    : Array.isArray(p?.assignedUsers)
      ? p.assignedUsers as unknown[]
      : [];
  arr.forEach(add);
  add(p?.user ?? p?.assignedUser);
  return out;
}

function renderDeliverableRow(entry: DeliverableEntry) {
  const Icon = deliverableIcon(entry.type);
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-sky-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {entry.type ? entry.type.replace(/-/g, " ") : "Deliverable"}
        </p>
        <p className="text-xs text-gray-500 truncate">{entry.value}</p>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { token, hydrated, loading: authLoading } = useAdminAuthStore();
  const { getProjectById, updateProject, createProject, approveProject, getEligibleUsers, fetchProjectDeliverables, fetchProjectRating, getUserAssignments } = useAdminProjectStore();
  const { toastElement, showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loadingProject, setLoadingProject] = useState(true);
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const [loadingDeliverables, setLoadingDeliverables] = useState(false);
  const [deliverableData, setDeliverableData] = useState<DeliverableData | null>(null);
  const [deliverableError, setDeliverableError] = useState("");

  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingData, setRatingData] = useState<Record<string, unknown> | null>(null);
  const [ratingError, setRatingError] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editStartDate, setEditStartDate] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editPoints, setEditPoints] = useState(0);
  const [editTasks, setEditTasks] = useState<string[]>([]);
  const [editDeliverables, setEditDeliverables] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState("");

  // User re-assignment state
  interface EligibleUser { id: string; firstName?: string; lastName?: string; email?: string; avatarUrl?: string | null; }
  const [editUsers, setEditUsers] = useState<EligibleUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<EligibleUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userFullName = (u: EligibleUser) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown";

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!token || !projectId) return;
    let cancelled = false;
    (async () => {
      setLoadingProject(true);
      const result = await getProjectById(token, projectId);
      if (cancelled) return;
      if (result.success && result.data) {
        const raw = result.data;
        const p: Record<string, unknown> =
          (raw.project ?? raw.data ?? (typeof raw === "object" && raw !== null ? raw : {})) as Record<string, unknown>;
        setProject(p);
      } else {
        showToast(result.message || "Failed to load project");
      }
      setLoadingProject(false);
    })();
    return () => { cancelled = true; };
  }, [token, projectId, getProjectById, showToast]);

  useEffect(() => {
    if (!token || !projectId || activeTab !== "submission") return;
    let cancelled = false;
    (async () => {
      setLoadingDeliverables(true);
      const result = await fetchProjectDeliverables(token, projectId);
      if (cancelled) return;
      if (result.success && result.data) {
        setDeliverableData(normalizeDeliverables(result.data));
        setDeliverableError("");
      } else {
        setDeliverableData(null);
        setDeliverableError(result.message || "Failed to load deliverables");
      }
      setLoadingDeliverables(false);
    })();
    return () => { cancelled = true; };
  }, [token, projectId, activeTab, fetchProjectDeliverables]);

  useEffect(() => {
    if (!token || !projectId || activeTab !== "feedback") return;
    let cancelled = false;
    (async () => {
      setLoadingRating(true);
      const result = await fetchProjectRating(token, projectId);
      if (cancelled) return;
      if (result.success && result.data) {
        setRatingData(result.data);
        setRatingError("");
      } else {
        setRatingData(null);
        setRatingError(result.message || "Failed to load project rating");
      }
      setLoadingRating(false);
    })();
    return () => { cancelled = true; };
  }, [token, projectId, activeTab, fetchProjectRating]);

  function populateEdit() {
    if (!project) return;
    const existingTasks = Array.isArray(project.tasks)
      ? (project.tasks as unknown[]).map((t) => String(t))
      : typeof project.tasks === "string" && project.tasks.trim()
        ? project.tasks.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    setEditTitle((project.title ?? project.name ?? "") as string);
    setEditDescription((project.description ?? "") as string);
    setEditCategory((project.category ?? "") as string);
    setEditStatus(((project.status ?? "PENDING") as string).toUpperCase());
    setEditStartDate(((project.startDate ?? "") as string).slice(0, 10));
    setEditDeadline(((project.deadline ?? "") as string).slice(0, 10));
    setEditPoints(Number(project.points ?? 0) || 0);
    setEditTasks(existingTasks);
    const existingDeliverables = Array.isArray(project.deliverableTypes)
      ? (project.deliverableTypes as unknown[]).map((d) => String(d))
      : Array.isArray(project.deliverables)
        ? (project.deliverables as unknown[]).map((d) => String(d))
        : [];
    setEditDeliverables(existingDeliverables);
    setTaskInput("");

    // Pre-populate assigned users from the loaded project
    const existingUsers: EligibleUser[] = [];
    const rawUser = project.user ?? project.assignedUser ?? null;
    if (rawUser && typeof rawUser === "object") {
      const u = rawUser as Record<string, unknown>;
      existingUsers.push({
        id: String(u.id ?? ""),
        firstName: u.firstName as string | undefined,
        lastName: u.lastName as string | undefined,
        email: u.email as string | undefined,
        avatarUrl: u.avatarUrl as string | null | undefined,
      });
    }
    // Handle arrays of users (userIds / users)
    const rawUsers = project.users ?? project.assignedUsers ?? null;
    if (Array.isArray(rawUsers)) {
      (rawUsers as Record<string, unknown>[]).forEach((u) => {
        if (!existingUsers.find((x) => x.id === String(u.id ?? ""))) {
          existingUsers.push({
            id: String(u.id ?? ""),
            firstName: u.firstName as string | undefined,
            lastName: u.lastName as string | undefined,
            email: u.email as string | undefined,
            avatarUrl: u.avatarUrl as string | null | undefined,
          });
        }
      });
    }
    setEditUsers(existingUsers);
    setUserSearchQuery("");
    setUserResults([]);
    setShowUserDropdown(false);

  };

  // Debounced user search when in edit mode
  useEffect(() => {
    if (!editing || !token || userSearchQuery.trim().length < 2) return;
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
    userSearchTimer.current = setTimeout(async () => {
      setSearchingUsers(true);
      const result = await getEligibleUsers(token, userSearchQuery.trim());
      setSearchingUsers(false);
      if (result.success && result.data) {
        const raw = result.data;
        const users: EligibleUser[] = Array.isArray(raw)
          ? (raw as EligibleUser[])
          : ((raw.users ?? raw.data ?? raw.items ?? []) as EligibleUser[]);
        setUserResults(users);
        setShowUserDropdown(true);
      } else {
        setUserResults([]);
      }
    }, 300);
    return () => { if (userSearchTimer.current) clearTimeout(userSearchTimer.current); };
  }, [userSearchQuery, token, editing, getEligibleUsers]);

  // Fetch user assignments for this project when editing starts
  useEffect(() => {
    if (!editing || !token || !projectId) return;
    let cancelled = false;
    (async () => {
      const result = await getUserAssignments(token, { projectId });
      if (cancelled || !result.success || !result.data) return;
      const raw = result.data;
      const list: EligibleUser[] = Array.isArray(raw)
        ? (raw as EligibleUser[])
        : (raw.assignments ?? raw.data ?? raw.items ?? []) as EligibleUser[];
      if (list.length === 0) return;
      setEditUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const enriched: EligibleUser[] = [];
        for (const u of list) {
          const rec = u as unknown as Record<string, unknown>;
          const userObj = rec.user;
          const obj = userObj && typeof userObj === "object"
            ? userObj as Record<string, unknown>
            : rec;
          const profile = obj.profile && typeof obj.profile === "object"
            ? obj.profile as Record<string, unknown>
            : null;
          const id = String(obj.id ?? u.id ?? "");
          if (!id || existingIds.has(id)) continue;
          const firstName = typeof obj.firstName === "string" ? obj.firstName : typeof profile?.firstName === "string" ? profile.firstName : undefined;
          const lastName = typeof obj.lastName === "string" ? obj.lastName : typeof profile?.lastName === "string" ? profile.lastName : undefined;
          const email = typeof obj.email === "string" ? obj.email : undefined;
          const avatarUrl = typeof obj.avatarUrl === "string" ? obj.avatarUrl : typeof profile?.avatarUrl === "string" ? profile.avatarUrl : null;
          enriched.push({ id, firstName, lastName, email, avatarUrl } satisfies EligibleUser);
        }
        return enriched.length > 0 ? [...prev, ...enriched] : prev;
      });
    })();
    return () => { cancelled = true; };
  }, [editing, token, projectId, getUserAssignments]);

  const startEditing = () => {
    populateEdit();
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const addEditTask = () => {
    const value = taskInput.trim();
    if (!value) return;
    if (editTasks.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setTaskInput("");
      return;
    }
    setEditTasks((prev) => [...prev, value]);
    setTaskInput("");
  };

  const removeEditTask = (idx: number) => {
    setEditTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeliverable = (id: string) => {
    setEditDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEditTask();
    }
  };

  const handleSave = async () => {
    if (!token || !projectId) return;
    if (!editTitle.trim()) {
      showToast("Title is required");
      return;
    }
    if (
      editStartDate &&
      editDeadline &&
      new Date(editDeadline) <= new Date(editStartDate)
    ) {
      showToast("Deadline must be later than the start date");
      return;
    }
    setSaving(true);
    const base = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      status: editStatus,
      startDate: editStartDate || "",
      deadline: editDeadline || "",
      points: editPoints,
      tasks: editTasks,
      attachments: Array.isArray(project?.attachments)
        ? (project.attachments as string[])
        : [],
      deliverableTypes: editDeliverables,
      additionalInstructions: (project?.additionalInstructions ?? "") as string,
    };
    if (editUsers.length <= 1) {
      const result = await updateProject(token, projectId, {
        ...base,
        userIds: editUsers.map((u) => u.id),
      });
      setSaving(false);
      if (result.success) {
        showToast("Project updated");
        setEditing(false);
        const refreshed = await getProjectById(token, projectId);
        if (refreshed.success && refreshed.data) {
          const raw = refreshed.data;
          const prj: Record<string, unknown> = (raw.project ?? raw.data ?? (typeof raw === "object" && raw !== null ? raw : {})) as Record<string, unknown>;
          setProject(prj);
        }
      } else {
        showToast(result.message || "Failed to update project");
      }
      return;
    }

    // Multi-user: split into independent copies - original stays with the
    // first user, each other user gets their own copy.
    let splitCount = 0;
    let lastError = "";
    const original = await updateProject(token, projectId, {
      ...base,
      userIds: [editUsers[0].id],
    });
    if (original.success) splitCount += 1;
    else lastError = original.message || "Failed to update project";
    for (const u of editUsers.slice(1)) {
      const res = await createProject(token, {
        ...base,
        userIds: [u.id],
      });
      if (res.success) splitCount += 1;
      else lastError = res.message || "Failed to create project";
    }
    setSaving(false);
    if (splitCount === editUsers.length) {
      showToast(`Project split into ${editUsers.length} projects - one per user`);
    } else if (splitCount > 0) {
      showToast(`Split ${splitCount}/${editUsers.length} projects. ${lastError}`);
    } else {
      showToast(lastError || "Failed to split project");
    }
    setEditing(false);
    const refreshed = await getProjectById(token, projectId);
    if (refreshed.success && refreshed.data) {
      const raw = refreshed.data;
      const prj: Record<string, unknown> = (raw.project ?? raw.data ?? (typeof raw === "object" && raw !== null ? raw : {})) as Record<string, unknown>;
      setProject(prj);
    }
  };

  const handleApprove = async () => {
    if (!token || !projectId || approving) return;
    setApproving(true);
    const result = await approveProject(token, projectId);
    setApproving(false);
    if (result.success) {
      showToast("Project approved - reward points credited");
      setEditing(false);
      const refreshed = await getProjectById(token, projectId);
      if (refreshed.success && refreshed.data) {
        const raw = refreshed.data;
        const prj: Record<string, unknown> = (raw.project ?? raw.data ?? (typeof raw === "object" && raw !== null ? raw : {})) as Record<string, unknown>;
        setProject(prj);
      }
    } else {
      showToast(result.message || "Failed to approve project");
    }
  };

  const p = project;
  const status: string = (p?.status as string) ?? "pending";
  const { label: statusLabel, icon: StatusIcon, cls: statusCls } = statusInfo(status);

  const assignedDate = (p?.startDate ?? p?.assignedDate ?? "") as string;
  const dueDate = (p?.deadline ?? p?.dueDate ?? "") as string;
  const description = (p?.description ?? "") as string;
  const tasks = (p?.tasks ?? "") as string | string[];
  const title = (p?.title ?? p?.name ?? "Untitled Project") as string;
  const projectIdDisplay = (p?.id ?? projectId ?? "") as string;

  const assignedUsers = assignedUsersList(p);

  const deliverables: string[] = Array.isArray(p?.deliverableTypes)
    ? (p.deliverableTypes as string[]).filter(Boolean)
    : Array.isArray(p?.deliverables)
      ? (p.deliverables as string[])
      : [];

  const attachments: { name: string; size?: string }[] = Array.isArray(p?.attachments)
    ? (p.attachments as unknown[]).map((a: unknown) => {
        if (typeof a === "string") return { name: a };
        if (a && typeof a === "object") return a as { name: string; size?: string };
        return { name: "Unknown file" };
      })
    : [];

  const activityLog: { id: number; action: string; user?: string; time?: string }[] = Array.isArray(p?.activityLog)
    ? p.activityLog as { id: number; action: string; user?: string; time?: string }[]
    : [];

  const feedbackList: { id: number; author?: string; text?: string; rating?: number; date?: string }[] = Array.isArray(p?.feedback)
    ? p.feedback as { id: number; author?: string; text?: string; rating?: number; date?: string }[]
    : [];

  const ratingInfo = (() => {
    const r0 = ratingData ?? {};
    const r = (r0.data && typeof r0.data === "object" && !Array.isArray(r0.data)
      ? r0.data
      : r0) as Record<string, unknown>;
    const entriesRaw: unknown[] = Array.isArray(r.feedback)
      ? r.feedback as unknown[]
      : Array.isArray(r.reviews)
        ? r.reviews as unknown[]
        : Array.isArray(r.ratings)
          ? r.ratings as unknown[]
          : Array.isArray(r.data)
            ? r.data as unknown[]
            : [];
    const entries: { id: string | number; author: string; text: string; rating: number; date: string }[] =
      entriesRaw.map((e) => {
        const ob = (e ?? {}) as Record<string, unknown>;
        const user = (ob.user ?? {}) as Record<string, unknown>;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
        return {
          id: (ob.id ?? "") as string | number,
          author: String(ob.author ?? ob.reviewer ?? ob.submitter ?? user.name ?? fullName ?? ""),
          text: String(ob.feedback ?? ob.text ?? ob.comment ?? ob.review ?? ""),
          rating: typeof ob.rating === "number" ? ob.rating : (Number(ob.rating ?? 0) || 0),
          date: String(ob.date ?? ob.createdAt ?? ob.submittedAt ?? ""),
        };
      });
    const parsedAverage = Number(
      r.averageRating ?? r.avgRating ?? r.average ?? r.meanRating ?? r.averageScore ?? r.rating,
    );
    const average = Number.isFinite(parsedAverage)
      ? parsedAverage
      : entries.length > 0
        ? entries.reduce((sum, e) => sum + e.rating, 0) / entries.length
        : 0;
    const parsedCount = Number(
      r.count ?? r.totalCount ?? r.total ?? r.numRatings ?? r.totalRatings,
    );
    const count = Number.isFinite(parsedCount) ? parsedCount : entries.length;
    return { average, count, entries };
  })();

  const submissions: { id: number; file?: string; size?: string; submittedBy?: string; date?: string; status?: string }[] = Array.isArray(p?.submissions)
    ? p.submissions as { id: number; file?: string; size?: string; submittedBy?: string; date?: string; status?: string }[]
    : [];

  const hasDeliverables =
    !!deliverableData &&
    (!!deliverableData.githubUrl ||
      !!deliverableData.liveUrl ||
      !!deliverableData.note ||
      deliverableData.entries.length > 0);

  if (!hydrated || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-sky-100 md:bg-gray-50 font-sans flex text-black">
      <AdminSideNav />

      <div className="flex-1 w-full md:ml-64 pb-28 md:pb-12 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-20 md:pt-10">
          <AdminHeader title={title} subtitle={`Project ID: ${projectIdDisplay}`}>
            <div className="flex items-center gap-3">
              {!editing && status.toUpperCase() !== "COMPLETED" && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={16} />
                  {approving ? "Approving..." : "Approve & Reward"}
                </button>
              )}
              {!editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
                >
                  <Pencil size={16} />
                  Edit Project
                </button>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Projects
              </button>
            </div>
          </AdminHeader>

          {editing && (
            <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Project
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Project title"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Skill category"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>

              {/* Assign Users */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assigned Users
                </label>
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onFocus={() => { if (userResults.length > 0) setShowUserDropdown(true); }}
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    placeholder="Search and add users..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                  {showUserDropdown && userResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {userResults
                        .filter((u) => !editUsers.some((s) => s.id === u.id))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onMouseDown={() => {
                              setEditUsers((prev) => [...prev, u]);
                              setUserSearchQuery("");
                              setUserResults([]);
                              setShowUserDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                          >
                            <UserAvatar avatarUrl={u.avatarUrl} firstName={u.firstName} lastName={u.lastName} className="w-8 h-8 rounded-full text-xs shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{userFullName(u)}</p>
                              {u.email && <p className="text-xs text-gray-500 truncate">{u.email}</p>}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                  {searchingUsers && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                  )}
                </div>
                {editUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-1.5 pl-1 pr-2 py-1 bg-sky-50 border border-sky-200 rounded-xl">
                        <UserAvatar avatarUrl={u.avatarUrl} firstName={u.firstName} lastName={u.lastName} className="w-6 h-6 rounded-full text-xs shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{userFullName(u)}</p>
                          {u.email && <p className="text-xs text-gray-400 truncate leading-tight">{u.email}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditUsers((prev) => prev.filter((s) => s.id !== u.id))}
                          className="p-0.5 rounded hover:bg-sky-100 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          aria-label={`Remove ${userFullName(u)}`}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {editUsers.length > 1 && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs text-amber-700">
                    Saving with multiple users splits this project into one
                    independent copy per user.
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Points (awarded on completion)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPoints}
                    onChange={(e) => setEditPoints(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={editDeadline}
                    min={editStartDate || undefined}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tasks
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={handleTaskKeyDown}
                    placeholder="Type a task and press Enter"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addEditTask}
                    className="flex items-center gap-1 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2.5 text-sm font-medium text-white transition-colors shrink-0"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                {editTasks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editTasks.map((task, idx) => (
                      <span
                        key={`${task}-${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-sm text-sky-900"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                          {idx + 1}
                        </span>
                        {task}
                        <button
                          type="button"
                          onClick={() => removeEditTask(idx)}
                          className="ml-0.5 text-sky-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deliverable Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERABLE_TYPES.map((d) => {
                    const Icon = d.icon;
                    const active = editDeliverables.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDeliverable(d.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border transition-colors ${
                          active
                            ? "bg-sky-500 border-sky-500 text-white"
                            : "border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
                        }`}
                      >
                        <Icon size={16} />
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {editDeliverables.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {editDeliverables.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {loadingProject ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : !p ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm">Project not found</p>
            </div>
          ) : (
            <>
              {/* Status & Dates Bar */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-6 text-sm">
                    {assignedDate && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        <span>
                          Assigned:{" "}
                          <strong className="text-gray-700">
                            {new Date(assignedDate).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    )}
                    {dueDate && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        <span>
                          Due:{" "}
                          <strong className="text-gray-700">
                            {new Date(dueDate).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border ${statusCls}`}
                  >
                    <StatusIcon size={14} />
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Assigned Users */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-sm font-semibold text-gray-700">Assigned Users</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    {Number(p?.points ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                        <Award size={14} />
                        {Number(p?.points ?? 0)} pts
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCls}`}
                    >
                      <StatusIcon size={14} />
                      {statusLabel}
                    </span>
                  </div>
                </div>
                {assignedUsers.length === 0 ? (
                  <p className="text-sm text-gray-400">No users assigned</p>
                ) : (
                  <div className="space-y-4">
                    {assignedUsers.map((u) => (
                      <div key={assignedUserKey(u)} className="flex items-center gap-4">
                        <UserAvatar
                          avatarUrl={u.avatarUrl}
                          firstName={u.firstName}
                          lastName={u.lastName}
                          className="w-14 h-14 rounded-full text-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {assignedUserName(u)}
                          </p>
                          {u.email && (
                            <p className="text-sm text-gray-500">{u.email}</p>
                          )}
                          {u.skill && (
                            <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                              {u.skill}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="flex overflow-x-auto border-b">
                  {(["overview", "activity", "feedback", "submission"] as Tab[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap flex-1 sm:flex-none px-3 sm:px-6 py-3.5 text-sm font-semibold capitalize transition-colors relative ${
                          activeTab === tab
                            ? "text-sky-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                        )}
                      </button>
                    ),
                  )}
                </div>

                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {tasks && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Project Tasks
                          </h3>
                          <p className="text-sm text-gray-600">
                            {typeof tasks === "string" ? tasks : Array.isArray(tasks) ? tasks.join(", ") : String(tasks)}
                          </p>
                        </div>
                      )}
                      {deliverables.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Deliverables
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {deliverables.map((d) => {
                              const Icon = deliverableIcon(String(d));
                              return (
                                <span
                                  key={String(d)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  <Icon size={14} />
                                  {String(d)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {attachments.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Attachments
                          </h3>
                          <div className="space-y-2">
                            {attachments.map((a, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
                              >
                                <Paperclip
                                  size={16}
                                  className="text-gray-400"
                                />
                                <span className="flex-1 text-sm text-gray-700">
                                  {a.name}
                                </span>
                                {a.size && (
                                  <span className="text-xs text-gray-400">
                                    {a.size}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!tasks && deliverables.length === 0 && attachments.length === 0 && (
                        <p className="text-sm text-gray-400">
                          No additional details for this project.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="space-y-0">
                      {activityLog.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MessageSquare
                            size={36}
                            className="mx-auto mb-2 opacity-40"
                          />
                          <p className="text-sm">No activity recorded yet</p>
                        </div>
                      ) : (
                        activityLog.map((entry, idx) => (
                          <div
                            key={entry.id}
                            className="flex gap-4 pb-6 relative"
                          >
                            {idx < activityLog.length - 1 && (
                              <div className="absolute left-2.75 top-6 bottom-0 w-0.5 bg-gray-200" />
                            )}
                            <div className="w-6 h-6 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-sky-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {entry.action}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {entry.user}
                                {entry.time ? ` · ${entry.time}` : ""}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "feedback" && (
                    <div className="space-y-4">
                      {loadingRating ? (
                        <div className="flex items-center justify-center py-10 text-gray-400">
                          <Loader2 size={28} className="mr-2 animate-spin" />
                          <span className="text-sm">Loading feedback...</span>
                        </div>
                      ) : (
                        <>
                          {(ratingInfo.count > 0 || ratingInfo.entries.length > 0) && (
                            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
                              <div className="flex items-center gap-5">
                                <div className="text-center shrink-0">
                                  <p className="text-4xl font-bold text-gray-900">
                                    {ratingInfo.count > 0
                                      ? ratingInfo.average.toFixed(1)
                                      : "-"}
                                  </p>
                                  <div className="flex items-center justify-center gap-0.5 mt-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        size={16}
                                        className={
                                          i < Math.round(ratingInfo.average)
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-gray-300"
                                        }
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {ratingInfo.count}{" "}
                                    {ratingInfo.count === 1 ? "rating" : "ratings"}
                                  </p>
                                </div>
                                <div className="h-16 w-px bg-gray-100" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 mb-1">
                                    Feedback Summary
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Aggregate rating for this project based on
                                    user submissions.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {ratingError && (
                            <p className="text-xs text-red-500">{ratingError}</p>
                          )}

                          {ratingInfo.entries.length === 0 && feedbackList.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <MessageSquare
                                size={36}
                                className="mx-auto mb-2 opacity-40"
                              />
                              <p className="text-sm">No feedback yet</p>
                            </div>
                          ) : (
                            ([] as unknown[]).concat(
                              ratingInfo.entries.length > 0 ? ratingInfo.entries : feedbackList,
                            ).map((fb, idx) => {
                              const item = fb as { id?: string | number; author?: string; text?: string; rating?: number; date?: string };
                              return (
                                <div key={(item.id?.toString() ?? "") || idx} className="p-4 bg-gray-50 rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {item.author ?? "Unknown"}
                                    </p>
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          className={
                                            i < (item.rating ?? 0)
                                              ? "text-amber-400 fill-amber-400"
                                              : "text-gray-300"
                                          }
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600">{item.text}</p>
                                  {item.date && (
                                    <p className="text-xs text-gray-400 mt-1.5">
                                      {item.date}
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "submission" && (
                    <div className="space-y-4">
                      {loadingDeliverables ? (
                        <div className="flex items-center justify-center py-10 text-gray-400">
                          <Loader2 size={28} className="mr-2 animate-spin" />
                          <span className="text-sm">Loading deliverables...</span>
                        </div>
                      ) : hasDeliverables ? (
                        <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                          <div className="flex items-center justify-between gap-3 px-5 py-4 bg-sky-50/60">
                            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                              <Upload size={16} className="text-sky-600" />
                              Submitted Deliverables
                            </p>
                            {deliverableData?.submittedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(deliverableData.submittedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {deliverableData?.githubUrl && (
                            <a
                              href={deliverableData.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                                <GitBranch size={18} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">GitHub Repository</p>
                                <p className="text-xs text-gray-500 truncate">{deliverableData.githubUrl}</p>
                              </div>
                              <Globe size={15} className="text-gray-300 shrink-0" />
                            </a>
                          )}
                          {deliverableData?.liveUrl && (
                            <a
                              href={deliverableData.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                                <Globe size={18} className="text-sky-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">Live URL</p>
                                <p className="text-xs text-gray-500 truncate">{deliverableData.liveUrl}</p>
                              </div>
                              <Globe size={15} className="text-gray-300 shrink-0" />
                            </a>
                          )}
                          {deliverableData?.entries.map((d, idx) => (
                            <div key={`${d.type}-${idx}`}>{renderDeliverableRow(d)}</div>
                          ))}
                          {deliverableData?.note && (
                            <div className="px-5 py-4">
                              <p className="text-sm font-medium text-gray-900 mb-1">Submission Notes</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{deliverableData.note}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Upload
                            size={36}
                            className="mx-auto mb-2 opacity-40"
                          />
                          <p className="text-sm">No submissions yet</p>
                        </div>
                      )}
                      {deliverableError && (
                        <p className="text-xs text-red-500">{deliverableError}</p>
                      )}
                      {submissions.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-700">
                            Files
                          </h3>
                          {submissions.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                            >
                              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                                <Upload
                                  size={18}
                                  className="text-sky-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {s.file ?? "Unknown file"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {s.submittedBy ?? ""}
                                  {s.date ? ` · ${s.date}` : ""}
                                  {s.size ? ` · ${s.size}` : ""}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  s.status === "approved"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {(s.status ?? "pending").charAt(0).toUpperCase() +
                                  (s.status ?? "pending").slice(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {toastElement}
    </div>
  );
}
