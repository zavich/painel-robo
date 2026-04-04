"use client";

import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useTheme } from "@/app/hooks/use-theme-client";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Moon, Sun, ChevronDown, UserCog, Briefcase, Menu, Info, ClipboardList, User, Settings, RefreshCw, ArrowLeft, LayoutGrid, List, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

export type AppHeaderView = "processes" | "companies" | "prompts" | "reason-loss" | "process" | undefined;

export interface AppHeaderProps {
  view?: AppHeaderView;
  onChangeView?: (view: Exclude<AppHeaderView, undefined>) => void;
  breadcrumbItems?: { label: string; href?: string }[];
  leftContent?: ReactNode; // e.g., claimant vs defendant block
  middleContent?: ReactNode; // Content to display in the middle of first line (e.g., claimant vs defendant)
  rightActions?: ReactNode; // e.g., Aprovar/Recusar buttons
  mobileActions?: ReactNode; // Mobile-specific actions for drawer
  returnTo?: string; // URL to return to
  processActions?: {
    onViewProcessInfo?: () => void;
    onAssignMember?: () => void;
    onChangeStage?: () => void;
    onSync?: () => void;
    isAdmin?: boolean;
  };
  isProvisionalExecution?: boolean; // Indica se é execução provisória
}

export function AppHeader({
  view,
  onChangeView,
  breadcrumbItems,
  leftContent,
  middleContent,
  rightActions,
  mobileActions,
  returnTo,
  processActions,
  isProvisionalExecution = false,
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const roleIcon =
    user?.role === "admin" ? (
      <UserCog className="h-6 w-6 text-white" />
    ) : (
      <Briefcase className="h-6 w-6 text-white" />
    );

  const showBreadcrumb = view !== "processes" && (breadcrumbItems?.length || 0) > 0;

  if (!mounted) {
    return (
      <header
        className={`sticky top-0 z-20 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${theme === "dark" ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"}`}
      >
        <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 flex items-center justify-between">
          <div className="h-6 w-40 rounded bg-gray-100" />
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-20 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${theme === "dark" ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"}`}
    >
      <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2.5 sm:py-3.5">
        {/* Primeira linha: Logo, título, VS e controles */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Left: Logo e título */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Link href={"/dashboard"} className="group flex-shrink-0">
              <Image
                src={theme === "dark" ? "/logowhite-prosolutti.png" : "/logo-prosolutti.png"}
                alt="ProSolutti"
                width={140}
                height={38}
                priority
                className="cursor-pointer transition-transform group-hover:scale-105"
              />
            </Link>
            
            {/* Banner para execução provisória - abaixo da logo */}
            {isProvisionalExecution && (
              <div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 ${theme === "dark" ? "text-white" : "text-[#25286A]"}`}>
                  <span className="font-bold text-[10px] sm:text-xs whitespace-nowrap">EXECUÇÃO PROVISÓRIA</span>
                </div>
              </div>
            )}
          </div>

          {/* Middle: Reclamante vs Reclamada centralizado (desktop) */}
          {middleContent && (
            <div className="hidden lg:flex flex-1 order-2 justify-center min-w-[320px] px-4">
              <div className="flex items-center justify-center px-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-3xl">
                {middleContent}
              </div>
            </div>
          )}

          {/* Right: Theme + User menu */}
          <div className="flex items-center gap-2 shrink-0 order-3 lg:order-3 ml-auto">
            <NotificationsBell />

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className={`h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl transition-all duration-200 ${theme === "dark"
                  ? "border-gray-600 bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
              title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Mobile drawer trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileOpen(true)}
              className={`md:hidden h-9 w-9 p-0 rounded-xl ${theme === "dark"
                  ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
              title="Menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Hide user dropdown on mobile; drawer replaces it */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`hidden md:flex items-center gap-2 sm:gap-3 group font-semibold h-10 sm:h-11 px-3 sm:px-4 rounded-xl transition-all duration-200 ${theme === "dark"
                      ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white"
                      : "border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                    }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {roleIcon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {user?.role === "admin" ? "Administrador" : "Advogado"}
                    </span>
                    <span className={`text-[10px] sm:text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{user?.email}</span>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors flex-shrink-0 ${theme === "dark" ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-blue-600"
                      }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-64 rounded-xl shadow-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                {/* Process Actions - only show if processActions prop is provided */}
                {view === "process" && processActions && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    {processActions.onViewProcessInfo && (
                      <DropdownMenuItem onClick={processActions.onViewProcessInfo} className="gap-2">
                        <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Informações do Processo
                      </DropdownMenuItem>
                    )}
                    {processActions.onAssignMember && (
                      <DropdownMenuItem onClick={processActions.onAssignMember} className="gap-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Atribuir Membro
                      </DropdownMenuItem>
                    )}
                    {processActions.isAdmin && processActions.onChangeStage && (
                      <DropdownMenuItem onClick={processActions.onChangeStage} className="gap-2">
                        <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        Alterar Etapa do Processo
                      </DropdownMenuItem>
                    )}
                    {processActions.onSync && (
                      <DropdownMenuItem onClick={processActions.onSync} className="gap-2">
                        <RefreshCw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        Sincronizar Processo
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={logout} data-variant="destructive">
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Segunda linha: leftContent (número e tags) e botões de ação */}
        {(leftContent || rightActions) && (
          <div className="flex flex-col lg:flex-row items-start justify-between gap-3 sm:gap-4 mt-3">
            {/* leftContent */}
            {leftContent && (
              <div
                className="flex-1 min-w-0 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto header-scroll"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: theme === 'dark' ? '#4b5563 transparent' : '#d1d5db transparent'
                }}
              >
                {leftContent}
              </div>
            )}

            {/* rightActions - desktop only */}
            {rightActions && (
              <div className="flex items-center gap-2 shrink-0 self-stretch lg:self-auto">
                {rightActions}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className={`sm:max-w-[400px] w-[92vw] p-0 overflow-hidden ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <div className="p-4">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-3 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  {roleIcon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user?.role === "admin" ? "Administrador" : "Advogado"}</span>
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{user?.email}</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Actions - Em mobile, mostrar mobileActions específicas */}
            {mobileActions && (
              <div className="mt-4" onClick={() => setMobileOpen(false)}>
                {mobileActions}
              </div>
            )}

            {/* Process Actions - only in process view */}
            {view === "process" && processActions && (
              <div className={`${mobileActions ? 'mt-3' : 'mt-6'} flex flex-col gap-2`}>
                {mobileActions && (
                  <div className={`border-t my-2 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}></div>
                )}
                <div className={`text-xs font-semibold mb-1 px-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  GERENCIAR PROCESSO
                </div>
                {processActions.onViewProcessInfo && (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { processActions.onViewProcessInfo?.(); setMobileOpen(false); }}>
                    <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Informações do Processo
                  </Button>
                )}
                {processActions.onAssignMember && (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { processActions.onAssignMember?.(); setMobileOpen(false); }}>
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Atribuir Membro
                  </Button>
                )}
                {processActions.isAdmin && processActions.onChangeStage && (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { processActions.onChangeStage?.(); setMobileOpen(false); }}>
                    <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    Alterar Etapa do Processo
                  </Button>
                )}
                {processActions.onSync && (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { processActions.onSync?.(); setMobileOpen(false); }}>
                    <RefreshCw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    Sincronizar Processo
                  </Button>
                )}
              </div>
            )}

            {/* Logout button */}
            <div className={`${mobileActions || (view === "process" && processActions) ? 'mt-4' : 'mt-6'} grid grid-cols-1 gap-2`}>
              <Button variant="destructive" onClick={() => { setMobileOpen(false); logout(); }}>Sair da conta</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showBreadcrumb && (
        <div className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
          <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex items-center gap-3">
            {returnTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(returnTo)}
                className={`flex items-center gap-2 h-9 px-3 rounded-lg transition-all duration-200 ${theme === "dark"
                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Voltar ao Processo</span>
              </Button>
            )}
            <Breadcrumb items={breadcrumbItems || []} />
          </div>
        </div>
      )}
    </header>
  );
}


