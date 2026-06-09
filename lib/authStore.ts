import { create } from "zustand";

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
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message: string }>;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message: string }>;
  me: () => Promise<{ success: boolean; message: string; user?: User }>;
}

const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ? process.env.NEXT_PUBLIC_API_URL : "";

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: false,
  error: null,
  user: null,
  token: null,
  register: async ({ email, password, firstName, lastName }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message = body?.message || "Registration failed. Please try again.";
        set({ error: message });
        return { success: false, message };
      }

      set({
        user: body?.user ?? { email },
        token: body?.token ?? null,
      });

      return { success: true, message: body?.message || "Registration successful." };
    } catch (err) {
      const message = "Registration failed. Please try again.";
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },
  login: async ({ email, password }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        let message = body?.message || "Login failed. Please try again.";
        if (response.status === 401) {
          message = "Wrong email or password.";
        } else if (response.status === 404) {
          message = "No account found for this email.";
        } else if (response.status === 400 && body?.message?.toLowerCase()?.includes("email")) {
          message = "Please check your email address.";
        }
        set({ error: message });
        return { success: false, message };
      }

      set({
        user: body?.user ?? { email },
        token: body?.token ?? null,
      });

      return { success: true, message: body?.message || "Login successful." };
    } catch (err) {
      const message = "Login failed. Please try again.";
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },
  me: async () => {
    set({ loading: true, error: null });

    try {
      const token = get().token;
      if (!token) {
        const message = "No auth token found.";
        set({ error: message });
        return { success: false, message };
      }

      const response: Response = await fetch(`${API_BASE}auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body= await response.json().catch(() => null);
      if (!response.ok) {
        const message: string = body?.message || "Unable to fetch current user.";
        set({ error: message });
        return { success: false, message };
      }

      set({ user: body?.user ?? null });
      return { success: true, message: body?.message || "Current user loaded.", user: body?.user };
    } catch (err) {
      const message = "Unable to fetch current user.";
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },
}));
