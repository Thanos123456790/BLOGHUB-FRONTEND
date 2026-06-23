import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// VLN-02 FIX: /api/backend is NO LONGER public.
// All routes (including the BFF proxy) require authentication except /login.
const isPublicRoute = createRouteMatcher([
  "/login(.*)",
]);

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Redirects unauthenticated users to NEXT_PUBLIC_CLERK_SIGN_IN_URL (/login).
    await auth.protect();
  }

  const { userId, sessionId, getToken } = await auth();
  const response = NextResponse.next();

  // VLN-14 FIX: Derive HTTPS from the actual request protocol, not from a
  // Vercel-specific env var. This works on Vercel, AWS, Railway, and any
  // reverse-proxy that forwards the original scheme via X-Forwarded-Proto
  // (Next.js automatically reads this and reflects it in req.nextUrl.protocol).
  // Only localhost without HTTPS gets secure:false — everywhere else it's true.
  const isHttps = req.nextUrl.protocol === "https:";

  if (userId) {
    try {
      const token = await getToken();
      if (token) {
        response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
          httpOnly: true,
          secure: isHttps,
          // VLN-CSRF FIX: Use 'strict' instead of 'lax' so the auth cookie is
          // never sent on cross-site navigations initiated by third-party pages.
          sameSite: "strict",
          path: "/",
          maxAge: 60,
        });
      }

      if (sessionId) {
        response.cookies.set(REFRESH_TOKEN_COOKIE, sessionId, {
          httpOnly: true,
          secure: isHttps,
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    } catch {
      // Token retrieval can fail transiently; the next request will retry.
    }
  } else {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
