"use client";

/**
 * Server-side HTTP client for the admin browser.
 *
 * Every admin fetch should go through here so the Firebase ID token is
 * attached to every request and JSON errors are decoded consistently.
 *
 * Per AGENT_LOG §A.2: the service-role key never leaves the server. The
 * browser only ever talks to /api/admin/* routes, which use requireAdmin
 * server-side. This client never imports Supabase.
 */

import { getIdToken } from "@/lib/auth/get-token";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { method?: string } = {},
): Promise<T> {
  const token = await getIdToken().catch(() => null);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { 
    ...init, 
    headers,
    cache: 'no-store',
    next: { revalidate: 0 }
  });
  const ct = res.headers.get("content-type") ?? "";
  const body = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : res.statusText;
    if (res.status === 401) {
      // Token is invalid/expired — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=1";
      }
      throw new ApiError(401, "Session expired. Please sign in again.", body);
    }
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};