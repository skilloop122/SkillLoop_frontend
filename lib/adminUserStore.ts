import { create } from "zustand";

export interface AdminUserSkill {
  id: string;
  name: string;
}

export interface AdminUserSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface AdminUserProfile {
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  teachSkills: AdminUserSkill[];
  learnSkills: AdminUserSkill[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  portfolioUrl?: string | null;
  schedule: AdminUserSchedule[];
}

export interface AdminTransaction {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  type?: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  points: number;
  escrowPoints?: number;
  streakCount?: number;
  role: string;
  status?: string;
  createdAt?: string;
  projectIds?: string[];
  profile?: AdminUserProfile;
  transactions?: AdminTransaction[];
}

export interface AdminUserRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  fromUser?: { id: string; firstName?: string; lastName?: string };
  toUser?: { id: string; firstName?: string; lastName?: string };
}

export interface AdminUserSession {
  id: string;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  topic?: string;
  withUser?: { id: string; firstName?: string; lastName?: string };
}

export interface AdminUserFeedback {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  fromUser?: { id: string; firstName?: string; lastName?: string };
}

export interface AdminUserDetailsResponse {
  user: AdminUserDetail;
  profile: AdminUserProfile;
  requests: AdminUserRequest[];
  sessions: AdminUserSession[];
  feedback: AdminUserFeedback[];
}

export interface AdminUserListing {
  id: string;
  email: string;
  points: number;
  role: string;
  status?: string;
  createdAt?: string;
  avatarUrl?: string | null;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
    teachSkills?: AdminUserSkill[];
    learnSkills?: AdminUserSkill[];
  };
  teachSkills?: AdminUserSkill[];
  learnSkills?: AdminUserSkill[];
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

interface AdminUserState {
  loading: boolean;
  error: string | null;
  details: AdminUserDetailsResponse | null;
  getUsers: (
    token: string,
    params?: GetUsersParams,
  ) => Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    message?: string;
  }>;
  fetchUserDetails: (token: string, id: string) => Promise<void>;
  deleteUser: (
    token: string,
    id: string,
  ) => Promise<{ success: boolean; message?: string }>;
  createUser: (
    token: string,
    payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
    },
  ) => Promise<{ success: boolean; message?: string }>;
  changeUserRole: (
    token: string,
    id: string,
    role: string,
  ) => Promise<{ success: boolean; message?: string }>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminUserStore = create<AdminUserState>()((set) => ({
  loading: false,
  error: null,
  details: null,

  getUsers: async (token: string, params?: GetUsersParams) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append("page", String(params.page));
      if (params?.limit !== undefined) queryParams.append("limit", String(params.limit));
      if (params?.search) queryParams.append("search", params.search);
      if (params?.role) queryParams.append("role", params.role);

      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      const response = await fetch(`${API_BASE}admin/users${queryString}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (data as Record<string, unknown>)?.message?.toString() ||
            (data as Record<string, unknown>)?.error?.toString() ||
            "Failed to fetch users",
        );
      }

      set({ loading: false });
      return { success: true, data: data ?? {} };
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "An unknown error occurred";
      set({ loading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  fetchUserDetails: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json();

      if (!response.ok) {
        set({
          error: body?.message || "Failed to load user details",
          loading: false,
        });
        return;
      }

      const raw = body?.data?.user
        ? body.data
        : body?.result?.user
          ? body.result
          : body;

      const rawProfile = raw.profile || {};

      const parseSkillList = (value: unknown) => {
        if (Array.isArray(value))
          return value.filter(
            (s) => s && typeof s === "object" && s.id && s.name,
          );
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed))
              return parsed.filter(
                (s) => s && typeof s === "object" && s.id && s.name,
              );
          } catch {
            /* ignore malformed string */
          }
        }
        return [];
      };

      const parseSchedule = (value: unknown) => {
        if (Array.isArray(value))
          return value.filter((s) => s && typeof s === "object" && s.day);
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed))
              return parsed.filter((s) => s && typeof s === "object" && s.day);
          } catch {
            /* ignore malformed string */
          }
        }
        return [];
      };

      const profile: AdminUserProfile = rawProfile
        ? {
            firstName: rawProfile.firstName || "",
            lastName: rawProfile.lastName || "",
            bio: rawProfile.bio ?? null,
            avatarUrl: rawProfile.avatarUrl ?? null,
            phoneNumber: rawProfile.phoneNumber ?? null,
            teachSkills: parseSkillList(rawProfile.teachSkills),
            learnSkills: parseSkillList(rawProfile.learnSkills),
            linkedinUrl: rawProfile.linkedinUrl ?? null,
            githubUrl: rawProfile.githubUrl ?? null,
            twitterUrl: rawProfile.twitterUrl ?? null,
            portfolioUrl: rawProfile.portfolioUrl ?? null,
            schedule: parseSchedule(rawProfile.schedule),
          }
        : ({} as AdminUserProfile);

      const mapRequest = (r: Record<string, unknown>): AdminUserRequest => {
        const requester = (r.requester || r.fromUser || {}) as Record<
          string,
          unknown
        >;
        const toUser = (r.toUser || r.receiver || r.recipient || {}) as Record<
          string,
          unknown
        >;
        return {
          id: String(r.id || ""),
          status: String(r.status || ""),
          message: r.message ? String(r.message) : undefined,
          createdAt: String(r.createdAt || ""),
          fromUser: {
            id: String(requester.id || ""),
            firstName: requester.firstName
              ? String(requester.firstName)
              : undefined,
            lastName: requester.lastName
              ? String(requester.lastName)
              : undefined,
          },
          toUser: {
            id: String(toUser.id || ""),
            firstName: toUser.firstName ? String(toUser.firstName) : undefined,
            lastName: toUser.lastName ? String(toUser.lastName) : undefined,
          },
        };
      };

      const mapSession = (s: Record<string, unknown>): AdminUserSession => {
        const other = (s.withUser ||
          s.otherUser ||
          s.requester ||
          s.provider ||
          {}) as Record<string, unknown>;
        const skillListing = s.skillListing as
          | Record<string, unknown>
          | undefined;
        return {
          id: String(s.id || ""),
          status: String(s.status || ""),
          scheduledAt: s.scheduledAt ? String(s.scheduledAt) : undefined,
          completedAt: s.completedAt ? String(s.completedAt) : undefined,
          topic: s.topic
            ? String(s.topic)
            : skillListing?.title
              ? String(skillListing.title)
              : String(s.skillName || ""),
          withUser: {
            id: String(other.id || ""),
            firstName: other.firstName ? String(other.firstName) : undefined,
            lastName: other.lastName ? String(other.lastName) : undefined,
          },
        };
      };

      const mapFeedback = (f: Record<string, unknown>): AdminUserFeedback => {
        const giver = (f.giver || f.fromUser || f.user || {}) as Record<
          string,
          unknown
        >;
        return {
          id: String(f.id || ""),
          rating: Number(f.rating) || 0,
          comment: f.comment
            ? String(f.comment)
            : f.comments
              ? String(f.comments)
              : undefined,
          createdAt: String(f.createdAt || ""),
          fromUser: {
            id: String(giver.id || ""),
            firstName: giver.firstName ? String(giver.firstName) : undefined,
            lastName: giver.lastName ? String(giver.lastName) : undefined,
          },
        };
      };

      const normalized: AdminUserDetailsResponse = {
        user: {
          id: raw.id,
          email: raw.email,
          points: raw.points,
          escrowPoints: raw.escrowPoints,
          streakCount: raw.streakCount,
          role: raw.role,
          status: raw.status,
          createdAt: raw.createdAt,
          projectIds: Array.isArray(raw.projectIds)
            ? raw.projectIds.map(String)
            : [],
          profile: Object.keys(rawProfile).length ? profile : undefined,
          transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
        },
        profile,
        requests: [
          ...(raw.requestsSent || []),
          ...(raw.requestsReceived || []),
        ].map(mapRequest),
        sessions: [
          ...(raw.sessionsAsProvider || []),
          ...(raw.sessionsAsRequester || []),
        ].map(mapSession),
        feedback: (raw.feedbackReceived || []).map(mapFeedback),
      };


      set({ details: normalized, loading: false });
    } catch {
      set({ error: "Network error loading user details", loading: false });
    }
  },

  deleteUser: async (token: string, id: string) => {
    try {
      const response = await fetch(`${API_BASE}admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        return {
          success: false,
          message: body?.message || "Failed to delete user",
        };
      return { success: true, message: body?.message };
    } catch {
      return { success: false, message: "Network error deleting user" };
    }
  },

  createUser: async (
    token: string,
    payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
    },
  ) => {
    try {
      const response = await fetch(`${API_BASE}admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        return {
          success: false,
          message: body?.message || "Failed to create user",
        };
      return { success: true, message: body?.message };
    } catch {
      return { success: false, message: "Network error creating user" };
    }
  },

  changeUserRole: async (token: string, id: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE}admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        return {
          success: false,
          message: body?.message || body?.error || "Failed to update role",
        };
      return { success: true, message: body?.message };
    } catch {
      return { success: false, message: "Network error updating role" };
    }
  },
}));
