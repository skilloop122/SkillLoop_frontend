import { create } from "zustand";
import { dedupFetch } from "./requestCache";

export interface ApiFeedback {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  status?: string;
  giver?: {
    id?: string;
    email?: string;
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
  };
  receiver?: {
    id?: string;
    email?: string;
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
  };
  session?: {
    id?: string;
    sessionRequest?: {
      skillListing?: {
        title?: string;
      };
    };
    request?: {
      skillListing?: {
        title?: string;
      };
    };
  };
}

export interface FeedbackUser {
  id?: string;
  email?: string;
  profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
}

export function feedbackUserName(u?: FeedbackUser): string {
  if (!u) return "";
  const name = [u.profile?.firstName, u.profile?.lastName]
    .filter(Boolean)
    .join(" ");
  return name || u.email || "";
}

export function feedbackSessionTitle(f: ApiFeedback): string {
  return (
    f.session?.request?.skillListing?.title ||
    f.session?.sessionRequest?.skillListing?.title ||
    ""
  );
}

export interface AdminFeedbackState {
  loading: boolean;
  error: string | null;
  feedbacks: ApiFeedback[];
  total: number;
  fetchFeedback: (
    token: string,
    params?: { page?: number; limit?: number },
  ) => Promise<{
    success: boolean;
    data?: { feedbacks: ApiFeedback[]; total: number };
    message?: string;
  }>;
  deleteFeedback: (token: string, id: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
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

      const url =
        `${API_BASE}admin/feedback` +
        (query.toString() ? "?" + query.toString() : "");

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

      const feedbacks = Array.isArray(body)
        ? body
        : body?.feedbacks || body?.data || [];
      const total = body?.total || feedbacks.length;

      set({ feedbacks, total, loading: false });
      return { success: true, data: { feedbacks, total } };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
  deleteFeedback: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await dedupFetch(`admin-feedback-delete-${id}`, async () => {
        const res = await fetch(`${API_BASE}admin/feedback/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        return res;
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = body?.message || "Failed to delete feedback";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }

      set((s) => ({
        feedbacks: s.feedbacks.filter((f) => f.id !== id),
        total: Math.max(0, s.total - 1),
        loading: false,
      }));
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
}));
