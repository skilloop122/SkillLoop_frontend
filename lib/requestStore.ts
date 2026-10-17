import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { dedupFetch } from "./requestCache";

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
    zoomStartUrl?: string;
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
  zoomStartUrl?: string;
  request?: SessionRequest;
}

export interface ZoomStatus {
  connected: boolean;
  mode: string;
  isConfigured: boolean;
  message: string;
}

/**
 * Guarantees a Zoom join/start URL carries `pwd`, so a meeting never opens to a
 * passcode prompt. The backend embeds it in `zoomJoinUrl`, but the start URL and
 * any locally cached value can predate that fix, so this is applied at the point
 * of opening rather than trusted from a single source.
 */
export function withZoomPasscode(
  url: string | undefined | null,
  passcode?: string | null,
): string | undefined {
  if (!url) return undefined;
  if (!passcode) return url;
  const queryAt = url.indexOf("?");
  const base = queryAt === -1 ? url : url.slice(0, queryAt);
  const params = new URLSearchParams(queryAt === -1 ? "" : url.slice(queryAt + 1));
  if (!params.get("pwd")) params.set("pwd", passcode);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
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
  // Separate from `loading` so request lists are not gated on, or raced by,
  // concurrent action calls that also flip the shared flag.
  requestsLoading: boolean;
  error: string | null;
  sentRequests: SessionRequest[];
  receivedRequests: SessionRequest[];
  sessions: Session[];
  zoomStatus: ZoomStatus | null;
  fetchRequests: () => Promise<{ success: boolean; message?: string }>;
  fetchRequestById: (
    id: string,
  ) => Promise<{ success: boolean; data?: SessionRequest; message?: string }>;
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
  fetchZoomZak: () => Promise<{
    success: boolean;
    data?: { zak: string };
    message?: string;
  }>;
  updateRequestStatus: (
    id: string,
    status: "accepted" | "rejected" | "canceled",
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
    status: "completed",
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
    zoomStartUrl?: string;
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

/**
 * Merges cached values under fresh API values. The cache is only a gap-filler:
 * a session accepted before the backend began embedding `?pwd=` still has a
 * pre-fix URL cached, and that stale value must not keep winning. Empty and
 * null API values are treated as absent so a missing field falls back rather
 * than clobbering a good cached one with a blank.
 */
function preferApiFields<TApi, TCached>(api: TApi, cached: TCached): TApi & TCached {
  const merged: Record<string, unknown> = {
    ...(cached as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(api as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== "") {
      merged[key] = value;
    }
  }
  return merged as TApi & TCached;
}

function enrichWithZoomCache<T extends { session?: SessionRequest["session"] }>(
  item: T,
  cache: SessionZoomCache,
): T {
  if (!item.session?.id) return item;
  const zoom = cache[item.session.id];
  if (!zoom) return item;
  return {
    ...item,
    session: preferApiFields(item.session, zoom) as SessionRequest["session"],
  };
}

function enrichSessionRecord(
  session: Session,
  cache: SessionZoomCache,
): Session {
  const zoom = cache[session.id];
  if (!zoom) return session;
  return preferApiFields(session, zoom);
}

/**
 * The documented `GET /requests/:id` route is not implemented on the current
 * backend: it answers with an HTML 404 page rather than JSON, which is the
 * signature of a missing Express route. Remember that after the first miss so
 * polling stops paying for a request that cannot succeed, and so the route is
 * picked up again automatically if the backend adds it later.
 */
let singleRequestRouteMissing = false;

async function findRequestViaList(id: string, token: string) {
  const response = await fetch(API_BASE + "requests?type=all", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(data?.message || "Failed to fetch requests");

  const list: SessionRequest[] = Array.isArray(data)
    ? data
    : [...(data?.sent || []), ...(data?.received || [])];

  const record = list.find((item) => item?.id === id);
  if (!record) throw new Error("Request not found");
  return record;
}

export const useRequestStore = create<RequestState>((set) => ({
  loading: false,
  requestsLoading: false,
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

  fetchZoomZak: async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(API_BASE + "zoom/zak", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const raw = await response.json();
      if (!response.ok)
        throw new Error(raw.message || "Failed to get Zoom host token");

      return { success: true, data: raw };
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

       const response = await dedupFetch("requests-all", async () => {
         const res = await fetch(API_BASE + "requests", {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
             Authorization: "Bearer " + token,
           },
         });
         return res;
       });
       const data = await response.json();
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
      set({ requestsLoading: true, error: null });
     try {
       const token = useAuthStore.getState().token;
       if (!token) throw new Error("No authentication token found");

       const response = await dedupFetch("requests-type-all", async () => {
         const res = await fetch(API_BASE + "requests?type=all", {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
             Authorization: "Bearer " + token,
           },
         });
         return res;
       });

       const data = await response.json();
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
            requestsLoading: false,
          });
        } else {
          set({
            sentRequests: (data.sent || []).map((r: SessionRequest) =>
              enrichWithZoomCache(r, zoomCache),
            ),
            receivedRequests: (data.received || []).map((r: SessionRequest) =>
              enrichWithZoomCache(r, zoomCache),
            ),
            requestsLoading: false,
          });
        }

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        set({ error: message, requestsLoading: false });
        return { success: false, message };
      }
  },

  /**
   * Single-request fetch used by the session lifecycle poller. Deliberately does
   * not touch the shared loading/error state: a poll that flips a page-level
   * spinner every 20s would regress the loading behaviour, and transient poll
   * failures should stay silent rather than surface as list errors.
   */
  fetchRequestById: async (id: string) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      if (singleRequestRouteMissing) {
        return { success: true, data: await findRequestViaList(id, token) };
      }

      const response = await fetch(API_BASE + "requests/" + id, {
        headers: { Authorization: "Bearer " + token },
      });

      if (response.status === 404) {
        singleRequestRouteMissing = true;
        console.warn(
          "[requestStore] GET /requests/:id is not implemented on the backend; " +
            "session status polling has fallen back to GET /requests?type=all.",
        );
        return { success: true, data: await findRequestViaList(id, token) };
      }

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch request");
      }

      const record = (payload?.data ?? payload) as SessionRequest | undefined;
      if (!record?.id) throw new Error("Request payload missing");

      return { success: true, data: record };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },

  updateRequestStatus: async (
    id: string,
    status: "accepted" | "rejected" | "canceled",
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
            zoomStartUrl: session.zoomStartUrl,
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

      const response = await fetch(API_BASE + "requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const rawResponse = await response.text();


      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = rawResponse;
      }

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

  completeSession: async (sessionId: string, status: "completed") => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        API_BASE + "sessions/" + sessionId + "/complete",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();
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

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const raw = await response.text();

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
      return { success: true, data: slots };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, message };
    }
  },
}));
