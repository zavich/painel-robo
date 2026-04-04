import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DollarSign,
  Calendar,
  User,
  Building2,
  ChevronDown,
  UserCheck,
  MoreVertical,
  BellDot,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Layers,
  Folder,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { capitalizeWords } from "@/app/utils/format";
import {
  Company,
  Process,
  Situation,
} from "@/app/interfaces/processes";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChangeStageDialog } from "@/components/process/ChangeStageDialog";
import { getClaimant, getDefendant, getProcessTitle } from "@/app/utils/processPartsUtils";
import { formatCurrency, formatDate } from "@/app/utils/formatUtils";
import { formatCpf } from "@/app/utils/masks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProcessStatusBadge } from "@/components/ProcessStatusComponent";
import { useTheme } from "@/app/hooks/use-theme-client";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { hasError, isProcessing } from "@/app/utils/processSyncStatus";

interface KanbanCardProps {
  process: Process;
  onOpenCompany?: (company: Company) => void;
  isAdmin?: boolean;
}

function getBorderColor(status: Situation) {
  switch (status) {
    case Situation.LOSS:
      return "border-red-300 border-l-4 border-l-red-500";
    case Situation.APPROVED:
      return "border-green-300 border-l-4 border-l-green-500";
    case Situation.PENDING:
    default:
      return "border-gray-200";
  }
}

function getCardBackground(status: Situation, theme: string) {
  if (theme === "dark") {
    switch (status) {
      case Situation.LOSS:
        return "bg-gradient-to-br from-red-900/20 to-gray-800 hover:from-red-900/30 hover:to-red-900/10";
      case Situation.APPROVED:
        return "bg-gradient-to-br from-green-900/20 to-gray-800 hover:from-green-900/30 hover:to-green-900/10";
      case Situation.PENDING:
      default:
        return "bg-gradient-to-br from-gray-800 to-gray-900/50 hover:from-gray-700 hover:to-blue-900/20";
    }
  }
  
  switch (status) {
    case Situation.LOSS:
      return "bg-gradient-to-br from-red-50/30 to-white hover:from-red-50/50 hover:to-red-50/20";
    case Situation.APPROVED:
      return "bg-gradient-to-br from-green-50/30 to-white hover:from-green-50/50 hover:to-green-50/20";
    case Situation.PENDING:
    default:
      return "bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-blue-50/30";
  }
}

export const KanbanCard = ({ process, onOpenCompany, isAdmin = false }: KanbanCardProps) => {
  const [showSelect, setShowSelect] = useState(false);
  const [, setIsHovered] = useState(false);
  const [showChangeStageDialog, setShowChangeStageDialog] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const claimantPart = getClaimant(process.processParts || []);
  const defendantPart = getDefendant(process.processParts || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: process._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/processes/${process.number}`);
  };

  const processTitle = getProcessTitle(
    process?.processParts || [],
    process.number,
    process?.title || (process as any)?.formPipedrive?.title
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`cursor-pointer transition-all duration-300 kanban-card border shadow-lg hover:shadow-xl ${getBorderColor(
        process?.situation ?? Situation.PENDING
      )} ${isDragging ? "opacity-50 scale-105 dragging" : ""
        } w-full max-w-full ${getCardBackground(process?.situation ?? Situation.PENDING, theme)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div {...listeners} className="w-full h-full" onClick={handleClick}>
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex flex-col gap-3">
            {/* Título do Processo */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <h4 className={`font-bold text-sm leading-tight break-words ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>
                  {capitalizeWords(processTitle)}
                </h4>
                <p className={`text-xs font-mono break-all ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  {process.number}
                </p>
                <div className="flex flex-wrap gap-2">
                  {process.hasNewMovementsNow && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Novas movimentações
                    </span>
                  )}
                  {process.class === "MAIN" && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                      theme === "dark"
                        ? "bg-gray-900/50 text-gray-300 border-gray-700"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        theme === "dark" ? "bg-gray-400" : "bg-gray-500"
                      }`}></div>
                      Principal
                    </span>
                  )}
                  {process.class === "PROVISIONAL_EXECUTION" && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                      theme === "dark"
                        ? "bg-yellow-900/50 text-yellow-300 border-yellow-700"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        theme === "dark" ? "bg-yellow-400" : "bg-yellow-500"
                      }`}></div>
                      Execução Provisória
                    </span>
                  )}
                  
                  {/* Process Status Badge */}
                  {isProcessing(process.processStatus) && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border animate-pulse ${
                      theme === "dark"
                        ? "bg-amber-900/50 text-amber-300 border-amber-700"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}>
                      <RefreshCw className={`h-3 w-3 animate-spin ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`} />
                      Processando
                    </span>
                  )}
                  {hasError(process.processStatus) && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                      theme === "dark"
                        ? "bg-red-900/50 text-red-300 border-red-700"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}>
                      <AlertCircle className={`h-3 w-3 ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
                      Erro
                    </span>
                  )}
                  
                  {/* Status Badge */}
                  {process.situation === Situation.LOSS && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                      theme === "dark"
                        ? "bg-red-900/50 text-red-300 border-red-700"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}>
                      <XCircle className={`h-3 w-3 ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
                      Rejeitado
                    </span>
                  )}
                  {process.situation === Situation.APPROVED && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                      theme === "dark"
                        ? "bg-green-900/50 text-green-300 border-green-700"
                        : "bg-green-100 text-green-800 border-green-200"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        theme === "dark" ? "bg-green-400" : "bg-green-500"
                      }`}></div>
                      Aprovado
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Company button */}
                {Array.isArray(process.companies) &&
                  process.companies.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-1 border group ${
                          theme === "dark"
                            ? "hover:bg-blue-900/50 border-blue-700 hover:border-blue-600"
                            : "hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                        }`}
                        title="Listar empresas"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSelect((prev) => !prev);
                        }}
                      >
                        <Building2 className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        }`} />
                        <ChevronDown className={`h-3 w-3 ${
                          theme === "dark" ? "text-blue-400" : "text-blue-500"
                        }`} />
                      </button>
                      {showSelect && (
                        <div className={`absolute right-0 top-10 z-10 rounded-xl shadow-xl min-w-[220px] max-w-[300px] overflow-hidden border ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}>
                          {process.companies.map((company, idx) => (
                            <button
                              key={company.cnpj || idx}
                              className={`w-full text-left px-4 py-3 text-sm break-words border-b last:border-b-0 transition-colors ${
                                theme === "dark"
                                  ? "hover:bg-gray-700 border-gray-700"
                                  : "hover:bg-blue-50 border-gray-100"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSelect(false);
                                if (!company) {
                                  return;
                                }
                                onOpenCompany?.(company);
                              }}
                            >
                              <div className={`truncate font-medium ${
                                theme === "dark" ? "text-gray-100" : "text-gray-900"
                              }`}>
                                {company.name || company.cnpj}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                {/* Admin menu */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`p-2 rounded-xl transition-all duration-200 border group ${
                          theme === "dark"
                            ? "hover:bg-gray-700 border-gray-600 hover:border-gray-500"
                            : "hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                        title="Opções do administrador"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`min-w-[160px] rounded-xl shadow-lg border ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}>
                      <DropdownMenuItem
                        className={`rounded-lg ${
                          theme === "dark"
                            ? "hover:bg-blue-900/50 text-blue-300"
                            : "hover:bg-blue-50 text-blue-700"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowChangeStageDialog(true);
                        }}
                      >
                        Alterar Etapa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4 pb-4">
          {/* Reclamante */}
          <div className="flex items-center gap-3 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-blue-900/50" : "bg-blue-50"
            }`}>
              <User className={`h-4 w-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Reclamante</span>
              <span className={`font-semibold truncate block ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                {capitalizeWords(claimantPart?.nome || "-")}
              </span>
              {claimantPart?.documento?.numero && (
                <span className={`text-xs font-mono ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  CPF: {formatCpf(claimantPart.documento.numero)}
                </span>
              )}
            </div>
          </div>

          {/* Empresa Ré */}
          {defendantPart?.nome && (
            <div className="flex items-center gap-3 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-orange-900/50" : "bg-orange-50"
            }`}>
              <Building2 className={`h-4 w-4 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Empresa Ré</span>
              <span className={`font-semibold truncate block ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                {capitalizeWords(defendantPart.nome)}
              </span>
              </div>
            </div>
          )}

          {process.processOwner && (
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                theme === "dark" ? "bg-green-900/50" : "bg-green-50"
              }`}>
                <UserCheck className={`h-4 w-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Responsável</span>
                <span className={`font-semibold truncate block ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}>
                  {process.processOwner.user?.email}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-green-900/50" : "bg-green-50"
            }`}>
              <DollarSign className={`h-4 w-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Valor da Causa</span>
              <span className={`font-bold truncate block ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}>
                {formatCurrency(process.valueCase || 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <Calendar className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Data de Distribuição</span>
              <span className={`font-medium truncate block ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                {formatDate(process.createdAt)}
              </span>
            </div>
          </div>

          {/* Indicadores de Instâncias e Documentos */}
          <div className="flex items-center gap-2 text-xs">
            {/* Instâncias */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
              process.isInstancias
                ? theme === "dark"
                  ? "bg-blue-900/30 text-blue-300 border-blue-700"
                  : "bg-blue-50 text-blue-700 border-blue-200"
                : theme === "dark"
                  ? "bg-gray-800/50 text-gray-400 border-gray-700"
                  : "bg-gray-100 text-gray-500 border-gray-300"
            }`}>
              <Layers className={`h-3 w-3 ${
                process.isInstancias
                  ? theme === "dark" ? "text-blue-400" : "text-blue-600"
                  : theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`} />
              <span className="font-medium">
                {process.isInstancias ? "Instâncias" : "Sem instâncias"}
              </span>
            </div>

            {/* Documentos */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
              process.isDocuments
                ? theme === "dark"
                  ? "bg-green-900/30 text-green-300 border-green-700"
                  : "bg-green-50 text-green-700 border-green-200"
                : theme === "dark"
                  ? "bg-gray-800/50 text-gray-400 border-gray-700"
                  : "bg-gray-100 text-gray-500 border-gray-300"
            }`}>
              <Folder className={`h-3 w-3 ${
                process.isDocuments
                  ? theme === "dark" ? "text-green-400" : "text-green-600"
                  : theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`} />
              <span className="font-medium">
                {process.isDocuments ? "Documentos" : "Sem documentos"}
              </span>
            </div>
          </div>

          {/* Processo Provisório */}
          {process.class === "MAIN" && process.calledByProvisionalLawsuitNumber && (
            <div className="flex items-center gap-3 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-purple-900/50" : "bg-purple-50"
            }`}>
              <FileText className={`h-4 w-4 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Processo Provisório</span>
              <span className={`font-semibold text-xs font-mono break-all ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}>
                {process.calledByProvisionalLawsuitNumber}
              </span>
              </div>
            </div>
          )}

          {/* Processo Principal */}
          {process.class === "PROVISIONAL_EXECUTION" && process.processMain?.number && (
            <div className="flex items-center gap-3 text-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-indigo-900/50" : "bg-indigo-50"
            }`}>
              <FileText className={`h-4 w-4 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs block ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Processo Principal</span>
              <span className={`font-semibold text-xs font-mono break-all ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`}>
                {process.processMain.number}
              </span>
              </div>
            </div>
          )}

          {/* PROCESSO REJEITADO - MOTIVO */}
          {process.situation === Situation.LOSS && (
            <div className="flex w-full justify-start mt-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full ${
                theme === "dark"
                  ? "bg-red-900/30 border-red-700"
                  : "bg-red-50 border-red-200"
              }`}>
                <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${
                  theme === "dark" ? "text-red-400" : "text-red-600"
                }`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium block ${
                    theme === "dark" ? "text-red-300" : "text-red-800"
                  }`}>Processo Rejeitado</span>
                  <span className={`text-xs truncate block ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {process.processDecisions?.history?.find(h => h.status === Situation.LOSS)?.rejection_reason || "Motivo não informado"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Change Stage Dialog */}
      {isAdmin && (
        <ChangeStageDialog
          process={process}
          open={showChangeStageDialog}
          onOpenChange={setShowChangeStageDialog}
        />
      )}
    </Card>
  );
};
