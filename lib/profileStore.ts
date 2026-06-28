import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface Skill {
  id: string;
  name: string;
}

export interface Schedule {
  day: string;
  time: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio: string;
  phoneNumber: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  teachSkills: Skill[];
  learnSkills: Skill[];
  schedule: Schedule[];
}

export interface UpdateProfilePayload {
  bio?: string;
  phoneNumber?: string;
  teachSkills?: (string | Skill)[];
  learnSkills?: (string | Skill)[];
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  schedule?: Schedule[];
}

export interface CreateProfilePayload {
  firstName: string;
  lastName: string;
  bio?: string;
  phoneNumber?: string;
  teachSkills: (string | Skill)[];
  learnSkills: (string | Skill)[];
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  schedule: Schedule[];
}

interface ProfileState {
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  publicProfile: UserProfile | null;
  matches: UserProfile[];
  fetchProfile: () => Promise<{
    success: boolean;
    profile?: UserProfile;
    message?: string;
  }>;
  createProfile: (
    payload: CreateProfilePayload,
  ) => Promise<{ success: boolean; profile?: UserProfile; message?: string }>;
  updateProfile: (
    payload: UpdateProfilePayload,
  ) => Promise<{ success: boolean; profile?: UserProfile; message?: string }>;
  fetchPublicProfile: (
    id: string,
  ) => Promise<{ success: boolean; profile?: UserProfile; message?: string }>;
  fetchMatches: (
    limit?: string,
    skillId?: string,
  ) => Promise<{ success: boolean; matches?: UserProfile[]; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useProfileStore = create<ProfileState>((set) => ({
  loading: false,
  error: null,
  profile: null,
  publicProfile: null,
  matches: [],

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      console.log("FETCH PROFILE RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch profile");

      set({ profile: data, loading: false });
      return { success: true, profile: data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },
  createProfile: async (payload: CreateProfilePayload) => {
    set({ loading: true, error: null });

    try {
      const authState = useAuthStore.getState();

      const token = authState.token;
      const user = authState.user;
      const userId = user?.id;

      console.log("====================================");
      console.log("CREATE PROFILE DEBUG");
      console.log("====================================");
      console.log("AUTH USER:", user);
      console.log("AUTH USER ID:", userId);
      console.log("AUTH TOKEN:", token);
      console.log(
        "TOKEN PREVIEW:",
        token ? token.substring(0, 20) + "..." : "null",
      );
      console.log("AUTH HEADER:", `Bearer ${token}`);
      console.log("PAYLOAD:", payload);
      console.log("PAYLOAD JSON:", JSON.stringify(payload));

      if (!token) {
        throw new Error("No authentication token found");
      }

      const profileUrl = API_BASE + "users/profile";

      console.log("REQUEST URL:", profileUrl);

      const response = await fetch(profileUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("RESPONSE STATUS:", response.status);
      console.log("RESPONSE OK:", response.ok);

      const data = await response.json();

      console.log("RESPONSE DATA:", data);
      console.log("====================================");

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to create profile",
        );
      }

      set({
        profile: data,
        loading: false,
        error: null,
      });

      return {
        success: true,
        profile: data,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";

      console.error("CREATE PROFILE ERROR:", error);

      set({
        error: message,
        loading: false,
      });

      return {
        success: false,
        message,
      };
    }
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("UPDATE PROFILE RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      set({ profile: data, loading: false });
      return { success: true, profile: data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchPublicProfile: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(API_BASE + "users/" + id + "/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("FETCH PUBLIC PROFILE RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch public profile");

      set({ publicProfile: data, loading: false });
      return { success: true, profile: data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchMatches: async (limit = "20", skillId?: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      let url = API_BASE + "users/matches?limit=" + limit;
      if (skillId) {
        url += "&skillId=" + skillId;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      console.log("FETCH MATCHES RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch matches");

      const matchesArray: UserProfile[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.matches)
            ? data.matches
            : [];
      set({ matches: matchesArray, loading: false });
      return { success: true, matches: matchesArray };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },
}));
