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
    NEXT_PUBLIC_JURI_API_URL: process.env.NEXT_PUBLIC_JURI_API_URL,
    // NEXT_API_KEY_MASTER removido do bundle client (SEG-003)
    // Usar process.env.NEXT_API_KEY_MASTER apenas em API routes server-side
  },
  // Proteções de segurança contra React2Shell (CVE-2025-55182) e outras vulnerabilidades
  // Headers de segurança
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
