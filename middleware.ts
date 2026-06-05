import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "prosolutti_accessToken";

const PUBLIC_PATHS = ["/login", "/maintenance", "/api/auth", "/health"];

const getMaintenanceMode = () => {
  return (
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1" ||
    process.env.MAINTENANCE_MODE === "1"
  );
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function generateNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

function buildSecurityHeaders(request: NextRequest, nonce: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  let apiOrigin = "";

  try {
    if (apiUrl) {
      apiOrigin = new URL(apiUrl).origin;
    }
  } catch {}

  // Derivar a origem WebSocket a partir da URL da API (ws: genérico é muito permissivo)
  let wsOrigin = "";
  try {
    if (apiOrigin) {
      wsOrigin = apiOrigin.replace(/^https?:\/\//, (m) =>
        m === "https://" ? "wss://" : "ws://",
      );
    }
  } catch {}

  const connectSrc = ["'self'", apiOrigin, wsOrigin]
    .filter(Boolean)
    .join(" ");
  const isDev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      // 'unsafe-inline' é ignorado por browsers com strict-dynamic (CSP3);
      // serve de fallback para browsers CSP2 que não suportam strict-dynamic.
      // 'self' removido pois é ignorado quando strict-dynamic está presente.
      : `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    // worker-src necessário para PDF.js (react-pdf) que carrega um worker JS
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "x-nonce": nonce,
    "x-pathname": request.nextUrl.pathname,
  };
}

function applySecurityHeaders(
  response: NextResponse,
  request: NextRequest,
  nonce: string,
) {
  const headers = buildSecurityHeaders(request, nonce);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMaintenancePage = pathname === "/maintenance";
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // 🔒 Proteção básica contra path malicioso
  if (
    pathname.includes("..") ||
    pathname.includes("//") ||
    /[<>\"'%;()&+]/.test(pathname)
  ) {
    return applySecurityHeaders(
      new NextResponse("Invalid path", { status: 400 }),
      request,
      nonce,
    );
  }

  const isMaintenanceMode = getMaintenanceMode();

  // 🚧 Se estiver em manutenção
  if (isMaintenanceMode) {
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
    ) {
      return applySecurityHeaders(
        NextResponse.next({ request: { headers: requestHeaders } }),
        request,
        nonce,
      );
    }

    if (!isMaintenancePage) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/maintenance", request.url)),
        request,
        nonce,
      );
    }

    return applySecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      request,
      nonce,
    );
  }

  // 🔄 Se saiu da manutenção e está na página de maintenance
  if (!isMaintenanceMode && isMaintenancePage) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
      request,
      nonce,
    );
  }

  // ✅ Rotas públicas: não verificar token
  if (isPublicPath(pathname)) {
    return applySecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      request,
      nonce,
    );
  }

  // 🔐 Verificação JWT server-side (SEG-011)
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
      request,
      nonce,
    );
  }

  const jwtSecret = process.env.JWT_SECRET_KEY;
  if (!jwtSecret) {
    // Má configuração de deploy — retorna 500 para não deletar cookies válidos
    // nem prender o usuário em loop de redirecionamento
    console.error("[middleware] CRITICAL: JWT_SECRET_KEY não configurada");
    return applySecurityHeaders(
      new NextResponse("Erro de configuração do servidor", { status: 500 }),
      request,
      nonce,
    );
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    await jwtVerify(token, secret);
    return applySecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      request,
      nonce,
    );
  } catch {
    // Token expirado ou inválido — limpa o cookie e redireciona
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return applySecurityHeaders(response, request, nonce);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
