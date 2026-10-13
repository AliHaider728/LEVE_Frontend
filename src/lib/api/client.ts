/** Public API origin only; no server secrets belong here. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://leva-backend.vercel.app" : "http://127.0.0.1:5001")).trim().replace(/\/+$/, "");
export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: "configuration" | "network" | "http" | "invalid-response") { super(message); this.name = "ApiError"; }
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiError("The store connection is not configured yet.", 0, "configuration");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(API_URL + path, {
      ...options, credentials: "include", cache: "no-store",
      headers: { Accept: "application/json", "X-Leva-Storefront": "1", ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
      signal: options.signal ?? controller.signal,
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body && typeof body === "object" ? body as Record<string, unknown> : {};
      throw new ApiError(typeof detail.error === "string" ? detail.error : typeof detail.message === "string" ? detail.message : "The store could not complete this request. Please try again.", response.status, "http");
    }
    if (body === null) throw new ApiError("The store returned an unexpected response.", response.status, "invalid-response");
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("We couldn't reach the store. Please try again in a moment.", 0, "network");
  } finally { clearTimeout(timeout); }
}
