"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Link2,
  RefreshCw,
  MoreHorizontal,
  Info,
  ClipboardList,
  Settings,
} from "lucide-react";

interface ProcessActionsMenuProps {
  onAssignMember?: () => void;
  onLinkProvisional?: () => void;
  onSync?: () => void;
  onViewProcessDetails?: () => void;
  onViewProcessInfo?: () => void;
  onChangeStage?: () => void;
  isAdmin?: boolean;
}

export function ProcessActionsMenu({
  onAssignMember,
  onLinkProvisional,
  onSync,
  onViewProcessDetails,
  onViewProcessInfo,
  onChangeStage,
  isAdmin = false,
}: ProcessActionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-2 sm:border-4 border-white dark:border-gray-800 hover:scale-110 transition-all duration-300"
            aria-label="Ações do processo"
          >
            <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 sm:w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 mr-2 sm:mr-0"
        >
          {onViewProcessDetails && (
            <DropdownMenuItem
              onClick={() => {
                onViewProcessDetails();
                setOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Detalhes do Processo</span>
            </DropdownMenuItem>
          )}

          {onViewProcessInfo && (
            <DropdownMenuItem
              onClick={() => {
                onViewProcessInfo();
                setOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors"
            >
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Informações do Processo</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />

          {onAssignMember && (
            <DropdownMenuItem
              onClick={() => {
                onAssignMember();
                setOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Atribuir Membro</span>
            </DropdownMenuItem>
          )}

          {onLinkProvisional && (
            <DropdownMenuItem
              onClick={() => {
                onLinkProvisional();
                setOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer transition-colors"
            >
              <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Vincular Processo Provisório</span>
            </DropdownMenuItem>
          )}

          {isAdmin && onChangeStage && (
            <DropdownMenuItem
              onClick={() => {
                onChangeStage();
                setOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer transition-colors"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Alterar Etapa do Processo</span>
            </DropdownMenuItem>
          )}

          {onSync && (
            <>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700 my-2" />
              <DropdownMenuItem
                onClick={() => {
                  onSync();
                  setOpen(false);
                }}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/30 cursor-pointer transition-colors"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Sincronizar Processo</span>
              </DropdownMenuItem>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

