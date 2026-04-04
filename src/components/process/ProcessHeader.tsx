import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Process, Situation, ProcessPart, Company, SpecialRule } from "@/app/interfaces/processes";
import { getClaimant, getDefendant, getProcessTitle } from "@/app/utils/processPartsUtils";
import { getStageLabel } from "@/app/utils/processUtils";
import { capitalizeWords } from "@/app/utils/format";
import {
  Check,
  Clock,
  X,
  RefreshCw,
  Building2,
  User2,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  XCircle,
  FileSearch,
  FileText,
  Copy,
  Info,
  ClipboardList,
  User,
  Link2,
  Settings,
  ExternalLink,
  Edit2,
  Save,
} from "lucide-react";
import { useState } from "react";
import { mascararCNPJ, formatCpf } from "@/app/utils/masks";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/app/hooks/use-theme-client";

interface ProcessHeaderProps {
  process: Process;
  onReopen: () => void;
  isPending: boolean;
  isRefetching?: boolean;
  isSyncing?: boolean;
  onCompanyClick?: (company: Company) => void;
  onViewPreAnalysis?: () => void;
  onViewAnalysis?: () => void;
  onSync?: () => void;
  onViewProcessInfo?: () => void;
  onAssignMember?: () => void;
  onChangeStage?: () => void;
  onRemoveProvisionalLink?: () => void;
  onLinkProvisionalExecution?: () => void;
  isAdmin?: boolean;
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
  onReopen,
  isPending,
  isRefetching = false,
  isSyncing = false,
  onCompanyClick,
  onViewPreAnalysis,
  onViewAnalysis,
  onSync,
  onViewProcessInfo,
  onAssignMember,
  onChangeStage,
  onRemoveProvisionalLink,
  onLinkProvisionalExecution,
  isAdmin = false,
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

  const handleCopyProcessNumber = async () => {
    if (process?.number) {
      try {
        await navigator.clipboard.writeText(process.number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  const claimant = getClaimant(process?.processParts || []);
  const defendant = getDefendant(process?.processParts || []);

  // Priorizar dados da Petição Inicial sobre processParts
  const initialPetition = process?.documents?.find(
    (doc) => doc.title === "Petição Inicial"
  );
  const initialPetitionData = initialPetition?.data as any;

  const claimantName = initialPetitionData?.qualificacao_reclamante?.nome_completo || claimant?.nome || "-";
  const defendantName = defendant?.nome || "-";
  
  // Obter título do processo usando a mesma lógica do KanbanCard
  // Prioriza título editado, depois formPipedrive.title, depois gera automaticamente
  const savedTitle = process?.title || (process as any)?.formPipedrive?.title;
  const displayTitle = getProcessTitle(
    process?.processParts || [],
    process?.number,
    savedTitle,
    false // Não usar número do processo como fallback - sempre gerar das partes se necessário
  );

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Processo" },
  ];

  const activeParts = process?.processParts?.filter(part => part.polo === "ATIVO") || [];
  const passiveParts = process?.processParts?.filter(part => part.polo === "PASSIVO") || [];
  const companies = process?.companies || [];

  // Verificar se é execução provisória
  const isProvisionalExecution = !!(process?.class === "PROVISIONAL_EXECUTION" && process?.processMain);
  
  // Verificar se é processo principal com execução provisória vinculada
  const isMainWithProvisionalExecution = process?.class === "MAIN" && process?.calledByProvisionalLawsuitNumber;

  // Conteúdo do meio da primeira linha: Reclamante vs Reclamada (editável com 2 campos)
  const middleContent = isEditingTitle ? (
    <div className="flex items-center gap-2 w-full max-w-4xl">
      <User2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
      <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-semibold flex-shrink-0">VS</span>
      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
        disabled={isSavingTitle || (!editedClaimant?.trim() && !editedDefendant?.trim())}
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
      <User2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      {(() => {
        // Se há título gerado e não é vazio, usar ele
        if (displayTitle && displayTitle.trim() && displayTitle !== process?.number) {
          const separators = [' VS ', ' X ', ' x '];
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
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={parts[0]}>
                  {capitalizeWords(parts[0])}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm flex-shrink-0">Vs</span>
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={parts.slice(1).join(' VS ')}>
                  {capitalizeWords(parts.slice(1).join(' VS '))}
                </span>
              </>
            );
          } else if (displayTitle.trim()) {
            // Só um nome (sem separador)
            return (
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={displayTitle}>
                {capitalizeWords(displayTitle)}
              </span>
            );
          }
        }
        
        // Fallback: Título gerado automaticamente das partes
        if (claimantName && claimantName !== '-' && defendantName && defendantName !== '-') {
          return (
            <>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={claimantName}>{capitalizeWords(claimantName)}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm flex-shrink-0">Vs</span>
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={defendantName}>{capitalizeWords(defendantName)}</span>
            </>
          );
        }
        
        // Último fallback: mostrar apenas o que temos
        return (
          <>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={claimantName}>{capitalizeWords(claimantName) || '-'}</span>
            <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm flex-shrink-0">Vs</span>
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate min-w-0" title={defendantName}>{capitalizeWords(defendantName)}</span>
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
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <Edit2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
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
                    {process?.number}
                  </span>
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {copied ? "Copiado!" : "Clique para copiar o número do processo"}
              </TooltipContent>
            </Tooltip>
            {/* Link para processo principal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    if (process?.processMain?.number) {
                      window.open(`/processes/${process.processMain.number}`, '_blank');
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                >
                  <Link2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs whitespace-nowrap">
                    {process?.processMain?.number}
                  </span>
                  <ExternalLink className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs whitespace-nowrap">
                    {process?.number}
                  </span>
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {copied ? "Copiado!" : "Clique para copiar o número do processo"}
              </TooltipContent>
            </Tooltip>
            {/* Link para execução provisória vinculada */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    if (process?.calledByProvisionalLawsuitNumber) {
                      window.open(`/processes/${process.calledByProvisionalLawsuitNumber}`, '_blank');
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
              <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-orange-600 dark:text-orange-400">Execução Provisória Vinculada</p>
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
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
              >
                <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs whitespace-nowrap">
                  {process?.number}
                </span>
                {copied ? (
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {copied ? "Copiado!" : "Clique para copiar o número do processo"}
            </TooltipContent>
          </Tooltip>
        )}

        <span className="hidden sm:inline text-gray-300 dark:text-gray-600 text-xs sm:text-sm">|</span>

        {/* Botão para abrir modal com todas as partes */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPartsModal(true)}
          className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-shrink-0"
        >
          <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <span className="whitespace-nowrap">
            <span className="hidden sm:inline">Ver Todas ({(activeParts.length + passiveParts.length)})</span>
            <span className="sm:hidden">Ver ({(activeParts.length + passiveParts.length)})</span>
          </span>
        </Button>

        {isRefetching && !isSyncing && (
          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            <RefreshCw className="h-3 w-3 text-blue-500 dark:text-blue-400 animate-spin" />
            <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">Atualizando...</span>
          </div>
        )}
        {(isSyncing || process?.processStatus?.name === "Processando") && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-cyan-500 dark:bg-cyan-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Sincronizando</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-cyan-600 dark:text-cyan-400">Sincronização em Andamento</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  O processo está sendo sincronizado. Aguarde a conclusão para visualizar os dados atualizados.
                </p>
                {process?.processStatus?.log && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Status:</span> {process.processStatus.log}
                  </p>
                )}
                {process?.processStatus?.updatedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última atualização: {new Date(process.processStatus.updatedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {!process?.dealId && process?.situation === Situation.PENDING && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-500 dark:bg-amber-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help">
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Sem Deal ID</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-amber-600 dark:text-amber-400">Processo sem Deal ID do Pipedrive</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Este processo não possui um dealId vinculado ao Pipedrive.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Entre em contato com o suporte ou verifique a integração com o Pipedrive.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {/* Badge para processo SEM vínculo - clicável */}
        {process?.class === "MAIN" && !process?.calledByProvisionalLawsuitNumber && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  onLinkProvisionalExecution?.();
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 dark:from-yellow-600 dark:to-amber-700 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-pointer hover:from-yellow-600 hover:to-amber-700 dark:hover:from-yellow-700 dark:hover:to-amber-800 transition-all"
              >
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Inserir Execução Provisória</span>
                <span className="sm:hidden">Inserir Exec.</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-yellow-600 dark:text-yellow-400">Vincular Execução Provisória</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Este processo não possui uma execução provisória vinculada. Clique para inserir e vincular uma execução provisória a este processo principal.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {process?.dealId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://prosolutti.pipedrive.com/deal/${process.dealId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">Pipedrive</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">Ver Deal no Pipedrive</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Clique para abrir este processo no Pipedrive em uma nova aba.
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    <span className="font-semibold">Deal ID:</span> {process.dealId}
                  </p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {process?.processStatus?.name === "Extração de movimentações Finalizada" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 dark:bg-blue-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Processando Docs</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-blue-600 dark:text-blue-400">Sincronizando Documentos</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  As movimentações foram sincronizadas com sucesso. Aguarde enquanto os documentos são processados.
                </p>
                {process.processStatus.log && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Status:</span> {process.processStatus.log}
                  </p>
                )}
                {process.processStatus.updatedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última atualização: {new Date(process.processStatus.updatedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {process?.processStatus?.name === "Error" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help">
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Erro</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-red-600 dark:text-red-400">Erro no Processamento</p>
                {process.processStatus.errorReason && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    <span className="font-semibold">Motivo:</span> {process.processStatus.errorReason}
                  </p>
                )}
                {process.processStatus.log && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Log:</span> {process.processStatus.log}
                  </p>
                )}
                {process.processStatus.updatedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(process.processStatus.updatedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {process?.situation === Situation.LOSS && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help">
                <XCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Declinado</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-2">
                <p className="font-bold text-red-600 dark:text-red-400">Processo Declinado</p>
                {process?.processDecisions?.history?.find(h => h.status === Situation.LOSS)?.rejection_reason && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    <span className="font-semibold">Motivo:</span> {process.processDecisions.history.find(h => h.status === Situation.LOSS)?.rejection_reason}
                  </p>
                )}
                {process?.processDecisions?.history?.find(h => h.status === Situation.LOSS)?.rejection_description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Descrição:</span> {process.processDecisions.history.find(h => h.status === Situation.LOSS)?.rejection_description}
                  </p>
                )}
                {process?.stage && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Etapa:</span> {getStageLabel(process.stage)}
                  </p>
                )}
                {process?.processDecisions?.history?.find(h => h.status === Situation.LOSS)?.createdAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Data da recusa: {new Date(process.processDecisions.history.find(h => h.status === Situation.LOSS)?.createdAt || '').toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

    </div>
  );

  // Botões de ação do processo (Pré-Análise, Análise, etc)
  const processActionButtons = (
    <>
      {onViewPreAnalysis && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300 font-medium transition-all" 
          onClick={onViewPreAnalysis} 
          aria-label="Ver Formulário de Pré-Análise"
        >
          <FileSearch className="h-4 w-4" />
          <span className="hidden xl:inline ml-2">Pré-Análise</span>
        </Button>
      )}
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

  // Botões para mobile - apenas principais
  const mobileActions = (
    <div className="flex flex-col gap-2 w-full">
      {/* Reclamante vs Reclamada - Mobile */}
      {isEditingTitle ? (
        <div className="flex flex-col gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            Editando Título
          </Label>
          <div className="space-y-2">
            <div>
              <Label className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                👤 Reclamante
              </Label>
              <Input
                ref={claimantInputRef}
                value={editedClaimant}
                onChange={onClaimantChange}
                placeholder="Nome do reclamante"
                className="text-xs font-semibold"
                disabled={isSavingTitle}
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                🏢 Empresa
              </Label>
              <Input
                ref={defendantInputRef}
                value={editedDefendant}
                onChange={onDefendantChange}
                placeholder="Nome da empresa"
                className="text-xs font-semibold"
                disabled={isSavingTitle}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onSaveTitle}
              disabled={isSavingTitle || (!editedClaimant?.trim() && !editedDefendant?.trim())}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSavingTitle ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-2" />
                  Salvar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEditTitle}
              disabled={isSavingTitle}
              className="flex-1"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        // Mobile: Mostrar título (customizado ou gerado) com estilo padrão
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-0">
          <User2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate min-w-0 flex-1" title={displayTitle}>
            {displayTitle.toUpperCase() || `${claimantName.toUpperCase()} VS ${defendantName.toUpperCase()}`}
          </span>
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          {onStartEditTitle && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEditTitle}
              className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 ml-auto flex-shrink-0"
            >
              <Edit2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </Button>
          )}
        </div>
      )}
      
      {onViewPreAnalysis && (
        <Button 
          variant="outline" 
          className="w-full justify-start text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300 font-medium" 
          onClick={onViewPreAnalysis}
        >
          <FileSearch className="h-4 w-4 mr-2" />
          Pré-Análise
        </Button>
      )}
      {onViewAnalysis && (
        <Button 
          variant="outline" 
          className="w-full justify-start text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 font-medium" 
          onClick={onViewAnalysis}
        >
          <FileText className="h-4 w-4 mr-2" />
          Análise
        </Button>
      )}
      {process?.situation === Situation.LOSS && (
        <Button 
          variant="outline" 
          className="w-full justify-start text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium" 
          onClick={onReopen} 
          disabled={isPending}
        >
          <Clock className="h-4 w-4 mr-2" />
          Reabrir Processo
        </Button>
      )}
    </div>
  );

  const { theme } = useTheme();
  const [processMenuOpen, setProcessMenuOpen] = useState(false);

  return (
    <>
      {/* Simplified Process Header - without AppHeader to avoid duplication */}
      <div className={`sticky top-0 z-10 border-b ${
        theme === "dark"
          ? "bg-slate-900/95 border-slate-800"
          : "bg-white/95 border-slate-200"
      }`}>
        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Process Info Section */}
        <div className="px-4 sm:px-6 py-3">
          {/* First row: Process info and actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4">
            {/* Left: Process number and tags */}
            <div className="flex-1 min-w-0">
              {leftContent}
            </div>

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
              {(onViewProcessInfo || onAssignMember || onChangeStage || onSync) && (
                <DropdownMenu open={processMenuOpen} onOpenChange={setProcessMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 px-3 ${
                        theme === "dark"
                          ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Ações</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-56 ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  }`}>
                    {onViewPreAnalysis && (
                      <DropdownMenuItem
                        onClick={() => {
                          onViewPreAnalysis();
                          setProcessMenuOpen(false);
                        }}
                        className="gap-2 md:hidden"
                      >
                        <FileSearch className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        Pré-Análise
                      </DropdownMenuItem>
                    )}
                    {onViewAnalysis && (
                      <DropdownMenuItem
                        onClick={() => {
                          onViewAnalysis();
                          setProcessMenuOpen(false);
                        }}
                        className="gap-2 md:hidden"
                      >
                        <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        Análise
                      </DropdownMenuItem>
                    )}
                    {(onViewPreAnalysis || onViewAnalysis) && (onViewProcessInfo || onAssignMember || onChangeStage || onSync) && (
                      <DropdownMenuSeparator className="md:hidden" />
                    )}
                    {onViewProcessInfo && (
                      <DropdownMenuItem
                        onClick={() => {
                          onViewProcessInfo();
                          setProcessMenuOpen(false);
                        }}
                        className="gap-2"
                      >
                        <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Informações do Processo
                      </DropdownMenuItem>
                    )}
                    {onAssignMember && (
                      <DropdownMenuItem
                        onClick={() => {
                          onAssignMember();
                          setProcessMenuOpen(false);
                        }}
                        className="gap-2"
                      >
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Atribuir Membro
                      </DropdownMenuItem>
                    )}
                    {isAdmin && onChangeStage && (
                      <DropdownMenuItem
                        onClick={() => {
                          onChangeStage();
                          setProcessMenuOpen(false);
                        }}
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        Alterar Etapa do Processo
                      </DropdownMenuItem>
                    )}
                    {onSync && (
                      <DropdownMenuItem
                        onClick={() => {
                          onSync();
                          setProcessMenuOpen(false);
                        }}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        Sincronizar Processo
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Second row: Process title (middleContent) */}
          {middleContent && (
            <div className="mt-3 flex items-center">
              <div className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-slate-800/50 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}>
                {middleContent}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Partes e Empresas */}
      <Dialog open={showPartsModal} onOpenChange={setShowPartsModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Partes e Empresas do Processo
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Polo Ativo */}
            {activeParts.length > 0 && (
              <div className="min-w-0">
                <h4 className="font-semibold text-sm mb-3 text-green-600 dark:text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0"></span>
                  Polo Ativo ({activeParts.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeParts.map((part, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm">
                      <Badge variant="outline" className="mb-2 text-xs">{part.tipo}</Badge>
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 break-words">{part.nome}</p>
                      {part.documento?.numero && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs break-all">
                          {part.documento.tipo === "CPF" ? `CPF: ${formatCpf(part.documento.numero)}` : `${part.documento.tipo}: ${part.documento.numero}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polo Passivo */}
            {passiveParts.length > 0 && (
              <div className="min-w-0">
                <h4 className="font-semibold text-sm mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full flex-shrink-0"></span>
                  Polo Passivo ({passiveParts.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {passiveParts.map((part, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm">
                      <Badge variant="outline" className="mb-2 text-xs">{part.tipo}</Badge>
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 break-words">{part.nome}</p>
                      {part.documento?.numero && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs break-all">
                          {part.documento.tipo === "CPF" ? `CPF: ${formatCpf(part.documento.numero)}` : `${part.documento.tipo}: ${part.documento.numero}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empresas */}
            {companies.length > 0 && (
              <div className="min-w-0">
                <h4 className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  Empresas Envolvidas ({companies.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {companies.map((company, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        onCompanyClick?.(company);
                        setShowPartsModal(false);
                      }}
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 break-words">{company.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 mb-2 text-xs break-all">CNPJ: {mascararCNPJ(company.cnpj)}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {company.score !== undefined && (
                          <Badge variant={company.score >= 7 ? "default" : "destructive"} className="text-xs">
                            Score: {company.score}
                          </Badge>
                        )}
                        {company.specialRule && (
                          <Badge 
                            variant={company.specialRule === SpecialRule.SOLVENT ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {company.specialRule === SpecialRule.SOLVENT ? "Solvente" : "Insolvente"}
                          </Badge>
                        )}
                        {!company.specialRule && (
                          <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                            Solvência: N/D
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há partes */}
            {activeParts.length === 0 && passiveParts.length === 0 && companies.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma parte ou empresa encontrada para este processo.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
