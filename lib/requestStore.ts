import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface SessionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  skillId: string;
  skillName: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  proposedTime: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
  receiver?: {
    firstName: string;
    lastName: string;
  };
}

interface RequestState {
  loading: boolean;
  error: string | null;
  sentRequests: SessionRequest[];
  receivedRequests: SessionRequest[];
  fetchRequests: () => Promise<{ success: boolean; message?: string }>;
  updateRequestStatus: (id: string, status: "accepted" | "rejected" | "cancelled") => Promise<{ success: boolean; message?: string }>;
}

const API_BASE = typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : "";

export const useRequestStore = create < RequestState > ( (set) => ({
  loading: false,
  error: null,
  sentRequests: [],
  receivedRequests: [],

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      console.log("FETCH REQUESTS RESPONSE:", data);
      if (!response.ok) throw new Error(data.message || "Failed to fetch requests");

      const userId = useAuthStore.getState().user?.email;

      if (Array.isArray(data)) {
         // simplified logic if it returns a flat list
         set({
           sentRequests: data.filter(r => r.type === 'sent' || r.senderId === userId),
           receivedRequests: data.filter(r => r.type === 'received' || r.receiverId === userId),
           loading: false
         });
      } else {
        set({
          sentRequests: data.sent || [],
          receivedRequests: data.received || [],
          loading: false
        });
      }
      
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateRequestStatus: async (id: string, status: "accepted" | "rejected" | "cancelled") => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "requests/" + id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      console.log("UPDATE REQUEST STATUS RESPONSE:", data);
      if (!response.ok) throw new Error(data.message || "Failed to update request");

      set({ loading: false });
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },
}));
