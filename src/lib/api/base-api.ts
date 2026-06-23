import "server-only";

import { cookies } from "next/headers";

/**
 * Server-only API client.
 *
 * `cookies()` (and therefore the access token) is only available in Server
 * Components, Route Handlers, and Server Actions — never import this from a
 * "use client" file. Client code calls our own `/api/backend/*` proxy route
 * instead (see src/app/api/backend/[...path]/route.ts), which uses this
 * module server-side so the access token never has to leave the server.
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:8070";
const ACCESS_TOKEN_COOKIE = "accessToken";

/** Reads the Clerk session token that `src/proxy.ts` mirrors into a cookie on every request. */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
  /** Set to false to call the endpoint without attaching the Authorization header. */
  withAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`Backend request failed: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * The "base API" function: every backend call goes through this so the
 * Authorization header is attached automatically. It reads the access token
 * straight from the (httpOnly) `accessToken` cookie that `src/proxy.ts`
 * keeps in sync with the current Clerk session — callers never have to pass
 * a token around manually.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { withAuth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);

  // Don't force a Content-Type for FormData bodies — fetch needs to set its
  // own `multipart/form-data; boundary=...` value, which we'd clobber by
  // setting "application/json" (or anything else) here.
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!finalHeaders.has("Content-Type") && rest.body && !isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const token = await getAccessTokenFromCookies();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = path.startsWith("http") ? path : `${BACKEND_API_URL}${path}`;

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(response.status, response.statusText, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}
