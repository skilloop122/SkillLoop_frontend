import { create } from "zustand";

export interface AdminUserSkill {
  id: string;
  name: string;
}

export interface AdminUserSchedule {
  day: string;
  time: string;
}

export interface AdminUserProfile {
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  teachSkills: AdminUserSkill[];
  learnSkills: AdminUserSkill[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  portfolioUrl?: string | null;
  schedule: AdminUserSchedule[];
}

export interface AdminUserDetail {
  id: string;
  email: string;
  points: number;
  role: string;
  status?: string;
  createdAt?: string;
  profile?: AdminUserProfile;
}

export interface AdminUserRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  fromUser?: { id: string; firstName?: string; lastName?: string };
  toUser?: { id: string; firstName?: string; lastName?: string };
}

export interface AdminUserSession {
  id: string;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  topic?: string;
  withUser?: { id: string; firstName?: string; lastName?: string };
}

export interface AdminUserFeedback {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  fromUser?: { id: string; firstName?: string; lastName?: string };
}

export interface AdminUserDetailsResponse {
  user: AdminUserDetail;
  profile: AdminUserProfile;
  requests: AdminUserRequest[];
  sessions: AdminUserSession[];
  feedback: AdminUserFeedback[];
}

interface AdminUserState {
  loading: boolean;
  error: string | null;
  details: AdminUserDetailsResponse | null;
  fetchUserDetails: (token: string, id: string) => Promise<void>;
  deleteUser: (token: string, id: string) => Promise<{ success: boolean; message?: string }>;
  createUser: (token: string, payload: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<{ success: boolean; message?: string }>;
  changeUserRole: (token: string, id: string, role: string) => Promise<{ success: boolean; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminUserStore = create<AdminUserState>()((set) => ({
  loading: false,
  error: null,
  details: null,

  fetchUserDetails: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json();
      console.log("ADMIN USER DETAILS RESPONSE:", JSON.stringify(body, null, 2));

      if (!response.ok) {
        set({ error: body?.message || "Failed to load user details", loading: false });
        return;
      }

      const raw = body?.data?.user ? body.data : body?.result?.user ? body.result : body;

      const normalized: AdminUserDetailsResponse = {
        user: {
          id: raw.id,
          email: raw.email,
          points: raw.points,
          role: raw.role,
          status: raw.status,
          createdAt: raw.createdAt,
          profile: raw.profile || undefined,
        },
        profile: raw.profile || undefined,
        requests: [...(raw.requestsSent || []), ...(raw.requestsReceived || [])],
        sessions: [...(raw.sessionsAsProvider || []), ...(raw.sessionsAsRequester || [])],
        feedback: raw.feedbackReceived || [],
      };

      console.log("ADMIN USER DETAILS NORMALIZED:", JSON.stringify(normalized, null, 2));

      set({ details: normalized, loading: false });
    } catch {
      set({ error: "Network error loading user details", loading: false });
    }
  },

  deleteUser: async (token: string, id: string) => {
    try {
      const response = await fetch(`${API_BASE}admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, message: body?.message || "Failed to delete user" };
      return { success: true, message: body?.message };
    } catch {
      return { success: false, message: "Network error deleting user" };
    }
  },

  createUser: async (token: string, payload: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    try {
      const response = await fetch(`${API_BASE}admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, message: body?.message || "Failed to create user" };
      return { success: true, message: body?.message };
    } catch {
      return { success: false, message: "Network error creating user" };
    }
  },

  changeUserRole: async (token: string, id: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE}admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const body = await response.json().catch(() => ({}));
      console.log("CHANGE ROLE RESPONSE:", response.status, JSON.stringify(body, null, 2));
      if (!response.ok) return { success: false, message: body?.message || body?.error || "Failed to update role" };
      return { success: true, message: body?.message };
    } catch {
      return { success: false, message: "Network error updating role" };
    }
  },
}));
