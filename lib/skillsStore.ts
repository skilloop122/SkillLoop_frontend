import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface SkillItem {
  id: string;
  name: string;
  category: string;
}

export interface SkillListing {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  user?: {
    id: string;
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string | null };
  };
}

export function findListingForSkill(
  listings: SkillListing[],
  skillName: string,
): SkillListing | undefined {
  const norm = (s: string) => s.toLowerCase().trim();
  const n = norm(skillName);
  if (!n || !listings.length) return undefined;
  const matches = (l: SkillListing) => {
    const lt = norm(l.title);
    if (lt === n) return true;
    if (n.length < 3 || lt.length < 3) return false;
    return lt.includes(n) || n.includes(lt);
  };
  return listings.find(matches);
}

interface FetchSkillsParams {
  category?: string;
  page?: string;
  limit?: string;
}

interface SkillsState {
  skills: SkillItem[];
  listings: SkillListing[];
  loading: boolean;
  error: string | null;
  fetchSkills: (params?: FetchSkillsParams) => Promise<{
    success: boolean;
    skills?: SkillItem[];
    message?: string;
  }>;
  fetchSkillListings: (params?: {
    limit?: number;
    page?: number;
    userId?: string;
  }) => Promise<{ success: boolean; listings?: SkillListing[]; message?: string }>;
  createSkillListing: (payload: {
    title: string;
    description?: string;
    category?: string;
  }) => Promise<{ success: boolean; listing?: SkillListing; message?: string }>;
  syncSkillListings: (
    teachSkills: (string | { name: string })[],
  ) => Promise<{ success: boolean; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: [],
  listings: [],
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

  fetchSkillListings: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;

      const query = new URLSearchParams();
      if (params.limit) query.set("limit", String(params.limit));
      if (params.page) query.set("page", String(params.page));
      if (params.userId) query.set("userId", params.userId);

      const url =
        API_BASE + "skills" + (query.toString() ? "?" + query.toString() : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("FETCH LISTINGS RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || data.error || "Failed to fetch listings");

      const listings: SkillListing[] = Array.isArray(data) ? data : (data?.data || []);
      set({ listings, loading: false });
      return { success: true, listings };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  createSkillListing: async (payload) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const url = API_BASE + "skills";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("CREATE LISTING RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || data.error || "Failed to create listing");

      set({ loading: false });
      return { success: true, listing: data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  syncSkillListings: async (
    teachSkills,
    description = "Book a one-on-one session to learn this skill.",
  ) => {
    try {
      const me = useAuthStore.getState().user;
      const myId = me?.id;

      const existing = await get().fetchSkillListings({ limit: 200 });
      const mine = existing.success && existing.listings && myId
        ? existing.listings.filter((l) => l.userId === myId)
        : [];
      const catalog = get().skills;

      const norm = (s: string) => s.toLowerCase().trim();

      for (const skill of teachSkills) {
        const name = typeof skill === "string" ? skill : skill.name;
        if (!name) continue;
        const n = norm(name);
        const already = mine.some((l) => {
          const lt = norm(l.title);
          if (lt === n) return true;
          if (n.length < 3 || lt.length < 3) return false;
          return lt.includes(n) || n.includes(lt);
        });
        if (already) continue;
        const category =
          catalog.find((s) => norm(s.name) === norm(name))?.category || "Other";
        await get().createSkillListing({
          title: name,
          description,
          category,
        });
      }

      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },
}));