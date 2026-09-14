import { create } from "zustand";
import { useAuthStore } from "./authStore";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

interface FeedbackEntry {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  giver?: { id?: string; firstName?: string; lastName?: string; avatarUrl?: string };
}

interface UserFeedbackState {
  loading: boolean;
  averageRating: number | null;
  totalCount: number;
  fetchMyFeedback: () => Promise<void>;
}

export const useUserFeedbackStore = create<UserFeedbackState>((set) => ({
  loading: false,
  averageRating: null,
  totalCount: 0,

  fetchMyFeedback: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const response = await fetch(`${API_BASE}users/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      console.log("GET /users/feedback ->", response.status, body);

      const list: FeedbackEntry[] = Array.isArray(body)
        ? body
        : body?.feedbacks || body?.data || [];

      const totalCount = list.length;
      const averageRating = totalCount
        ? Math.round((list.reduce((sum, f) => sum + (f.rating || 0), 0) / totalCount) * 10) / 10
        : null;

      set({ averageRating, totalCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
