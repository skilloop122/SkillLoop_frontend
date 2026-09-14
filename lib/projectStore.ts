import { create } from "zustand";
import { useAuthStore } from "./authStore";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export interface Project {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status?: ProjectStatus | string;
  category?: string;
  startDate?: string;
  deadline?: string;
  tasks?: string[] | string;
  deliverables?: string[];
  deliverableTypes?: string[];
  additionalInstructions?: string;
  attachments?: string[];
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProjectsParams {
  status?: ProjectStatus | string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  getProjects: (params?: GetProjectsParams) => Promise<{
    success: boolean;
    projects?: Project[];
    message?: string;
  }>;
  getProjectById: (id: string) => Promise<{
    success: boolean;
    project?: Project;
    message?: string;
  }>;
  submitProject: (id: string, payload?: {
    deliverables?: { type?: string; value?: string }[];
    note?: string;
  }) => Promise<{ success: boolean; project?: Project; message?: string }>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  getProjects: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      const url =
        API_BASE + "projects" + (query.toString() ? "?" + query.toString() : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to fetch projects");
      }

      const projects: Project[] = Array.isArray(data)
        ? data
        : (data?.projects ?? data?.data ?? data?.items ?? []);
      set({ projects, loading: false });
      return { success: true, projects };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  getProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const url = API_BASE + "projects/" + id;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to fetch project");
      }

      const project: Project =
        data?.project ?? data?.data ?? (data && typeof data === "object" ? data : {});
      set({ loading: false });
      return { success: true, project };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  submitProject: async (id, payload = {}) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const url = API_BASE + "projects/" + id + "/deliverables";

      const entries = payload.deliverables ?? [];
      const byType: Record<string, string> = {};
      entries.forEach((d) => {
        if (d?.type && d?.value) byType[d.type] = d.value;
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUrl: byType["github"] ?? "",
          liveUrl: byType["live-url"] ?? byType["liveUrl"] ?? byType["live"] ?? "",
          notes: payload.note ?? "",
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to submit project");
      }

      const project: Project =
        data?.project ?? data?.data ?? (data && typeof data === "object" ? data : {});
      set({ loading: false });
      return { success: true, project };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },
}));

export const projectTitle = (p: Project) => p.title ?? p.name ?? "Untitled Project";

export const projectStatusLabel = (status?: ProjectStatus | string) => {
  const key = (status ?? "PENDING").toUpperCase();
  const map: Record<string, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    FAILED: "Failed",
  };
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
};
