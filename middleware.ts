import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "prosolutti_accessToken";

const PUBLIC_PATHS = ["/login", "/maintenance", "/api/auth"];

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMaintenancePage = pathname === "/maintenance";

  // 🔒 Proteção básica contra path malicioso
  if (
    pathname.includes("..") ||
    pathname.includes("//") ||
    /[<>\"'%;()&+]/.test(pathname)
  ) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const isMaintenanceMode = getMaintenanceMode();

  // 🚧 Se estiver em manutenção
  if (isMaintenanceMode) {
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
    ) {
      return NextResponse.next();
    }

    if (!isMaintenancePage) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }

    return NextResponse.next();
  }

  // 🔄 Se saiu da manutenção e está na página de maintenance
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Rotas públicas: não verificar token
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 🔐 Verificação JWT server-side (SEG-011)
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token expirado ou inválido — limpa o cookie e redireciona
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
