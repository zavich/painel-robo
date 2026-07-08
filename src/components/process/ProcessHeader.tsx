import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Process,
  ProcessPart,
  Situation,
  Company,
} from "@/app/interfaces/processes";
import {
  getClaimant,
  getDefendant,
  getProcessTitle,
} from "@/app/utils/processPartsUtils";
import { capitalizeWords } from "@/app/utils/format";
import {
  Check,
  Clock,
  X,
  RefreshCw,
  Building2,
  User2,
  Users,
  XCircle,
  FileText,
  Copy,
  Link2,
  ExternalLink,
  Edit2,
  Save,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/app/hooks/use-theme-client";
import { logger } from "@/app/lib/logger";
import { ProcessPartsModal } from "./ProcessPartsModal";
import { ProcessStatusBadges } from "./ProcessStatusBadges";
import { ProcessActionsDropdown } from "./ProcessActionsDropdown";

interface ProcessHeaderProps {
  process: Process;
  lawsuitCnjNumber?: string;
  lawsuitParts?: ProcessPart[];
  lawsuitStatusColeta?: string | null;
  lawsuitMotivoErro?: string | null;
  onReopen: () => void;
  isPending: boolean;
  isRefetching?: boolean;
  isSyncing?: boolean;
  onCompanyClick?: (company: Company) => void;
  onViewAnalysis?: () => void;
  onSync?: () => void;
  onRemoveProvisionalLink?: () => void;
  onLinkProvisionalExecution?: () => void;
  isEditingTitle?: boolean;
  editedClaimant?: string;
  editedDefendant?: string;
  onStartEditTitle?: () => void;
  onCancelEditTitle?: () => void;
  onSaveTitle?: () => void;
  onClaimantChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDefendantChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSavingTitle?: boolean;
  claimantInputRef?: React.RefObject<HTMLInputElement | null>;
  defendantInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ProcessHeader({
  process,
  lawsuitCnjNumber,
  lawsuitParts,
  lawsuitStatusColeta,
  lawsuitMotivoErro,
  onReopen,
  isPending,
  isRefetching = false,
  isSyncing = false,
  onCompanyClick,
  onViewAnalysis,
  onSync,
  onRemoveProvisionalLink,
  onLinkProvisionalExecution,
  isEditingTitle = false,
  editedClaimant = "",
  editedDefendant = "",
  onStartEditTitle,
  onCancelEditTitle,
  onSaveTitle,
  onClaimantChange,
  onDefendantChange,
  isSavingTitle = false,
  claimantInputRef,
  defendantInputRef,
}: ProcessHeaderProps) {
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const [processMenuOpen, setProcessMenuOpen] = useState(false);

  const handleCopyProcessNumber = async () => {
    // Copia o mesmo valor exibido na tela (lawsuitCnjNumber, vindo do Athena)
    // — antes copiava process.number (Mongo), que pode divergir ou estar
    // indefinido, fazendo o botão "não funcionar" sem indicação nenhuma.
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

  // Priorizar dados da Petição Inicial sobre processParts
  const initialPetition = process?.documents?.find(
    (doc) => doc.title === "Petição Inicial",
  );
  const initialPetitionData = initialPetition?.data;

  const claimantName =
    initialPetitionData?.qualificacao_reclamante?.nome_completo ||
    claimant?.nome ||
    "-";
  const defendantName = defendant?.nome || "-";

  // Obter título do processo usando a mesma lógica do KanbanCard
  // Prioriza título editado, depois formPipedrive.title, depois gera automaticamente
  const savedTitle = process?.title || process?.formPipedrive?.title;
  const displayTitle = getProcessTitle(
    lawsuitParts || [],
    process?.number,
    savedTitle,
    false, // Não usar número do processo como fallback - sempre gerar das partes se necessário
  );

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Processo" },
  ];

  const activeParts =
    lawsuitParts?.filter((part) => part.polo === "ATIVO") || [];
  const passiveParts =
    lawsuitParts?.filter((part) => part.polo === "PASSIVO") || [];
  const companies = process?.companies || [];

  // Verificar se é execução provisória
  const isProvisionalExecution = !!(
    process?.class === "PROVISIONAL_EXECUTION" && process?.processMain
  );

  // Verificar se é processo principal com execução provisória vinculada
  const isMainWithProvisionalExecution =
    process?.class === "MAIN" && process?.calledByProvisionalLawsuitNumber;

  // Conteúdo do meio da primeira linha: Reclamante vs Reclamada (editável com 2 campos)
  const middleContent = isEditingTitle ? (
    <div className="flex items-center gap-2 w-full max-w-4xl">
      <User2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-primary flex-shrink-0" />
      <Input
        ref={claimantInputRef}
        value={editedClaimant}
        onChange={onClaimantChange}
        placeholder="Reclamante"
        className="h-9 sm:h-10 text-xs sm:text-sm font-semibold flex-1 min-w-[150px]"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSaveTitle?.();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancelEditTitle?.();
          }
        }}
        disabled={isSavingTitle}
      />
      <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-semibold flex-shrink-0">
        VS
      </span>
      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-primary flex-shrink-0" />
      <Input
        ref={defendantInputRef}
        value={editedDefendant}
        onChange={onDefendantChange}
        placeholder="Empresa"
        className="h-9 sm:h-10 text-xs sm:text-sm font-semibold flex-1 min-w-[150px]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSaveTitle?.();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancelEditTitle?.();
          }
        }}
        disabled={isSavingTitle}
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={onSaveTitle}
        disabled={
          isSavingTitle || (!editedClaimant?.trim() && !editedDefendant?.trim())
        }
        className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 flex-shrink-0"
        title="Salvar (Enter)"
      >
        {isSavingTitle ? (
          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <Save className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCancelEditTitle}
        disabled={isSavingTitle}
        className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
        title="Cancelar (Esc)"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  ) : (
    // Mostrar título no formato: "👤 NOME VS 🏢 EMPRESA"
    <div className="flex items-center gap-2 min-w-0 max-w-full group">
      <User2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-primary flex-shrink-0" />
      {(() => {
        // Se há título gerado e não é vazio, usar ele
        if (
          displayTitle &&
          displayTitle.trim() &&
          displayTitle !== process?.number
        ) {
          const separators = [" VS ", " X ", " x "];
          let parts: string[] = [];

          for (const sep of separators) {
            if (displayTitle.includes(sep)) {
              parts = displayTitle.split(sep);
              break;
            }
          }

          if (parts.length >= 2) {
            // Tem reclamante E empresa
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
          } else if (displayTitle.trim()) {
            // Só um nome (sem separador)
            return (
              <span
                className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
                title={displayTitle}
              >
                {capitalizeWords(displayTitle)}
              </span>
            );
          }
        }

        // Fallback: Título gerado automaticamente das partes
        if (
          claimantName &&
          claimantName !== "-" &&
          defendantName &&
          defendantName !== "-"
        ) {
          return (
            <>
              <span
                className="font-semibold text-foreground text-xs sm:text-sm truncate min-w-0"
                title={claimantName}
              >
                {capitalizeWords(claimantName)}
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
        }

        // Último fallback: mostrar apenas o que temos
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
      {onStartEditTitle && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEditTitle}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 dark:hover:bg-primary-foreground/10"
            >
              <Edit2 className="h-3.5 w-3.5 text-primary dark:text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Editar título do processo
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const leftContent = (
    <div className="flex flex-col gap-2 sm:gap-3 min-w-0 w-full">
      {/* Primeira linha - Número do processo e tags */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
        {/* Número do Processo em destaque - Layout diferente para execução provisória e processo principal */}
        {isProvisionalExecution ? (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Número do processo atual (execução provisória) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={handleCopyProcessNumber}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs whitespace-nowrap">
                    {lawsuitCnjNumber}
                  </span>
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {copied
                  ? "Copiado!"
                  : "Clique para copiar o número do processo"}
              </TooltipContent>
            </Tooltip>
            {/* Link para processo principal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    if (process?.processMain?.number) {
                      window.open(
                        `/processes/${process.processMain.number}`,
                        "_blank",
                      );
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary/10 dark:bg-primary-foreground/10 border border-primary rounded-md cursor-pointer hover:bg-primary/20 dark:hover:bg-primary-foreground/20 transition-colors group"
                >
                  <Link2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary dark:text-primary-foreground" />
                  <span className="font-mono font-bold text-primary dark:text-primary-foreground text-[10px] sm:text-xs whitespace-nowrap">
                    {process?.processMain?.number}
                  </span>
                  <ExternalLink className="h-3 w-3 text-primary dark:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Ir para Processo Principal
              </TooltipContent>
            </Tooltip>
          </div>
        ) : isMainWithProvisionalExecution ? (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Número do processo principal */}
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
                {copied
                  ? "Copiado!"
                  : "Clique para copiar o número do processo"}
              </TooltipContent>
            </Tooltip>
            {/* Link para execução provisória vinculada */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    if (process?.calledByProvisionalLawsuitNumber) {
                      window.open(
                        `/processes/${process.calledByProvisionalLawsuitNumber}`,
                        "_blank",
                      );
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group"
                >
                  <Link2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs whitespace-nowrap">
                    {process?.calledByProvisionalLawsuitNumber}
                  </span>
                  <ExternalLink className="h-3 w-3 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
              >
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-orange-600 dark:text-orange-400">
                      Execução Provisória Vinculada
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Clique para abrir a execução provisória em nova aba.
                    </p>
                  </div>
                  {onRemoveProvisionalLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveProvisionalLink();
                      }}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-2" />
                      Remover Vínculo
                    </Button>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
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
        )}

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
          process={process}
          isRefetching={isRefetching}
          isSyncing={isSyncing}
          lawsuitStatusColeta={lawsuitStatusColeta}
          lawsuitMotivoErro={lawsuitMotivoErro}
          onRemoveProvisionalLink={onRemoveProvisionalLink}
          onLinkProvisionalExecution={onLinkProvisionalExecution}
        />
      </div>
    </div>
  );

  // Botões de ação do processo (Análise, etc)
  const processActionButtons = (
    <>
      {onViewAnalysis && (
        <Button
          variant="outline"
          size="sm"
          className="text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 font-medium transition-all"
          onClick={onViewAnalysis}
          aria-label="Ver Formulário de Análise"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden xl:inline ml-2">Análise</span>
        </Button>
      )}
      {process?.situation === Situation.LOSS && (
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
          onClick={onReopen}
          disabled={isPending}
          aria-label="Reabrir Processo"
        >
          <Clock className="h-4 w-4 mr-2" />
          <span className="hidden lg:inline">Reabrir</span>
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

              {/* Mobile: Show buttons in dropdown or inline based on space */}
              <div className="flex md:hidden items-center gap-2">
                {processActionButtons}
              </div>

              {/* Process Actions Menu */}
              <ProcessActionsDropdown
                theme={theme}
                open={processMenuOpen}
                onOpenChange={setProcessMenuOpen}
                onViewAnalysis={onViewAnalysis}
                onSync={onSync}
              />
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
        companies={companies}
        onCompanyClick={onCompanyClick}
      />
    </>
  );
}
