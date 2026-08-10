import { create } from "zustand";
import { SessionRequest } from "./requestStore";

export interface AdminRequestState {
  loading: boolean;
  error: string | null;
  requests: SessionRequest[];
  total: number;
  fetchRequests: (
    token: string,
    params?: { page?: number; limit?: number; status?: string }
  ) => Promise<{ success: boolean; data?: { requests: SessionRequest[]; total: number }; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminRequestStore = create<AdminRequestState>()((set) => ({
  loading: false,
  error: null,
  requests: [],
  total: 0,

  fetchRequests: async (token, params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.status) query.set("status", params.status);

      const url = `${API_BASE}admin/requests` + (query.toString() ? "?" + query.toString() : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = body?.message || "Failed to load requests";
        set({ error: errorMsg, loading: false });
        return { success: false, message: errorMsg };
      }

      const requests = Array.isArray(body) ? body : (body?.requests || body?.data || []);
      const total = body?.total || requests.length;

      set({ requests, total, loading: false });
      return { success: true, data: { requests, total } };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
}));
