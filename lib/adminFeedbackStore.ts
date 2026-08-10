import { create } from "zustand";

export interface ApiFeedback {
  id: string;
  rating: number;
  comments?: string;
  createdAt: string;
  status?: string;
  session?: {
    sessionRequest?: {
      skillListing?: {
        title?: string;
      };
    };
  };
}

export interface AdminFeedbackState {
  loading: boolean;
  error: string | null;
  feedbacks: ApiFeedback[];
  total: number;
  fetchFeedback: (
    token: string,
    params?: { page?: number; limit?: number }
  ) => Promise<{ success: boolean; data?: { feedbacks: ApiFeedback[]; total: number }; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminFeedbackStore = create<AdminFeedbackState>()((set) => ({
  loading: false,
  error: null,
  feedbacks: [],
  total: 0,

  fetchFeedback: async (token, params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      if (params.limit !== undefined) query.set("limit", String(params.limit));

      const url = `${API_BASE}admin/feedback` + (query.toString() ? "?" + query.toString() : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.message || "Failed to load feedback";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }

      const feedbacks = Array.isArray(body) ? body : (body?.feedbacks || body?.data || []);
      const total = body?.total || feedbacks.length;

      set({ feedbacks, total, loading: false });
      return { success: true, data: { feedbacks, total } };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
}));
