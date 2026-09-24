import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { dedupFetch } from "./requestCache";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  link?: string;
  metadata?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: NotificationPagination | null;
  unreadOnly: boolean;
  loading: boolean;
  error: string | null;
  fetchNotifications: (opts?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => Promise<void>;
  fetchNotification: (id: string) => Promise<AppNotification | null>;
  markRead: (id: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
}

function parseNotification(raw: unknown): AppNotification {
  const n = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(n.id ?? ""),
    userId: n.userId ? String(n.userId) : undefined,
    title: String(n.title ?? ""),
    message: n.message ? String(n.message) : undefined,
    type: n.type ? String(n.type) : undefined,
    isRead:
      n.isRead === undefined
        ? undefined
        : Boolean(n.isRead) && n.isRead !== 0 && n.isRead !== "0",
    link: n.link ? String(n.link) : undefined,
    metadata: n.metadata ? String(n.metadata) : undefined,
    createdAt: n.createdAt ? String(n.createdAt) : undefined,
    updatedAt: n.updatedAt ? String(n.updatedAt) : undefined,
  };
}

function parseList(body: unknown): {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: NotificationPagination | null;
} {
  const b = (body ?? {}) as Record<string, unknown>;
  if (body && Array.isArray(body)) {
    return {
      notifications: (body as unknown[]).map(parseNotification),
      unreadCount: 0,
      pagination: null,
    };
  }

  const list: unknown[] = Array.isArray(b.notifications)
    ? (b.notifications as unknown[])
    : Array.isArray(b.items)
      ? (b.items as unknown[])
      : Array.isArray(b.data)
        ? (b.data as unknown[])
        : [];

  const paginationRaw = (b.pagination ?? {}) as Record<string, unknown>;
  const pagination: NotificationPagination | null =
    paginationRaw && typeof paginationRaw === "object"
      ? {
          page: Number(paginationRaw.page ?? 1) || 1,
          limit: Number(paginationRaw.limit ?? 10) || 10,
          total: Number(paginationRaw.total ?? 0) || 0,
          totalPages: Number(paginationRaw.totalPages ?? 1) || 1,
        }
      : null;

  const unreadCount =
    (Number(b.unreadCount) || Number((b.summary as Record<string, unknown>)?.unreadCount)) || 0;

  return { notifications: list.map(parseNotification), unreadCount, pagination };
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  pagination: null,
  unreadOnly: false,
  loading: false,
  error: null,

fetchNotifications: async (opts = {}) => {
     const token = useAuthStore.getState().token;
     if (!token) {
       set({ error: "Not authenticated", loading: false });
       return;
     }

     const page = opts.page ?? 1;
     const limit = opts.limit ?? 10;
     const unreadOnly = opts.unreadOnly ?? false;

     const cacheKey = `notifications-${page}-${limit}-${unreadOnly}`;

     set({ loading: true, error: null, unreadOnly });

     try {
       const response = await dedupFetch(cacheKey, async () => {
         const params = new URLSearchParams({
           page: String(page),
           limit: String(limit),
           unreadOnly: String(unreadOnly),
         });
         const res = await fetch(`${API_BASE}notifications?${params}`, {
           headers: { Authorization: `Bearer ${token}` },
         });
         return res;
       });
       const body = await response.json().catch(() => null);

       if (!response.ok) {
         const message =
           (body as Record<string, unknown>)?.message?.toString() ||
           "Failed to load notifications";
         set({ error: message, loading: false });
         return;
       }

       const parsed = parseList(body);
       set({
         notifications: parsed.notifications,
         unreadCount: parsed.unreadCount,
         pagination: parsed.pagination,
         loading: false,
       });
     } catch {
       set({ error: "Failed to load notifications", loading: false });
     }
   },

  fetchNotification: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token || !id) return null;

    try {
      const response = await fetch(`${API_BASE}notifications/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) return null;

      const b = (body ?? {}) as Record<string, unknown>;
      const raw = (b.notification ?? body) as unknown;
      if (Array.isArray(raw)) return null;
      const notification = parseNotification(raw);
      if (!notification.id) return null;

      set((s) => {
        const notifications = s.notifications.map((n) =>
          n.id === notification.id ? { ...n, ...notification } : n,
        );
        if (s.notifications.length > 0 && notifications.length === s.notifications.length) {
          return { notifications };
        }
        return { notifications };
      });

      return notification;
    } catch {
      return null;
    }
  },

  markRead: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token || !id) return false;

    try {
      const response = await fetch(`${API_BASE}notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;

      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: s.notifications.some((n) => n.id === id && !n.isRead)
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      }));

      return true;
    } catch {
      return false;
    }
  },

  markAllRead: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;

      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.isRead ? n : { ...n, isRead: true },
        ),
        unreadCount: 0,
      }));

      return true;
    } catch {
      return false;
    }
  },

  deleteNotification: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token || !id) return false;

    try {
      const response = await fetch(`${API_BASE}notifications/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;

      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: s.notifications.some((n) => n.id === id && !n.isRead)
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      }));

      return true;
    } catch {
      return false;
    }
  },
}));