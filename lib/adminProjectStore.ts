import { create } from "zustand";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export interface ProjectPayload {
  userIds: string[];
  title: string;
  description: string;
  category: string;
  tasks: string[];
  attachments: string[];
  startDate: string;
  deadline: string;
  deliverableTypes: string[];
  additionalInstructions: string;
}

export interface ProjectUpdatePayload extends Partial<ProjectPayload> {
  status?: string;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

interface AdminProjectState {
  loading: boolean;
  error: string | null;
  createProject: (token: string, payload: ProjectPayload) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  getProjects: (token: string, params?: GetProjectsParams) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  getEligibleUsers: (token: string, search?: string) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  getProjectById: (token: string, id: string) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  fetchProjectDeliverables: (token: string, id: string) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  updateProject: (token: string, id: string, payload: ProjectUpdatePayload) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  approveProject: (token: string, id: string) => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  deleteProject: (token: string, id: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAdminProjectStore = create<AdminProjectState>((set) => ({
  loading: false,
  error: null,

  createProject: async (token: string, payload: ProjectPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to create project");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  getProjects: async (token: string, params?: GetProjectsParams) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.category) queryParams.append("category", params.category);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      
      const response = await fetch(`${API_BASE}admin/projects${queryString}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to fetch projects");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  getEligibleUsers: async (token: string, search?: string) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      
      const response = await fetch(`${API_BASE}admin/projects/eligible-users${queryString}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to fetch eligible users");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  getProjectById: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/projects/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to fetch project");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  fetchProjectDeliverables: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}projects/${id}/deliverables`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      console.log("GET /projects/" + id + "/deliverables ->", response.status, data);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to fetch project deliverables");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  updateProject: async (token: string, id: string, payload: ProjectUpdatePayload) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to update project");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  approveProject: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/projects/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to approve project");
      }

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  deleteProject: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to delete project");
      }

      set({ loading: false });
      return { success: true, message: data?.message || "Project deleted successfully" };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },
}));
