"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  MessageSquareText,
  ShieldAlert,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Button } from "@/components/ui/button";
import { UserRolesEnum } from "@/app/interfaces/user";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

interface MainShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Processos",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Métricas",
    href: "/dashboard/metrics",
    icon: BarChart3,
  },
  {
    label: "Empresas",
    href: "/dashboard/companies",
    icon: Building2,
  },
  {
    label: "Prompts",
    href: "/dashboard/prompts",
    icon: MessageSquareText,
    adminOnly: true,
  },
  {
    label: "Motivos de Recusa",
    href: "/dashboard/reason-loss",
    icon: ShieldAlert,
    adminOnly: true,
  },
];

export function MainShell({ children }: MainShellProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === UserRolesEnum.ADMIN;

  const isItemActive = (item: NavItem) => {
    // Para qualquer rota de processos, considerar "Processos" ativo
    if (item.href === "/dashboard" && pathname.startsWith("/processes/")) {
      return true;
    }

    // Verificar se o pathname corresponde exatamente ao href ou começa com ele
    if (pathname === item.href) {
      return true;
    }

    // Para rotas filhas (ex: /dashboard/companies), verificar se o pathname começa com o href
    if (item.href !== "/dashboard" && pathname.startsWith(item.href)) {
      return true;
    }

    // Se estiver na rota /dashboard sem subrota, apenas "Processos" está ativo
    if (pathname === "/dashboard" && item.href === "/dashboard") {
      return true;
    }

    return false;
  };

  const baseBg =
    theme === "dark"
      ? "bg-slate-950 text-slate-50"
      : "bg-slate-50 text-slate-900";

  const sidebarBg =
    theme === "dark"
      ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800"
      : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800";

  const sidebarItemBase =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer w-full whitespace-nowrap";

  return (
    <div className={`${baseBg} h-screen overflow-hidden`}>
      <div className="flex h-screen">
        {/* Sidebar - desktop */}
        <aside
          className={`hidden md:flex flex-col min-w-[200px] w-auto h-screen border-r ${sidebarBg} shadow-xl`}
        >
          {/* <div className="px-5 pt-5 pb-4 border-b border-slate-800 flex items-center">
            <Image
              src="/logowhite-prosolutti.png"
              alt="ProSolutti"
              width={140}
              height={38}
              priority
              className="object-contain"
              suppressHydrationWarning
            />
          </div> */}

          <nav className="flex-1 px-3 py-4 space-y-1 min-h-0">
            {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(
              (item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`${sidebarItemBase} ${
                      active
                        ? "bg-slate-800 text-slate-50"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        active
                          ? "border-blue-400 bg-blue-500/20 text-blue-300"
                          : "border-slate-700 bg-slate-900/60 text-slate-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              },
            )}
          </nav>

          {/* Notifications and Theme Toggle */}
          <div className="px-3 py-3 border-t border-slate-800 space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <NotificationsBell />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`flex-1 justify-start h-9 px-3 ${
                  theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                }`}
                title={
                  theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 mr-2" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm">
                  {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                </span>
              </Button>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3 shrink-0">
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Logado como
              </div>
              <div className="text-sm font-medium text-slate-50 truncate">
                {user?.email || "Usuário"}
              </div>
              <div className="text-xs text-slate-500">
                {isAdmin ? "Administrador" : "Advogado"}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={logout}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header - Simple header with mobile menu button only */}
          <header
            className={`sticky top-0 z-10 backdrop-blur-xl border-b shadow-sm ${
              theme === "dark"
                ? "bg-slate-900/95 border-slate-800"
                : "bg-white/95 border-slate-200"
            }`}
          >
            <div className="h-16 flex items-center px-4 sm:px-6">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden h-9 w-9 p-0 ${
                  theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </header>

          {/* Mobile sidebar overlay */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside
                className={`fixed left-0 top-0 bottom-0 min-w-[200px] w-auto z-50 md:hidden flex flex-col ${sidebarBg} shadow-2xl`}
              >
                <div className="px-5 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between">
                  <Image
                    src="/logowhite-prosolutti.png"
                    alt="ProSolutti"
                    width={140}
                    height={38}
                    priority
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 min-h-0">
                  {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(
                    (item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item);

                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            router.push(item.href);
                            setMobileMenuOpen(false);
                          }}
                          className={`${sidebarItemBase} ${
                            active
                              ? "bg-slate-800 text-slate-50"
                              : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-50"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                              active
                                ? "border-blue-400 bg-blue-500/20 text-blue-300"
                                : "border-slate-700 bg-slate-900/60 text-slate-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    },
                  )}
                </nav>

                {/* Notifications and Theme Toggle - Mobile */}
                <div className="px-3 py-3 border-t border-slate-800 space-y-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <NotificationsBell />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className={`flex-1 justify-start h-9 px-3 ${
                        theme === "dark"
                          ? "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                          : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                      }`}
                      title={
                        theme === "dark"
                          ? "Ativar tema claro"
                          : "Ativar tema escuro"
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4 mr-2" />
                      ) : (
                        <Moon className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm">
                        {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3 shrink-0">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Logado como
                    </div>
                    <div className="text-sm font-medium text-slate-50 truncate">
                      {user?.email || "Usuário"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAdmin ? "Administrador" : "Advogado"}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </aside>
            </>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
