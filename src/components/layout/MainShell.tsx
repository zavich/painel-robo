"use client";

import { ReactNode, useState } from "react";
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
  { label: "Processos", href: "/dashboard", icon: LayoutDashboard },
  { label: "Métricas", href: "/dashboard/metrics", icon: BarChart3 },
  { label: "Empresas", href: "/dashboard/companies", icon: Building2 },
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
    if (item.href === "/dashboard" && pathname.startsWith("/processes/"))
      return true;
    if (pathname === item.href) return true;
    if (item.href !== "/dashboard" && pathname.startsWith(item.href))
      return true;
    if (pathname === "/dashboard" && item.href === "/dashboard") return true;
    return false;
  };

  const baseBg = "bg-background text-foreground";

  const sidebarBg =
    "bg-gradient-to-b from-primary via-primary to-primary-light dark:from-sidebar-background dark:via-sidebar-background dark:to-sidebar-background border-border";
  const sidebarItemBase =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer w-full whitespace-nowrap";

  return (
    <div className={`${baseBg} h-screen overflow-hidden`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`hidden md:flex flex-col min-w-[200px] w-auto h-screen border-r ${sidebarBg} shadow-lg`}
        >
          <div className="px-5 pt-5 pb-4 border-b border-border flex items-center">
            <Image
              src="/logowhite-juri-capital.png"
              alt="ProSolutti"
              width={140}
              height={38}
              priority
              className="object-contain"
            />
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(
              (item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`${sidebarItemBase} ${
                      active
                        ? "bg-primary-light text-white"
                        : "text-white/80 hover:bg-primary/30 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        active
                          ? "border-secondary bg-secondary"
                          : "border-border bg-primary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                    {item.label}
                  </button>
                );
              },
            )}
          </nav>

          {/* Bottom */}
          {/* Bottom */}
          <div className="px-3 py-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <NotificationsBell />

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 mr-2 text-white" />
                ) : (
                  <Moon className="h-4 w-4 mr-2 text-white" />
                )}
                <span className="text-white/90">
                  {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                </span>
              </Button>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs font-semibold text-white/60 uppercase">
                Logado como
              </div>

              <div className="text-sm font-medium text-white truncate">
                {user?.email || "Usuário"}
              </div>

              <div className="text-xs text-white/60">
                {isAdmin ? "Administrador" : "Advogado"}
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-white/70 hover:text-red-400 hover:bg-red-500/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 text-white" />
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-10 backdrop-blur-xl border-b bg-background/95 border-border">
            <div className="h-16 flex items-center px-4 sm:px-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden h-9 w-9 p-0 text-muted-foreground hover:bg-muted"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </header>

          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside
                className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col ${sidebarBg}`}
              >
                <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
                  <Image
                    src="/logo-juri-capital.png"
                    alt="ProSolutti"
                    width={140}
                    height={38}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                  {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(
                    (item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item);

                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            router.push(item.href);
                            setMobileMenuOpen(false);
                          }}
                          className={`${sidebarItemBase} ${
                            active
                              ? "bg-primary-light text-white"
                              : "text-white/80 hover:bg-primary/30 hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    },
                  )}
                </nav>
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
