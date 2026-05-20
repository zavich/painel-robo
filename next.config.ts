import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackBuildWorker: false,
  },
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // NEXT_API_KEY_MASTER removido do bundle client (SEG-003)
    // Usar process.env.NEXT_API_KEY_MASTER apenas em API routes server-side
  },
  // Proteções de segurança contra React2Shell (CVE-2025-55182) e outras vulnerabilidades
  // Headers de segurança
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    // Extract origin from API URL for connect-src (e.g., https://api.example.com)
    let apiOrigin = "";
    try {
      if (apiUrl) apiOrigin = new URL(apiUrl).origin;
    } catch {}

    const connectSrc = ["'self'", apiOrigin, "ws:", "wss:"]
      .filter(Boolean)
      .join(" ");

    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src ${connectSrc}`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
