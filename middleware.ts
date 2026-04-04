import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const getMaintenanceMode = () => {
  return (
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1" ||
    process.env.MAINTENANCE_MODE === "1"
  );
};

export function middleware(request: NextRequest) {
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
    // Permite arquivos estáticos
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
    ) {
      return NextResponse.next();
    }

    // Se não estiver na página de manutenção, redireciona
    if (!isMaintenancePage) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }

    return NextResponse.next();
  }

  // 🔄 Se saiu da manutenção e está na página de maintenance
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
