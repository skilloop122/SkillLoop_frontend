import { create } from "zustand";
import { useAuthStore } from "./authStore";

export interface SessionRequest {
  id: string;
  requesterId: string;
  providerId: string;
  skillListingId: string;
  status: string;
  schedulingLink: string;
  message: string;
  proposedDate: string;
  proposedTime: string;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  provider: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  skillListing: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  session?: {
    id: string;
    status: string;
    scheduledAt: string;
    zoomMeetingId?: string;
    zoomPassword?: string;
    zoomJoinUrl?: string;
  };
  type?: "sent" | "received";
}

export interface Session {
  id: string;
  requestId: string;
  status: string;
  scheduledAt: string;
  zoomMeetingId?: string;
  zoomPassword?: string;
  zoomJoinUrl?: string;
  request?: SessionRequest;
}

export interface ZoomStatus {
  connected: boolean;
  mode: string;
  isConfigured: boolean;
  message: string;
}

export interface ZoomSignature {
  sdkKey: string;
  signature: string;
  meetingNumber: string;
  role: number;
}

export interface SkillSlot {
  startTime: string;
  endTime: string;
}

export interface SkillSlotsResponse {
  date: string;
  day: string;
  slots: SkillSlot[];
}

interface RequestState {
  loading: boolean;
  error: string | null;
  sentRequests: SessionRequest[];
  receivedRequests: SessionRequest[];
  sessions: Session[];
  zoomStatus: ZoomStatus | null;
  fetchRequests: () => Promise<{ success: boolean; message?: string }>;
  fetchSessions: () => Promise<{
    success: boolean;
    data?: Session[];
    message?: string;
  }>;
  checkZoomStatus: () => Promise<{
    success: boolean;
    data?: ZoomStatus;
    message?: string;
  }>;
  fetchZoomSignature: (
    meetingNumber: string,
    role?: number,
  ) => Promise<{ success: boolean; data?: ZoomSignature; message?: string }>;
  updateRequestStatus: (
    id: string,
    status: "accepted" | "rejected" | "cancelled",
  ) => Promise<{ success: boolean; message?: string }>;
  createRequest: (payload: {
    skillListingId: string;
    schedulingLink?: string;
    message?: string;
    proposedDate?: string;
    proposedTime?: string;
  }) => Promise<{ success: boolean; message?: string; data?: SessionRequest }>;
  completeSession: (
    sessionId: string,
  ) => Promise<{ success: boolean; message?: string }>;
  submitFeedback: (
    sessionId: string,
    payload: { rating: number; comment: string },
  ) => Promise<{ success: boolean; message?: string }>;
  fetchSkillSlots: (
    skillId: string,
    date?: string,
  ) => Promise<{
    success: boolean;
    data?: SkillSlotsResponse[];
    message?: string;
  }>;
}

const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

const ZOOM_CACHE_KEY = "SkilLoop-session-zoom-cache";

interface SessionZoomCache {
  [sessionId: string]: {
    zoomMeetingId?: string;
    zoomPassword?: string;
    zoomJoinUrl?: string;
  };
}

function loadZoomCache(): SessionZoomCache {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ZOOM_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveZoomCache(cache: SessionZoomCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ZOOM_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
}

function enrichWithZoomCache<T extends { session?: SessionRequest["session"] }>(
  item: T,
  cache: SessionZoomCache,
): T {
  if (!item.session?.id) return item;
  const zoom = cache[item.session.id];
  if (!zoom) return item;
  return { ...item, session: { ...item.session, ...zoom } };
}

function enrichSessionRecord(
  session: Session,
  cache: SessionZoomCache,
): Session {
  const zoom = cache[session.id];
  if (!zoom) return session;
  return { ...session, ...zoom };
}

export const useRequestStore = create<RequestState>((set) => ({
  loading: false,
  error: null,
  sentRequests: [],
  receivedRequests: [],
  sessions: [],
  zoomStatus: null,

  checkZoomStatus: async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(API_BASE + "zoom/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
      });
      const data: ZoomStatus = await response.json();
      console.log("ZOOM STATUS:", data);
      set({ zoomStatus: data });
      return { success: true, data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },

  fetchZoomSignature: async (meetingNumber: string, role: number = 0) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "zoom/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ meetingNumber, role }),
      });

      const raw = await response.json();
      console.log("ZOOM SIGNATURE:", raw);
      if (!response.ok)
        throw new Error(raw.message || "Failed to get Zoom signature");
      const data: ZoomSignature = raw;

      return { success: true, data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },

  fetchSessions: async () => {
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
      console.log("FETCH SESSIONS RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch sessions");

      const zoomCache = loadZoomCache();
      const sessions: Session[] = (
        Array.isArray(data) ? data : data.sessions || []
      ).map((s: Session) => enrichSessionRecord(s, zoomCache));
      set({ sessions });
      return { success: true, data: sessions };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "requests?type=all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      console.log("FETCH REQUESTS RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch requests");

      const userEmail = useAuthStore.getState().user?.email;
      const zoomCache = loadZoomCache();

      if (Array.isArray(data)) {
        set({
          sentRequests: data
            .filter(
              (r) => r.type === "sent" || r.requester?.email === userEmail,
            )
            .map((r: SessionRequest) => enrichWithZoomCache(r, zoomCache)),
          receivedRequests: data
            .filter(
              (r) => r.type === "received" || r.provider?.email === userEmail,
            )
            .map((r: SessionRequest) => enrichWithZoomCache(r, zoomCache)),
          loading: false,
        });
      } else {
        set({
          sentRequests: (data.sent || []).map((r: SessionRequest) =>
            enrichWithZoomCache(r, zoomCache),
          ),
          receivedRequests: (data.received || []).map((r: SessionRequest) =>
            enrichWithZoomCache(r, zoomCache),
          ),
          loading: false,
        });
      }

      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateRequestStatus: async (
    id: string,
    status: "accepted" | "rejected" | "cancelled",
  ) => {
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
        body: JSON.stringify({ status: status.toUpperCase() }),
      });

      const data = await response.json();
      console.log("UPDATE REQUEST STATUS RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to update request");

      if (status === "accepted") {
        const session = data?.session || data?.data?.session;
        if (session?.id && (session.zoomMeetingId || session.zoomJoinUrl)) {
          const cache = loadZoomCache();
          cache[session.id] = {
            zoomMeetingId: session.zoomMeetingId,
            zoomPassword: session.zoomPassword,
            zoomJoinUrl: session.zoomJoinUrl,
          };
          saveZoomCache(cache);
        }
      }

      set({ loading: false });
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  createRequest: async (payload) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      console.log("CREATE REQUEST PAYLOAD:", JSON.stringify(payload));
      console.log("CREATE REQUEST URL:", API_BASE + "requests");

      const response = await fetch(API_BASE + "requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const rawResponse = await response.text();
      console.log("CREATE REQUEST STATUS:", response.status);
      console.log("CREATE REQUEST RAW RESPONSE:", rawResponse);

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = rawResponse;
      }
      console.log("CREATE REQUEST RESPONSE:", data);
      if (!response.ok)
        throw new Error(
          typeof data === "object"
            ? data.message || data.error || JSON.stringify(data)
            : String(data),
        );

      set({ loading: false });
      return { success: true, data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  completeSession: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        API_BASE + "sessions/" + sessionId + "/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );

      const data = await response.json();
      console.log("COMPLETE SESSION RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to complete session");

      set({ loading: false });
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  submitFeedback: async (
    sessionId: string,
    payload: { rating: number; comment: string },
  ) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        API_BASE + "sessions/" + sessionId + "/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      console.log("SUBMIT FEEDBACK RESPONSE:", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to submit feedback");

      set({ loading: false });
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchSkillSlots: async (skillId: string, date?: string) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const url =
        API_BASE +
        "skills/" +
        skillId +
        "/slots" +
        (date ? "?date=" + encodeURIComponent(date) : "");
      console.log("FETCH SLOTS URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const raw = await response.text();
      console.log("FETCH SLOTS STATUS:", response.status);
      console.log("FETCH SLOTS RAW RESPONSE:", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
      if (!response.ok)
        throw new Error(
          typeof data === "object"
            ? data.message || data.error || JSON.stringify(data)
            : String(data),
        );

      const slots: SkillSlotsResponse[] = Array.isArray(data)
        ? data
        : data &&
            typeof data === "object" &&
            (data.date || Array.isArray(data.slots))
          ? [data]
          : data?.slots || [];
      console.log("FETCH SLOTS PARSED:", slots);
      return { success: true, data: slots };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },
}));
