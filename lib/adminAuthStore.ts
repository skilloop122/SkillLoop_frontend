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

interface AdminAuthState {
  loading: boolean;
  error: string | null;
  admin: AdminUser | null;
  token: string | null;
  hydrated: boolean;

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

      setHydrated: (state) => set({ hydrated: state }),

      register: async ({ email, password, firstName, lastName, secret, learnSkills, schedule }) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}admin/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, firstName, lastName, secret, learnSkills, schedule }),
          });

          const body = await response.json();

          console.log("ADMIN REGISTER RESPONSE:", body);
          console.log("ADMIN REGISTER STATUS:", response.status);

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

          console.log(
            "ADMIN REGISTER TOKEN:",
            token ? token.substring(0, 20) + "..." : null,
          );

          const registerAdmin =
            body?.user ||
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

          console.log("ADMIN LOGIN RESPONSE:", body);
          console.log("ADMIN LOGIN STATUS:", response.status);

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

          console.log(
            "ADMIN LOGIN TOKEN:",
            token ? token.substring(0, 20) + "..." : null,
          );

          const loginAdmin =
            body?.user ||
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

          console.log("ADMIN ME STATUS:", response.status);
          console.log("ADMIN ME RESPONSE:", body);

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

      logout: () =>
        set({
          token: null,
          admin: null,
          error: null,
        }),
    }),
    {
      name: "skillloop-admin-auth",

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
