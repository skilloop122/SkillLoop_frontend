import { create } from "zustand";

export interface ApiSession {
  id: string;
  createdAt: string;
  completedAt: string | null;
  providerId: string;
  requesterId: string;
  requestId: string;
  provider?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  requester?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  request?: {
    skillListing?: {
      title: string;
      category: string;
    };
  };
}

export interface AdminSessionState {
  loading: boolean;
  error: string | null;
  sessions: ApiSession[];
  total: number;
  fetchSessions: (
    token: string,
    params?: { page?: number; limit?: number; status?: string }
  ) => Promise<{ success: boolean; data?: { sessions: ApiSession[]; total: number }; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminSessionStore = create<AdminSessionState>()((set) => ({
  loading: false,
  error: null,
  sessions: [],
  total: 0,

  fetchSessions: async (token, params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.status) query.set("status", params.status);

      const url = `${API_BASE}admin/sessions` + (query.toString() ? "?" + query.toString() : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const body = await response.json().catch(() => null);
      console.log("Sessions API Response:", body);
      if (!response.ok) {
        const errorMsg = body?.message || "Failed to load sessions";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }

      const sessions = Array.isArray(body) ? body : (body?.sessions || body?.data || []);
      const total = body?.total || sessions.length;

      set({ sessions, total, loading: false });
      return { success: true, data: { sessions, total } };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },
}));
