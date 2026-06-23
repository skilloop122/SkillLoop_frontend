import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface SkillItem {
  id: string;
  name: string;
  category: string;
}

interface FetchSkillsParams {
  category?: string;
  page?: string;
  limit?: string;
}

interface SkillsState {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
  fetchSkills: (params?: FetchSkillsParams) => Promise<{
    success: boolean;
    skills?: SkillItem[];
    message?: string;
  }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useSkillsStore = create<SkillsState>((set) => ({
  skills: [],
  loading: false,
  error: null,

  fetchSkills: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;

      // const token = useAuthStore.getState().token;

      console.log("TOKEN:", token);
      console.log("AUTH HEADER:", `Bearer ${token}`);

      const query = new URLSearchParams();
      if (params.category) query.set("category", params.category);
      if (params.page) query.set("page", params.page);
      if (params.limit) query.set("limit", params.limit);

      const url =
        API_BASE + "technical-skills" + (query.toString() ? "?" + query.toString() : "");

      console.log("URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("FETCH SKILLS RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch skills");

      const skills: SkillItem[] = Array.isArray(data) ? data : [];
      set({ skills, loading: false });
      return { success: true, skills };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },
}));
