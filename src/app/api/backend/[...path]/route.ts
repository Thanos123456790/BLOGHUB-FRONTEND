import { NextResponse, type NextRequest } from "next/server";

import { ApiError, apiFetch } from "@/lib/api/base-api";

/**
 * Secure backend proxy (BFF pattern).
 *
 * The Clerk access token lives in an httpOnly cookie (set in src/proxy.ts),
 * which client-side JS can never read — by design. So RTK Query in the
 * browser never talks to the real backend directly; it calls THIS route
 * (same-origin, so the httpOnly cookie travels automatically), which
 * forwards the request to the real backend through `apiFetch()`
 * (src/lib/api/base-api.ts), attaching `Authorization: Bearer <token>`
 * server-side. The token never touches the browser's JS-accessible surface.
 *
 *   browser --(cookie, no token visible to JS)--> /api/backend/<path>
 *     --(Authorization: Bearer <token>, server-side only)--> real backend
 */

const API_PREFIX = "/api/v1";

async function forward(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search; // includes leading "?" or ""
  const targetPath = `${API_PREFIX}/${path.join("/")}${search}`;

  const method = request.method;
  const contentType = request.headers.get("content-type") ?? "";

  let body: BodyInit | undefined;
  let headers: HeadersInit | undefined;

  if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
    if (contentType.includes("multipart/form-data")) {
      // Re-encode as FormData so fetch can generate a fresh, correct
      // boundary rather than us trying to pass the raw stream through.
      body = await request.formData();
    } else {
      const text = await request.text();
      if (text) {
        body = text;
        headers = { "Content-Type": "application/json" };
      }
    }
  }

  try {
    const data = await apiFetch(targetPath, { method, body, headers });
    return NextResponse.json(data ?? {}, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      // Forward the backend's own ErrorResponseDTO body + status untouched
      // so the frontend can show real validation/auth errors.
      try {
        const parsed = JSON.parse(error.body);
        return NextResponse.json(parsed, { status: error.status });
      } catch {
        return NextResponse.json(
          { status: error.status, error: "BACKEND_ERROR", message: error.message },
          { status: error.status }
        );
      }
    }

    return NextResponse.json(
      {
        status: 502,
        error: "BACKEND_UNREACHABLE",
        message:
          error instanceof Error
            ? error.message
            : "Couldn't reach the backend. Is it running?",
      },
      { status: 502 }
    );
  }
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return forward(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return forward(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return forward(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return forward(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return forward(request, (await params).path);
}
