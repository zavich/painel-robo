import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ProcessPart } from "@/app/interfaces/processes";
import { getClaimant, getDefendant, getProcessTitle } from "@/app/utils/processPartsUtils";
import { capitalizeWords } from "@/app/utils/format";
import {
  Check,
  RefreshCw,
  Building2,
  User2,
  Users,
  FileText,
  Copy,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "@/app/hooks/use-theme-client";
import { logger } from "@/app/lib/logger";
import { ProcessPartsModal } from "./ProcessPartsModal";
import { ProcessStatusBadges } from "./ProcessStatusBadges";

interface ProcessHeaderProps {
  lawsuitCnjNumber?: string;
  lawsuitParts?: ProcessPart[];
  lawsuitStatusColeta?: string | null;
  lawsuitMotivoErro?: string | null;
  isSyncLocked?: boolean;
  onViewAnalysis?: () => void;
  onSync?: () => void;
  onFillForm?: () => void;
}

export function ProcessHeader({
  lawsuitCnjNumber,
  lawsuitParts,
  lawsuitStatusColeta,
  lawsuitMotivoErro,
  isSyncLocked = false,
  onViewAnalysis,
  onSync,
  onFillForm,
}: ProcessHeaderProps) {
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopyProcessNumber = async () => {
    if (!lawsuitCnjNumber) return;

    try {
      await navigator.clipboard.writeText(lawsuitCnjNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Erro ao copiar número do processo:", err as object);
      toast.error("Não foi possível copiar o número do processo");
    }
  };

  const claimant = getClaimant(lawsuitParts || []);
  const defendant = getDefendant(lawsuitParts || []);

  const claimantName = claimant?.nome || "-";
  const defendantName = defendant?.nome || "-";

  // Título gerado sempre a partir das partes do PJe (Athena) — não há mais
  // título editável/salvo (esse feature dependia do Mongo `process.title`).
  const displayTitle = getProcessTitle(lawsuitParts || [], undefined, undefined, false);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Processo" },
  ];

  const activeParts =
    lawsuitParts?.filter((part) => part.polo === "ATIVO") || [];
  const passiveParts =
    lawsuitParts?.filter((part) => part.polo === "PASSIVO") || [];

  // Mostrar título no formato: "👤 NOME VS 🏢 EMPRESA"
  const middleContent = (
    <div className="flex items-center gap-2 min-w-0 max-w-full group">
      <User2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-primary flex-shrink-0" />
      {(() => {
        if (displayTitle && displayTitle.trim()) {
          const separators = [" VS ", " X ", " x "];
          let parts: string[] = [];

          for (const sep of separators) {
            if (displayTitle.includes(sep)) {
              parts = displayTitle.split(sep);
              break;
            }
          }

          if (parts.length >= 2) {
            return (
              <>
                <span
                  className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
                  title={parts[0]}
                >
                  {capitalizeWords(parts[0])}
                </span>
                <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">
                  Vs
                </span>
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span
                  className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
                  title={parts.slice(1).join(" VS ")}
                >
                  {capitalizeWords(parts.slice(1).join(" VS "))}
                </span>
              </>
            );
          }

          return (
            <span
              className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
              title={displayTitle}
            >
              {capitalizeWords(displayTitle)}
            </span>
          );
        }

        return (
          <>
            <span
              className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
              title={claimantName}
            >
              {capitalizeWords(claimantName) || "-"}
            </span>
            <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">
              Vs
            </span>
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span
              className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
              title={defendantName}
            >
              {capitalizeWords(defendantName)}
            </span>
          </>
        );
      })()}
    </div>
  );

  const leftContent = (
    <div className="flex flex-col gap-2 sm:gap-3 min-w-0 w-full">
      {/* Primeira linha - Número do processo e tags */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleCopyProcessNumber}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary/10 dark:bg-primary-foreground/10 border border-primary rounded-md cursor-pointer hover:bg-primary/20 dark:hover:bg-primary-foreground/20 transition-colors group"
            >
              <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary dark:text-primary-foreground" />
              <span className="font-mono font-bold text-primary dark:text-primary-foreground text-[10px] sm:text-xs whitespace-nowrap">
                {lawsuitCnjNumber}
              </span>
              {copied ? (
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-3 w-3 text-primary dark:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {copied ? "Copiado!" : "Clique para copiar o número do processo"}
          </TooltipContent>
        </Tooltip>

        <span className="hidden sm:inline text-muted-foreground text-xs sm:text-sm">
          |
        </span>

        {/* Botão para abrir modal com todas as partes */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPartsModal(true)}
          className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs hover:bg-primary/10 dark:hover:bg-primary-foreground/10 flex-shrink-0"
        >
          <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
          <span className="whitespace-nowrap">
            <span className="hidden sm:inline">
              Ver Todas ({activeParts.length + passiveParts.length})
            </span>
            <span className="sm:hidden">
              Ver ({activeParts.length + passiveParts.length})
            </span>
          </span>
        </Button>

        <ProcessStatusBadges
          lawsuitStatusColeta={lawsuitStatusColeta}
          lawsuitMotivoErro={lawsuitMotivoErro}
        />
      </div>
    </div>
  );

  // Botões de ação do processo (LO, Sincronizar)
  const processActionButtons = (
    <>
      {onViewAnalysis && (
        <Button
          variant="outline"
          size="sm"
          className="text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 font-medium transition-all"
          onClick={onViewAnalysis}
          aria-label="Ver LO"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden xl:inline ml-2">LO</span>
        </Button>
      )}
      {onSync && (
        <Button
          variant="outline"
          size="sm"
          className="text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-100 hover:text-cyan-800 hover:border-cyan-400 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300 font-medium transition-all"
          onClick={onSync}
          disabled={isSyncLocked}
          aria-label="Sincronizar Processo"
        >
          <RefreshCw
            className={`h-4 w-4 ${isSyncLocked ? "animate-spin" : ""}`}
          />
          <span className="hidden xl:inline ml-2">Sincronizar</span>
        </Button>
      )}
      {onFillForm && (
        <Button
          variant="outline"
          size="sm"
          className="text-secondary dark:text-secondary border-secondary/40 dark:border-secondary/40 hover:bg-secondary/10 hover:text-secondary hover:border-secondary dark:hover:bg-secondary/10 font-medium transition-all"
          onClick={onFillForm}
          aria-label="Preencher Formulário"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="hidden xl:inline ml-2">Preencher Formulário</span>
        </Button>
      )}
    </>
  );

  return (
    <>
      {/* Simplified Process Header - without AppHeader to avoid duplication */}
      <div
        className={`sticky top-0 z-10 border-b ${
          theme === "dark"
            ? "bg-slate-900/95 border-slate-800"
            : "bg-white/95 border-slate-200"
        }`}
      >
        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Process Info Section */}
        <div className="px-4 sm:px-6 py-3">
          {/* First row: Process info and actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4">
            {/* Left: Process number and tags */}
            <div className="flex-1 min-w-0">{leftContent}</div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Desktop: Show buttons directly */}
              <div className="hidden md:flex items-center gap-2">
                {processActionButtons}
              </div>

              {/* Mobile: Show buttons inline */}
              <div className="flex md:hidden items-center gap-2">
                {processActionButtons}
              </div>
            </div>
          </div>

          {/* Second row: Process title (middleContent) */}
          {middleContent && (
            <div className="mt-3 flex items-center">
              <div
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {middleContent}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProcessPartsModal
        open={showPartsModal}
        onOpenChange={setShowPartsModal}
        activeParts={activeParts}
        passiveParts={passiveParts}
        companies={[]}
      />
    </>
  );
}
