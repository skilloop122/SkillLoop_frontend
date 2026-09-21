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

interface GoogleAuthPayload {
  idToken: string;
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

  googleAuth: (
    payload: GoogleAuthPayload,
  ) => Promise<{ success: boolean; message: string }>;

  forgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;

  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;

  verifyOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; message: string }>;

  resendOtp: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;

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


          const registerUser = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

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

          const body = await response.json().catch(() => null);

          // console.log(
          //   "POST /auth/login ->",
          //   response.status,
          //   JSON.stringify(body),
          // );

          if (!response.ok) {
            const message =
              body?.message ||
              body?.error ||
              body?.detail ||
              "Invalid credentials";
            set({ error: message });
            return {
              success: false,
              message,
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

          const loginUser = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

          set({
            user: loginUser,
            token,
          });

          return {
            success: true,
            message: body?.message || "Login successful",
          };
        } catch (err) {
          const message =
            err instanceof Error && err.message
              ? `Login failed: ${err.message}`
              : "Login failed";
          set({ error: message });
          return {
            success: false,
            message,
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

      googleAuth: async ({ idToken }) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          });

          const body = await response.json().catch(() => null);

          // console.log(
          //   "POST /auth/google ->",
          //   response.status,
          //   JSON.stringify(body),
          // );

          if (!response.ok) {
            const errMsg =
              body?.message ||
              body?.error ||
              body?.detail ||
              "Google authentication failed";
            set({ error: errMsg });
            return { success: false, message: errMsg };
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


          const googleUser = body?.user ||
            body?.data?.user || {
              id: body?.id,
              email: body?.email,
              firstName: body?.profile?.firstName || body?.firstName,
              lastName: body?.profile?.lastName || body?.lastName,
            };

         
          set({ user: googleUser, token });

          return {
            success: true,
            message: body?.message || "Google authentication successful",
          };
        } catch (err) {
          console.error("GOOGLE AUTH ERROR:", err);
          const message =
            err instanceof Error && err.message
              ? `Google authentication failed: ${err.message}`
              : "Google authentication failed";
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ loading: false });
        }
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/forgot-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const body = await response.json().catch(() => null);

          // console.log(
          //   "POST /auth/forgot-password ->",
          //   response.status,
          //   JSON.stringify(body),
          // );

          if (!response.ok) {
            const message =
              body?.message ||
              body?.error ||
              body?.detail ||
              "Failed to request password reset";
            set({ error: message });
            return { success: false, message };
          }

          set({ error: null });
          return {
            success: true,
            message:
              body?.message ||
              "If an account exists for that email, a reset link has been sent.",
          };
        } catch (err) {
          const message =
            err instanceof Error && err.message
              ? `Failed to request password reset: ${err.message}`
              : "Failed to request password reset";
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/reset-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, newPassword }),
          });

          const body = await response.json().catch(() => null);

          if (!response.ok) {
            const message =
              body?.message ||
              body?.error ||
              body?.detail ||
              "Password reset failed";
            set({ error: message });
            return { success: false, message };
          }

          set({ error: null });
          return {
            success: true,
            message: body?.message || "Password reset successful",
          };
        } catch (err) {
          const message =
            err instanceof Error && err.message
              ? `Password reset failed: ${err.message}`
              : "Password reset failed";
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (email, otp) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/verify-otp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp }),
          });

          const body = await response.json().catch(() => null);

          // console.log(
          //   "POST /auth/verify-otp ->",
          //   response.status,
          //   JSON.stringify(body),
          // );

          if (!response.ok) {
            const message =
              body?.message ||
              body?.error ||
              body?.detail ||
              "OTP verification failed";
            set({ error: message });
            return { success: false, message };
          }

          set({ error: null });
          return {
            success: true,
            message: body?.message || "OTP verified successfully",
          };
        } catch (err) {
          const message =
            err instanceof Error && err.message
              ? `OTP verification failed: ${err.message}`
              : "OTP verification failed";
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ loading: false });
        }
      },

      resendOtp: async (email) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}auth/resend-otp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const body = await response.json().catch(() => null);

          // console.log(
          //   "POST /auth/resend-otp ->",
          //   response.status,
          //   JSON.stringify(body),
          // );

          if (!response.ok) {
            const message =
              body?.message ||
              body?.error ||
              body?.detail ||
              "Failed to resend OTP";
            set({ error: message });
            return { success: false, message };
          }

          set({ error: null });
          return {
            success: true,
            message: body?.message || "OTP resent successfully",
          };
        } catch (err) {
          const message =
            err instanceof Error && err.message
              ? `Failed to resend OTP: ${err.message}`
              : "Failed to resend OTP";
          set({ error: message });
          return { success: false, message };
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
      name: "SkilLoop-auth",

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
