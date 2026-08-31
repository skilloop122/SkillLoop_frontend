import { create } from "zustand";
import { useAuthStore } from "./authStore";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export type TransactionReason =
  | "WELCOME_BONUS"
  | "SESSION_COMPLETED"
  | "FEEDBACK_REWARD"
  | "STREAK_REWARD"
  | "REFERRAL_REWARD"
  | "SKILL_LEARNED"
  | "SESSION_DEDUCTED"
  | string;

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: TransactionReason;
  sessionId?: string;
  createdAt: string;
}

export interface PointsHistory {
  points: number;
  escrowPoints: number;
  availablePoints: number;
  streakCount: number;
  transactions: PointTransaction[];
}

interface PointsState {
  data: PointsHistory | null;
  loading: boolean;
  error: string | null;
  fetchPointsHistory: () => Promise<void>;
}

export const usePointsStore = create<PointsState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchPointsHistory: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "Not authenticated", loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}users/points/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await response.json();

      if (!response.ok) {
        set({ error: body?.message || "Failed to load points history", loading: false });
        return;
      }

      set({ data: body, loading: false });
    } catch {
      set({ error: "Failed to load points history", loading: false });
    }
  },
}));
