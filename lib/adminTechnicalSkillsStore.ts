import { create } from "zustand";

export interface TechnicalSkill {
  id: string;
  name: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTechnicalSkillsState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  skills: TechnicalSkill[];
  fetchTechnicalSkills: () => Promise<{ success: boolean; data?: TechnicalSkill[]; message?: string }>;
  createTechnicalSkill: (token: string, payload: { name: string; category: string }) => Promise<{ success: boolean; data?: TechnicalSkill; message?: string }>;
  updateTechnicalSkill: (token: string, id: string, payload: { name: string; category: string }) => Promise<{ success: boolean; data?: TechnicalSkill; message?: string }>;
  deleteTechnicalSkill: (token: string, id: string) => Promise<{ success: boolean; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminTechnicalSkillsStore = create<AdminTechnicalSkillsState>()((set) => ({
  loading: false,
  saving: false,
  error: null,
  skills: [],

  fetchTechnicalSkills: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}technical-skills`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.error || body?.message || "Failed to load technical skills";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }
      const skills = Array.isArray(body) ? body : (body?.skills || body?.data || []);
      set({ skills, loading: false });
      return { success: true, data: skills };
    } catch {
      set({ error: "Network error loading technical skills", loading: false });
      return { success: false, message: "Network error loading technical skills" };
    }
  },

  createTechnicalSkill: async (token, payload) => {
    set({ saving: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/technical-skills`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.error || body?.message || "Failed to create skill";
        set({ error: errorMsg, saving: false });
        return { success: false, message: errorMsg };
      }
      const skill = body?.data || body;
      set((s) => ({ skills: [...s.skills, skill], saving: false }));
      return { success: true, data: skill };
    } catch {
      set({ error: "Network error creating skill", saving: false });
      return { success: false, message: "Network error creating skill" };
    }
  },

  updateTechnicalSkill: async (token, id, payload) => {
    set({ saving: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/technical-skills/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.error || body?.message || "Failed to update skill";
        set({ error: errorMsg, saving: false });
        return { success: false, message: errorMsg };
      }
      const skill = body?.data || body;
      set((s) => ({
        skills: s.skills.map((k) => (k.id === id ? skill : k)),
        saving: false,
      }));
      return { success: true, data: skill };
    } catch {
      set({ error: "Network error updating skill", saving: false });
      return { success: false, message: "Network error updating skill" };
    }
  },

  deleteTechnicalSkill: async (token, id) => {
    set({ saving: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/technical-skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.error || body?.message || "Failed to delete skill";
        set({ error: errorMsg, saving: false });
        return { success: false, message: errorMsg };
      }
      set((s) => ({ skills: s.skills.filter((k) => k.id !== id), saving: false }));
      return { success: true, message: body?.message };
    } catch {
      set({ error: "Network error deleting skill", saving: false });
      return { success: false, message: "Network error deleting skill" };
    }
  },
}));
