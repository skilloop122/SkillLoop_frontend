import { create } from "zustand";
import { useAuthStore } from "./authStore";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export interface FeedbackSummary {
  averageRating: number | null;
  totalCount: number;
}

function feedbackSummary(body: unknown): FeedbackSummary {
  const b = (body ?? {}) as Record<string, unknown>;
  const summary = (b.summary ?? {}) as Record<string, unknown>;

  const list: unknown[] = Array.isArray(body)
    ? (body as unknown[])
    : Array.isArray(b.reviews)
      ? (b.reviews as unknown[])
      : Array.isArray(b.feedbacks)
        ? (b.feedbacks as unknown[])
        : Array.isArray(b.data)
          ? (b.data as unknown[])
          : Array.isArray(b.items)
            ? (b.items as unknown[])
            : [];

  const explicitAvg = Number(
    summary.averageRating ??
      b.averageRating ??
      b.avgRating ??
      b.average ??
      b.meanRating,
  );
  const explicitCount = Number(
    summary.totalReviewCount ??
      summary.totalRatingsCount ??
      b.totalCount ??
      b.total ??
      b.count ??
      b.numReviews ??
      b.totalReviews,
  );

  const ratings = list
    .map((f) => {
      const entry = (f ?? {}) as Record<string, unknown>;
      return Number(entry.rating ?? entry.score ?? 0);
    })
    .filter((n) => Number.isFinite(n) && n > 0);

  let averageRating: number | null = null;
  let totalCount = 0;

  if (list.length > 0) {
    averageRating = Number.isFinite(explicitAvg)
      ? explicitAvg
      : ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;
    totalCount = Number.isFinite(explicitCount) ? explicitCount : list.length;
  } else {
    if (Number.isFinite(explicitAvg)) averageRating = explicitAvg;
    if (Number.isFinite(explicitCount)) totalCount = explicitCount;
  }

  return {
    averageRating:
      averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    totalCount: Math.max(0, Math.round(totalCount)),
  };
}

interface UserFeedbackState {
  loading: boolean;
  averageRating: number | null;
  totalCount: number;
  byUser: Record<string, FeedbackSummary | undefined>;
  fetchMyFeedback: () => Promise<void>;
  fetchFeedbackForUser: (userId: string) => Promise<FeedbackSummary | null>;
}

export const useUserFeedbackStore = create<UserFeedbackState>((set) => ({
  loading: false,
  averageRating: null,
  totalCount: 0,
  byUser: {},

  fetchMyFeedback: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const response = await fetch(`${API_BASE}users/me/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();

      console.log(
        "GET /users/me/reviews ->",
        response.status,
        JSON.stringify(body),
      );

      const summary = feedbackSummary(body);
      set({ ...summary, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchFeedbackForUser: async (userId) => {
    const token = useAuthStore.getState().token;
    if (!token || !userId) return null;

    try {
      const response = await fetch(
        `${API_BASE}users/${encodeURIComponent(userId)}/reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const body = await response.json().catch(() => null);

      console.log(
        "GET /users/" + userId + "/reviews ->",
        response.status,
        JSON.stringify(body),
      );

      const summary = feedbackSummary(body);
      set((s) => ({ byUser: { ...s.byUser, [userId]: summary } }));
      return summary;
    } catch {
      return null;
    }
  },
}));
