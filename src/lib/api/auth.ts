/**
 * Auth API adapter. Currently a mock so the UI works today.
 * To connect the Express API, set USE_REMOTE = true: every call goes to
 * /api/v1/auth/* with `credentials: "include"` so the session lives in
 * httpOnly cookies set by the server. No tokens are ever stored in localStorage.
 */
export type AuthUser = { id: string; name: string; email: string; phone?: string };
export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; phone: string; email: string; password: string };

const USE_REMOTE = true;
const BASE = "/api/store/api/auth";
const MOCK_COOKIE = "leva_demo_session";

async function remote<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: body === undefined && path === "/me" ? "GET" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? null : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? data?.message ?? "Request failed");
  return data as T;
}

const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));
function setMockCookie(user: AuthUser | null) {
  if (typeof document === "undefined") return;
  document.cookie = user
    ? `${MOCK_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; samesite=lax`
    : `${MOCK_COOKIE}=; path=/; max-age=0`;
}
function readMockCookie(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`${MOCK_COOKIE}=([^;]+)`));
  try {
    return m ? (JSON.parse(decodeURIComponent(m[1] ?? "")) as AuthUser) : null;
  } catch {
    return null;
  }
}

export const authApi = {
  setAutoUser(user: AuthUser | null) {
    setMockCookie(user);
  },
  async login(input: LoginInput): Promise<AuthUser> {
    if (USE_REMOTE) {
      const data = await remote<{ user?: AuthUser; token?: string } & AuthUser>("/login", input);
      const user = data.user || data;
      setMockCookie(user);
      return user;
    }
    await wait();
    const user = { id: "demo", name: input.email.split("@")[0] ?? "friend", email: input.email };
    setMockCookie(user);
    return user;
  },
  async register(input: RegisterInput): Promise<AuthUser> {
    if (USE_REMOTE) {
      const data = await remote<{ user?: AuthUser; token?: string } & AuthUser>("/register", input);
      const user = data.user || data;
      setMockCookie(user);
      return user;
    }
    await wait();
    const user = { id: "demo", name: input.name, email: input.email, phone: input.phone };
    setMockCookie(user);
    return user;
  },
  async forgotPassword(email: string): Promise<void> {
    if (USE_REMOTE) return remote("/forgot-password", { email });
    await wait();
  },
  async refresh(): Promise<void> {
    if (USE_REMOTE) await remote("/refresh", {});
  },
  async logout(): Promise<void> {
    if (USE_REMOTE) await remote("/logout", {}).catch(() => null);
    setMockCookie(null);
  },
  async me(): Promise<AuthUser | null> {
    if (USE_REMOTE) {
      try {
        const data = await remote<{ user?: AuthUser } | AuthUser>("/me");
        if (!data) return null;
        const user = (data as any).user || data;
        setMockCookie(user);
        return user;
      } catch {
        return readMockCookie();
      }
    }
    return readMockCookie();
  },
};
