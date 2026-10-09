import { create } from "zustand";
import { authApi, type AuthUser, type LoginInput, type RegisterInput } from "@/lib/api/auth";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  init: () => Promise<void>;
  login: (i: LoginInput) => Promise<void>;
  register: (i: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

/** In-memory only; the session itself lives in cookies managed by the auth API. */
export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
  init: async () => {
    if (get().ready) return;
    set({ user: await authApi.me(), ready: true });
  },
  login: async (i) => set({ user: await authApi.login(i) }),
  register: async (i) => set({ user: await authApi.register(i) }),
  logout: async () => {
    await authApi.logout();
    set({ user: null });
  },
}));
