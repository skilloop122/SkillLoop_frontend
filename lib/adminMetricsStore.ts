import { create } from "zustand";
import { dedupFetch } from "./requestCache";

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
  status?: string;
  createdAt?: string;
  avatarUrl?: string | null;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export interface SkillPointReason {
  reason: string;
  earned: number;
  spent: number;
}

export interface SkillPointSettings {
  baseSessionCost?: number;
  welcomeBonusPoints?: number;
  [key: string]: unknown;
}

export interface SkillPointsMetric {
  inCirculation: number;
  inEscrow: number;
  available: number;
  netIssued: number;
  byReason: SkillPointReason[];
  activeSettings: SkillPointSettings;
}

export interface AdminAlert {
  code: string;
  severity: "info" | "warning" | "error" | string;
  count: number;
  message: string;
}

export interface AdminMetrics {
  generatedAt?: string;
  windowDays?: number;
  cached?: boolean;
  overview: {
    totalUsers: number;
    totalSkillListings: number;
    totalRequests: number;
    totalSessions: number;
    completedSessions: number;
    totalPointsAwarded: number;
    averageRating: number;
    activeUsersInWindow?: number;
    sessionCompletionRate?: number;
    requestAcceptanceRate?: number;
    totalInactiveUsers?: number;
    newUsers?: number;
    totalFeedback?: number;
  };
  summary?: {
    total: number;
    active: number;
    inactive: number;
    newUsers: number;
  };
  skillPoints?: SkillPointsMetric;
  alerts?: AdminAlert[];
  requests?: {
    pending: number;
    accepted: number;
    rejected: number;
    canceled: number;
  };
  sessions?: {
    scheduled: number;
    completed: number;
    canceled: number;
  };
  topCategories?: TopCategory[];
  topUsers?: TopUser[];
  trends?: {
    registrations: Record<string, number>;
    sessionsCompleted: Record<string, number>;
  };
  ratingDistribution?: Record<string, number>;
}

export interface PublicCountsBreakdown {
  learnersCount: number;
  totalUsersCount: number;
  activeSkillListings: number;
  technicalSkillsCatalog: number;
  totalSkillsAvailable: number;
  completedSessions: number;
  totalSessions: number;
}

export interface PublicCountsStat {
  id: string;
  key: string;
  label: string;
  value: string;
  display: string;
  count: number;
  rawCount: number;
}

export interface PublicCountsData {
  activeLearners: string;
  skillsTaught: string;
  sessionsCompleted: string;
  counts: {
    activeLearners: number;
    skillsTaught: number;
    sessionsCompleted: number;
  };
  numeric: {
    activeLearners: number;
    skillsTaught: number;
    sessionsCompleted: number;
  };
  raw: {
    activeLearners: number;
    skillsTaught: number;
    sessionsCompleted: number;
  };
  breakdown: PublicCountsBreakdown;
  stats: PublicCountsStat[];
}

export interface PublicCountsResponse {
  success: boolean;
  data: PublicCountsData;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AdminMetricsState {
  metrics: AdminMetrics | null;
  publicCounts: PublicCountsData | null;
  loading: boolean;
  error: string | null;
  fetchMetrics: (token?: string) => Promise<void>;
  fetchPublicCounts: () => Promise<PublicCountsData | null>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

const buildMetricsFromPublicCounts = (
  countsData: PublicCountsData | null,
  existingMetrics: AdminMetrics | null = null
): AdminMetrics => {
  const breakdown = countsData?.breakdown;
  const numeric = countsData?.numeric ?? countsData?.counts;

  const totalUsers =
    existingMetrics?.overview?.totalUsers ||
    breakdown?.totalUsersCount ||
    numeric?.activeLearners ||
    0;

  const totalSkillListings =
    existingMetrics?.overview?.totalSkillListings ||
    breakdown?.totalSkillsAvailable ||
    breakdown?.activeSkillListings ||
    numeric?.skillsTaught ||
    0;

  const totalSessions =
    existingMetrics?.overview?.totalSessions ||
    breakdown?.totalSessions ||
    numeric?.sessionsCompleted ||
    0;

  const completedSessions =
    existingMetrics?.overview?.completedSessions ||
    breakdown?.completedSessions ||
    numeric?.sessionsCompleted ||
    0;

  const activeLearners =
    existingMetrics?.overview?.activeUsersInWindow ||
    breakdown?.learnersCount ||
    numeric?.activeLearners ||
    0;

  const inactiveUsers =
    existingMetrics?.overview?.totalInactiveUsers ??
    (breakdown ? Math.max(0, breakdown.totalUsersCount - breakdown.learnersCount) : 0);

  return {
    ...(existingMetrics || {}),
    overview: {
      totalUsers,
      totalSkillListings,
      totalRequests: existingMetrics?.overview?.totalRequests || 0,
      totalSessions,
      completedSessions,
      totalPointsAwarded: existingMetrics?.overview?.totalPointsAwarded || 0,
      averageRating: existingMetrics?.overview?.averageRating || 0,
      activeUsersInWindow: activeLearners,
      totalInactiveUsers: inactiveUsers,
      newUsers: existingMetrics?.overview?.newUsers || 0,
      totalFeedback: existingMetrics?.overview?.totalFeedback || 0,
      sessionCompletionRate:
        existingMetrics?.overview?.sessionCompletionRate ??
        (totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0),
    },
    summary: {
      total: existingMetrics?.summary?.total || totalUsers,
      active: existingMetrics?.summary?.active || activeLearners,
      inactive: existingMetrics?.summary?.inactive ?? inactiveUsers,
      newUsers: existingMetrics?.summary?.newUsers || 0,
    },
    sessions: {
      scheduled:
        existingMetrics?.sessions?.scheduled ??
        (breakdown ? Math.max(0, breakdown.totalSessions - breakdown.completedSessions) : 0),
      completed: existingMetrics?.sessions?.completed || completedSessions,
      canceled: existingMetrics?.sessions?.canceled || 0,
    },
    requests: existingMetrics?.requests,
    topCategories: existingMetrics?.topCategories,
    topUsers: existingMetrics?.topUsers,
    trends: existingMetrics?.trends,
    ratingDistribution: existingMetrics?.ratingDistribution,
  };
};

export const useAdminMetricsStore = create<AdminMetricsState>()((set, get) => ({
  metrics: null,
  publicCounts: null,
  loading: false,
  error: null,

  fetchPublicCounts: async () => {
    try {
      const response = await dedupFetch("public-counts", async () => {
        return fetch(`${API_BASE}public/counts`);
      });

      if (!response.ok) return null;
      const json: PublicCountsResponse = await response.json();
      if (json?.success && json?.data) {
        set((state) => ({
          publicCounts: json.data,
          metrics: buildMetricsFromPublicCounts(json.data, state.metrics),
        }));
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  fetchMetrics: async (token?: string) => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch public/counts for baseline platform counts
      let countsData: PublicCountsData | null = get().publicCounts;
      try {
        const countsRes = await dedupFetch("public-counts", async () => {
          return fetch(`${API_BASE}public/counts`);
        });
        if (countsRes.ok) {
          const countsJson: PublicCountsResponse = await countsRes.json();
          if (countsJson?.success && countsJson?.data) {
            countsData = countsJson.data;
          }
        }
      } catch {
        // Proceed even if public counts fetch encounters network error
      }

      // 2. Fetch admin/metrics if token is provided
      let adminMetrics: AdminMetrics | null = null;
      if (token) {
        try {
          const response = await dedupFetch("admin-metrics", async () => {
            return fetch(`${API_BASE}admin/metrics`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          });

          if (response.ok) {
            adminMetrics = await response.json();
          }
        } catch {
          // Fall back gracefully to public counts
        }
      }

      // 3. Build merged metrics
      const merged = buildMetricsFromPublicCounts(countsData, adminMetrics);

      set({
        metrics: merged,
        publicCounts: countsData,
        loading: false,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error loading metrics";
      set({ error: errorMsg, loading: false });
    } finally {
      set({ loading: false });
    }
  },
}));
