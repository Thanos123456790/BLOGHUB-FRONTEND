import type { NextConfig } from "next";

// ─── Clerk domains ────────────────────────────────────────────────────────────
// Clerk uses Cloudflare Turnstile for CAPTCHA (challenges.cloudflare.com)
// and hosts its hosted sign-in UI on *.clerk.accounts.dev / accounts.*.clerk.com.
// All of these must be reachable via frame-src, script-src, and connect-src.
const CLERK_SCRIPT_HOSTS = [
  "https://clerk.accounts.dev",
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
  "https://accounts.clerk.dev",
  "https://*.accounts.dev",
].join(" ");

const CLERK_FRAME_HOSTS = [
  "https://clerk.accounts.dev",
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
  "https://accounts.clerk.dev",
  "https://*.accounts.dev",
  // Cloudflare Turnstile CAPTCHA — required by Clerk's bot-protection
  "https://challenges.cloudflare.com",
].join(" ");

const CLERK_CONNECT_HOSTS = [
  "https://clerk.accounts.dev",
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
  "https://accounts.clerk.dev",
  "https://*.accounts.dev",
  // Turnstile makes network calls to Cloudflare
  "https://challenges.cloudflare.com",
].join(" ");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    // DENY blocks Clerk's own hosted sign-in iframe flows.
    // SAMEORIGIN allows only same-origin frames (sufficient protection against clickjacking).
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",

      // Scripts: self + Clerk UI + Cloudflare Turnstile CAPTCHA script
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${CLERK_SCRIPT_HOSTS} https://challenges.cloudflare.com`,

      // Styles: Clerk injects inline styles
      "style-src 'self' 'unsafe-inline'",

      // Images: self + S3 + Unsplash + Clerk avatars
      "img-src 'self' data: blob: https://*.s3.amazonaws.com https://*.amazonaws.com https://images.unsplash.com https://img.clerk.com https://*.clerk.com",

      // Fonts: self only
      "font-src 'self' https://fonts.gstatic.com",

      // Fetch / XHR / WebSocket: self + Clerk APIs + Turnstile
      `connect-src 'self' ${CLERK_CONNECT_HOSTS}`,

      // Frames: Clerk hosted UI iframes + Cloudflare Turnstile CAPTCHA iframe
      `frame-src ${CLERK_FRAME_HOSTS}`,

      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",

      // frame-ancestors: allow Clerk to embed this app inside its own flow if needed,
      // while still blocking arbitrary 3rd-party framing (clickjacking protection).
      "frame-ancestors 'self'",

      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
