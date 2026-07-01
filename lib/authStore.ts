import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  hydrated: boolean;

  setHydrated: (state: boolean) => void;

  register: (
    payload: RegisterPayload,
  ) => Promise<{ success: boolean; message: string }>;

  login: (
    payload: LoginPayload,
  ) => Promise<{ success: boolean; message: string }>;

  me: () => Promise<{
    success: boolean;
    message: string;
    user?: User;
  }>;

  logout: () => Promise<void>;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      loading: false,
      error: null,
      user: null,
      token: null,
      hydrated: false,

      setHydrated: (state) => set({ hydrated: state }),

      register: async ({ email, password, firstName, lastName }) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              firstName,
              lastName,
            }),
          });

          const body = await response.json();

          console.log("REGISTER RESPONSE:", body);
          console.log("REGISTER STATUS:", response.status);

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Registration failed",
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
            "REGISTER TOKEN EXTRACTED:",
            token ? token.substring(0, 20) + "..." : null,
          );

          const registerUser = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

          console.log("REGISTER USER:", registerUser);

          set({
            user: registerUser,
            token,
          });

          return {
            success: true,
            message: body?.message || "Registration successful",
          };
        } catch {
          return {
            success: false,
            message: "Registration failed",
          };
        } finally {
          set({ loading: false });
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          const body = await response.json();

          console.log("LOGIN RESPONSE:", body);
          console.log("LOGIN STATUS:", response.status);

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Login failed",
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
            "LOGIN TOKEN EXTRACTED:",
            token ? token.substring(0, 20) + "..." : null,
          );

          const loginUser = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

          console.log("LOGIN USER:", loginUser);

          set({
            user: loginUser,
            token,
          });

          return {
            success: true,
            message: body?.message || "Login successful",
          };
        } catch {
          return {
            success: false,
            message: "Login failed",
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
            return {
              success: false,
              message: "No token found",
            };
          }

          const response = await fetch(`${API_BASE}auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const body = await response.json();

          console.log("ME RESPONSE:", body);
          console.log("ME STATUS:", response.status);

          if (!response.ok) {
            return {
              success: false,
              message: body?.message || "Failed",
            };
          }

          const meUser = body?.user || {
            id: body?.id,
            email: body?.email,
            firstName: body?.profile?.firstName || body?.firstName,
            lastName: body?.profile?.lastName || body?.lastName,
          };

          set({
            user: meUser,
          });

          return {
            success: true,
            message: "Loaded",
            user: meUser,
          };
        } catch {
          return {
            success: false,
            message: "Error loading user",
          };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          const token = get().token;
          if (token) {
            await fetch(`${API_BASE}auth/logout`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch {
          // ignore API errors — still clear local state
        }
        set({ token: null, user: null, error: null });
      },
    }),
    {
      name: "skillloop-auth",

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        console.log("AUTH STORE REHYDRATED");

        state?.setHydrated(true);
      },
    },
  ),
);
