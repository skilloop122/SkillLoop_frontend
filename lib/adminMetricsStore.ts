import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopCategory {
  category: string;
  count: number;
}

export interface TopUser {
  id: string;
  email: string;
  points: number;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface AdminMetrics {
  overview: {
    totalUsers: number;
    totalSkillListings: number;
    totalRequests: number;
    totalSessions: number;
    completedSessions: number;
    totalFeedback: number;
    totalPointsAwarded: number;
    averageRating: number;
  };
  requests: {
    pending: number;
    accepted: number;
    rejected: number;
    canceled: number;
  };
  sessions: {
    scheduled: number;
    completed: number;
    canceled: number;
  };
  topCategories: TopCategory[];
  topUsers: TopUser[];
  trends: {
    registrations: Record<string, number>;
    sessionsCompleted: Record<string, number>;
  };
  ratingDistribution: Record<string, number>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AdminMetricsState {
  metrics: AdminMetrics | null;
  loading: boolean;
  error: string | null;
  fetchMetrics: (token: string) => Promise<void>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminMetricsStore = create<AdminMetricsState>()((set) => ({
  metrics: null,
  loading: false,
  error: null,

  fetchMetrics: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json();

      console.log("ADMIN METRICS STATUS:", response.status);
      console.log("ADMIN METRICS RESPONSE:", body);

      if (!response.ok) {
        set({ error: body?.message || "Failed to load metrics", loading: false });
        return;
      }

      set({ metrics: body, loading: false });
    } catch {
      set({ error: "Network error loading metrics", loading: false });
    } finally {
      set({ loading: false });
    }
  },
}));
