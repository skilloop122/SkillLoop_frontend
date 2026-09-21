import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Schedule {
  day: string;
  time: string;
}

interface AdminRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  secret: string;
  learnSkills?: string[];
  schedule?: Schedule[];
}

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminUser {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface SkillPointSettings {
  id?: string;
  welcomeBonusPoints: number;
  baseSessionCost: number;
  reciprocalDiscountPercent: number;
  feedbackRewardPoints: number;
  firstSessionBonus: number;
  streakBonusPerCount: number;
  maxStreakBonus: number;
  dailyPayoutCap: number;
  ratingFiveMultiplier: number;
  ratingFourMultiplier: number;
  ratingThreeMultiplier: number;
  ratingTwoMultiplier: number;
  ratingOneMultiplier: number;
  updatedAt?: string;
}

interface AdminAuthState {
  loading: boolean;
  error: string | null;
  admin: AdminUser | null;
  token: string | null;
  hydrated: boolean;
  skillPointSettings: SkillPointSettings | null;

  setHydrated: (state: boolean) => void;

  register: (
    payload: AdminRegisterPayload,
  ) => Promise<{ success: boolean; message: string }>;

  login: (
    payload: AdminLoginPayload,
  ) => Promise<{ success: boolean; message: string }>;

  me: () => Promise<{
    success: boolean;
    message: string;
    admin?: AdminUser;
  }>;

  getSkillPointSettings: () => Promise<{
    success: boolean;
    message: string;
    settings?: SkillPointSettings;
  }>;

  updateSkillPointSettings: (
    data: Partial<SkillPointSettings>,
  ) => Promise<{ success: boolean; message: string }>;

  logout: () => void;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
loading: false,
  error: null,
  admin: null,
  token: null,
  hydrated: false,
  skillPointSettings: null,

      setHydrated: (state) => set({ hydrated: state }),

      register: async ({
        email,
        password,
        firstName,
        lastName,
        secret,
        learnSkills,
        schedule,
      }) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}admin/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              firstName,
              lastName,
              secret,
              learnSkills,
              schedule,
            }),
          });

          const body = await response.json();

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Admin registration failed",
            };
          }

          const token =
            body?.access_token ||
            body?.accessToken ||
            body?.token ||
            body?.data?.access_token ||
            body?.data?.accessToken ||
            body?.data?.token ||
            body?.result?.access_token ||
            null;

          const registerAdmin = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

          set({
            admin: registerAdmin,
            token,
          });

          return {
            success: true,
            message: body?.message || "Admin registration successful",
          };
        } catch {
          return {
            success: false,
            message: "Admin registration failed",
          };
        } finally {
          set({ loading: false });
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const body = await response.json();

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Admin login failed",
            };
          }

          const token =
            body?.access_token ||
            body?.accessToken ||
            body?.token ||
            body?.data?.access_token ||
            body?.data?.accessToken ||
            body?.data?.token ||
            body?.result?.access_token ||
            null;

          
          const loginAdmin = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

          set({
            admin: loginAdmin,
            token,
          });

          return {
            success: true,
            message: body?.message || "Admin login successful",
          };
        } catch {
          return {
            success: false,
            message: "Admin login failed",
          };
        } finally {
          set({ loading: false });
        }
      },

      me: async () => {
        set({ loading: true });

        try {
          const token = get().token;

          if (!token) {
            return { success: false, message: "No token found" };
          }

          const response = await fetch(`${API_BASE}auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const body = await response.json();

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Failed",
            };
          }

          const meAdmin = body?.user || {
            id: body?.id,
            email: body?.email,
            firstName: body?.profile?.firstName || body?.firstName,
            lastName: body?.profile?.lastName || body?.lastName,
          };

          set({ admin: meAdmin });

          return { success: true, message: "Loaded", admin: meAdmin };
        } catch {
          return { success: false, message: "Error loading admin" };
        } finally {
          set({ loading: false });
        }
      },

      getSkillPointSettings: async () => {
        set({ loading: true });

        try {
          const token = get().token;
          const response = await fetch(`${API_BASE}admin/skillpoint-settings`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const body = await response.json();

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Failed to fetch SkillPoint settings",
            };
          }

          const settings: SkillPointSettings = body?.settings || body?.data?.settings || body;

          set({ skillPointSettings: settings, loading: false });

          return {
            success: true,
            message: body?.message || "SkillPoint settings retrieved successfully",
            settings,
          };
        } catch {
          set({ loading: false });
          return {
            success: false,
            message: "Failed to fetch SkillPoint settings",
          };
        }
      },

      updateSkillPointSettings: async (data) => {
        set({ loading: true });

        try {
          const token = get().token;
          const response = await fetch(`${API_BASE}admin/skillpoint-settings`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          const body = await response.json();

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Failed to update SkillPoint settings",
            };
          }

          set({ skillPointSettings: body?.settings || body?.data?.settings || null, loading: false });

          return {
            success: true,
            message: body?.message || "SkillPoint settings updated successfully",
          };
        } catch {
          set({ loading: false });
          return {
            success: false,
            message: "Failed to update SkillPoint settings",
          };
        }
      },

      logout: () =>
        set({
          token: null,
          admin: null,
          error: null,
        }),
    }),
    {
      name: "SkilLoop-admin-auth",

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
      }),

      onRehydrateStorage: () => (state) => {
        console.log("ADMIN AUTH STORE REHYDRATED");
        state?.setHydrated(true);
      },
    },
  ),
);
