import { create } from "zustand";
import { SkillListing } from "./skillsStore";

export interface AdminSkillsState {
  loading: boolean;
  error: string | null;
  skills: SkillListing[];
  total: number;
  fetchSkills: (token: string, params?: { page?: number; limit?: number; search?: string }) => Promise<{ success: boolean; data?: { skills: SkillListing[], total: number }; message?: string }>;
  deleteSkill: (token: string, id: string) => Promise<{ success: boolean; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminSkillsStore = create<AdminSkillsState>()((set) => ({
  loading: false,
  error: null,
  skills: [],
  total: 0,

  fetchSkills: async (token, params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.search) query.set("search", params.search);

      const url = `${API_BASE}admin/skills` + (query.toString() ? "?" + query.toString() : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.message || "Failed to load skills";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }

      const skills = Array.isArray(body) ? body : (body?.skills || body?.data || []);
      const total = body?.total || skills.length;

      set({ skills, total, loading: false });
      return { success: true, data: { skills, total } };
    } catch {
      set({ error: "Network error loading skills", loading: false });
      return { success: false, message: "Network error loading skills" };
    }
  },

  deleteSkill: async (token, id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = body?.message || "Failed to delete skill";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }
      set({ loading: false });
      return { success: true, message: body?.message };
    } catch {
      set({ error: "Network error deleting skill", loading: false });
      return { success: false, message: "Network error deleting skill" };
    }
  },
}));
