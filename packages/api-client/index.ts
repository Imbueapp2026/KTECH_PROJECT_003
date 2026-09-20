/**
 * Shared API client for both admin and public apps
 * Provides a base HTTP client with error handling
 */

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestConfig extends RequestInit {
  method?: string;
  headers?: HeadersInit;
}

async function request<T>(
  path: string,
  init: RequestConfig = {},
  getAuthHeaders?: () => Promise<Record<string, string>>
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (getAuthHeaders) {
    const authHeaders = await getAuthHeaders().catch(() => ({}));
    Object.entries(authHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  const res = await fetch(path, { ...init, headers });
  const ct = res.headers.get("content-type") ?? "";
  const body = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : res.statusText;
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}

export function createApiClient(getAuthHeaders?: () => Promise<Record<string, string>>) {
  return {
    get: <T>(path: string) => request<T>(path, { method: "GET" }, getAuthHeaders),
    post: <T>(path: string, data?: unknown) =>
      request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) }, getAuthHeaders),
    patch: <T>(path: string, data?: unknown) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}) }, getAuthHeaders),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }, getAuthHeaders),
  };
}
