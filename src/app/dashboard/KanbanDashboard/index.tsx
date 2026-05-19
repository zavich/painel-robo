import { Activity } from "@/app/api/hooks/process/useCreateActivity";
import { useProcessFetch } from "@/app/api/hooks/process/useInsertProcess";
import { useRejectionReasons } from "@/app/api/hooks/process/useRejectionReasons";
import { useProcesses } from "@/app/api/hooks/processes/useProcesses";
import { useAssignableUsers } from "@/app/api/hooks/users/useAssignableUsers";
import { useFilter } from "@/app/hooks/filter/useFilter";
import { useToast } from "@/app/hooks/use-toast";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Process } from "@/app/interfaces/processes";
import { UserRolesEnum } from "@/app/interfaces/user";
import { exportToExcel } from "@/app/utils/excelExport";
import { ExportColumnsDialog } from "@/components/ExportColumnsDialog";
import { FiltersBar } from "@/components/FiltersBar";
import InsertProcessModal from "@/components/process/InsertProcessModal";
import { MassEditPanel } from "@/components/process/MassEditPanel";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isWithinInterval, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProcessTableHeader } from "./ProcessTableHeader";
import { ProcessTableRow } from "./ProcessTableRow";
import { ProcessTableToolbar } from "./ProcessTableToolbar";

export default function KanbanDashboard() {
  const { user } = useAuth();
  const { filters, setFilter, resetFilters } = useFilter();
  const searchParams = useSearchParams();
  const { fetchData } = useProcessFetch();
  const [page, setPage] = useState<number>(1);
  const [, setBreadcrumbFixed] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [selectedProcessIds, setSelectedProcessIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectAllMode, setSelectAllMode] = useState<"page" | "all" | null>(
    null,
  );
  const [showMassEditPanel, setShowMassEditPanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: usersData } = useAssignableUsers();
  const { data: rejectionReasons } = useRejectionReasons();

  type ApiFilterParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    classProcess?: string;
    startDate?: string;
    endDate?: string;
    lossReason?: string;
    emptyDocuments?: boolean;
    emptyInstances?: boolean;
    hasNewMovementsNow?: boolean;
    hasSecondInstance?: boolean;
    hasAutos?: boolean;
    hasAcordao?: boolean;
    type?: string;
    assignedTo?: string;
    stage?: string;
  };

  const apiFilters = useMemo(() => {
    const baseFilters: ApiFilterParams = {
      page,
      limit: 25,
    };

    if (filters.search && String(filters.search) !== "") {
      baseFilters.search = String(filters.search);
    }

    if (filters.status && String(filters.status) !== "all") {
      baseFilters.status = String(filters.status);
    }

    if (filters.classProcess && String(filters.classProcess) !== "all") {
      baseFilters.classProcess = String(filters.classProcess);
    }

    if (filters.startDate) {
      baseFilters.startDate = String(filters.startDate);
    }

    if (filters.endDate) {
      baseFilters.endDate = String(filters.endDate);
    }

    // Motivo de perda - converter key para label
    if (filters.lossReason && String(filters.lossReason) !== "all") {
      const reasonKey = String(filters.lossReason);
      // Buscar a label correspondente à key
      const reason = rejectionReasons?.find((r) => r.key === reasonKey);
      // Usar a label se encontrada, senão usar a key como fallback
      baseFilters.lossReason = reason?.label || reasonKey;
    }

    // Filtros de conteúdo
    if (filters.emptyDocuments !== undefined && filters.emptyDocuments) {
      baseFilters.emptyDocuments = true;
    }

    if (filters.emptyInstances !== undefined && filters.emptyInstances) {
      baseFilters.emptyInstances = true;
    }

    if (
      filters.hasNewMovementsNow !== undefined &&
      filters.hasNewMovementsNow
    ) {
      baseFilters.hasNewMovementsNow = true;
    }
    if (filters.hasSecondInstance !== undefined && filters.hasSecondInstance) {
      baseFilters.hasSecondInstance = true;
    }

    if (filters.hasAutos !== undefined && filters.hasAutos) {
      baseFilters.hasAutos = true;
    }

    if (filters.hasAcordao !== undefined && filters.hasAcordao) {
      baseFilters.hasAcordao = true;
    }

    return baseFilters;
  }, [filters, page, rejectionReasons]);

  // Separate API filters params (without page and limit) - used for MassEditPanel when selecting all
  const apiFiltersParams = useMemo(() => {
    const params: ApiFilterParams = {};

    if (filters.search && String(filters.search) !== "") {
      params.search = String(filters.search);
    }

    if (filters.status && String(filters.status) !== "all") {
      params.status = String(filters.status);
    }

    if (filters.type && String(filters.type) !== "all") {
      params.type = String(filters.type);
    }

    if (filters.startDate) {
      params.startDate = String(filters.startDate);
    }

    if (filters.endDate) {
      params.endDate = String(filters.endDate);
    }

    // Motivo de perda - converter key para label
    if (filters.lossReason && String(filters.lossReason) !== "all") {
      const reasonKey = String(filters.lossReason);
      // Buscar a label correspondente à key
      const reason = rejectionReasons?.find((r) => r.key === reasonKey);
      // Usar a label se encontrada, senão usar a key como fallback
      params.lossReason = reason?.label || reasonKey;
    }

    // Filtros de conteúdo
    if (filters.emptyDocuments !== undefined && filters.emptyDocuments) {
      params.emptyDocuments = true;
    }

    if (filters.emptyInstances !== undefined && filters.emptyInstances) {
      params.emptyInstances = true;
    }

    if (
      filters.hasNewMovementsNow !== undefined &&
      filters.hasNewMovementsNow
    ) {
      params.hasNewMovementsNow = true;
    }

    if (filters.hasSecondInstance !== undefined && filters.hasSecondInstance) {
      params.hasSecondInstance = true;
    }

    if (filters.hasAutos !== undefined && filters.hasAutos) {
      params.hasAutos = true;
    }

    if (filters.hasAcordao !== undefined && filters.hasAcordao) {
      params.hasAcordao = true;
    }

    return params;
  }, [filters, rejectionReasons]);
  const { data, isLoading } = useProcesses(apiFilters);

  const [, setReturnTo] = useState<string>("");

  useEffect(() => {
    const returnToParam = searchParams.get("returnTo");

    if (returnToParam) {
      setReturnTo(returnToParam);
    } else {
      setReturnTo("");
    }
  }, [searchParams]);

  // Store pagination info
  const [paginationInfo, setPaginationInfo] = useState<{
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }>({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    setPage(1);
    setPaginationInfo({
      total: 0,
      totalPages: 0,
      page: 1,
      limit: 10,
    });
  }, [filters]);

  useEffect(() => {
    if (data) {
      // Update pagination info
      setPaginationInfo({
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        page: data.page || page,
        limit: data.limit || 10,
      });
    }
  }, [data, page]);

  const allProcesses: Process[] = useMemo(() => {
    // Use current page processes only
    return data?.processes || [];
  }, [data]);

  const selectedProcesses = useMemo(() => {
    return allProcesses.filter((p) => selectedProcessIds.has(p._id));
  }, [allProcesses, selectedProcessIds]);

  // Open mass edit panel when processes are selected
  useEffect(() => {
    if (selectedProcessIds.size > 0) {
      setShowMassEditPanel(true);
    } else {
      setShowMassEditPanel(false);
    }
  }, [selectedProcessIds.size]);

  const handleCloseMassEdit = () => {
    setShowMassEditPanel(false);
    setSelectedProcessIds(new Set());
    setSelectAllMode(null);
  };

  // Handle export to Excel - opens dialog
  const handleOpenExportDialog = () => {
    setShowExportDialog(true);
  };

  // Handle export with selected columns
  const handleExportWithColumns = async (
    selectedColumns: string[],
    exportAll: boolean,
  ) => {
    try {
      let processesToExport: Process[] = [];

      if (exportAll) {
        // Export all processes from database using very small batches
        // MongoDB has memory limit on sort operations - use smaller batches
        const SAFE_LIMIT = 25; // Very small limit to avoid MongoDB sort memory error
        const MAX_RETRIES = 2; // Retry failed pages

        toast({
          title: "Iniciando exportação...",
          description: `Preparando para carregar ${totalProcessesInDB} processos em lotes pequenos e seguros...`,
        });

        const { getProcesses } =
          await import("@/app/api/hooks/processes/useProcesses");

        // Calculate how many pages we need
        // Use paginationInfo total
        const totalProcesses = paginationInfo.total || 0;
        const maxPages = Math.ceil(totalProcesses / SAFE_LIMIT);
        // Fetch all pages with progress feedback
        // IMPORTANTE: Se qualquer página falhar, PARA IMEDIATAMENTE
        for (let page = 1; page <= maxPages; page++) {
          const progress = Math.round((page / maxPages) * 100);

          toast({
            title: `Carregando página ${page} de ${maxPages}`,
            description: `Progresso: ${progress}% - ${processesToExport.length} processos carregados`,
          });

          let retries = 0;
          let pageSuccess = false;
          let lastError: unknown = null;

          // Tenta a página atual até MAX_RETRIES vezes
          while (retries <= MAX_RETRIES && !pageSuccess) {
            try {
              if (retries > 0) {
                toast({
                  title: `Tentando novamente página ${page}...`,
                  description: `Tentativa ${retries + 1} de ${MAX_RETRIES + 1}`,
                });
                // Wait before retry
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retries),
                );
              }

              const pageData = await getProcesses({
                ...apiFilters,
                page,
                limit: SAFE_LIMIT,
              });

              const newProcesses = pageData.processes || [];

              processesToExport = [...processesToExport, ...newProcesses];
              pageSuccess = true;

              // Small delay to avoid overwhelming the server
              if (page < maxPages) {
                await new Promise((resolve) => setTimeout(resolve, 300));
              }
            } catch (pageError: unknown) {
              retries++;
              lastError = pageError;

              const err = pageError as { response?: { data?: { message?: string }; status?: number | string }; message?: string };
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Erro desconhecido";
              const statusCode = err?.response?.status || "desconhecido";

              console.error(
                `❌ Erro ${statusCode} na página ${page} (tentativa ${retries}/${MAX_RETRIES + 1}):`,
                errorMessage,
              );

              // Se esgotou todas as tentativas, PARA COMPLETAMENTE
              if (retries > MAX_RETRIES) {
                console.error(
                  `💥 PARANDO EXPORTAÇÃO - Todas as tentativas falharam na página ${page}`,
                );

                // Check for MongoDB memory error
                const isMemoryError =
                  errorMessage.includes("memory limit") ||
                  errorMessage.includes("allowDiskUse");

                const detailedError = isMemoryError
                  ? `Erro do servidor (MongoDB): Memória insuficiente para ordenação.\n\n` +
                    `🔴 Página que falhou: ${page}\n` +
                    `✅ Processos carregados: ${processesToExport.length} de ${totalProcessesInDB}\n` +
                    `📄 Páginas completadas: ${page - 1} de ${maxPages}\n\n` +
                    `Solução: O backend precisa ativar 'allowDiskUse:true' nas queries do MongoDB.`
                  : `Erro ao carregar página ${page} após ${MAX_RETRIES + 1} tentativas.\n\n` +
                    `🔴 Status HTTP: ${statusCode}\n` +
                    `✅ Processos carregados: ${processesToExport.length} de ${totalProcessesInDB}\n` +
                    `📄 Páginas completadas: ${page - 1} de ${maxPages}\n` +
                    `❌ Erro: ${errorMessage}\n\n` +
                    `A exportação foi INTERROMPIDA para evitar dados incompletos.`;

                throw new Error(detailedError);
              }

              // Aguarda antes da próxima tentativa
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }

          // Se chegou aqui e não teve sucesso, algo deu muito errado
          if (!pageSuccess) {
            console.error(
              `💥 ERRO CRÍTICO: Página ${page} não foi carregada após todas as tentativas`,
            );
            throw new Error(
              `Falha crítica ao carregar página ${page}.\n\n` +
                `✅ Processos salvos: ${processesToExport.length}\n` +
                `🔴 Exportação INTERROMPIDA na página ${page}`,
            );
          }
        }

        if (processesToExport.length === 0) {
          throw new Error(
            "Nenhum processo foi carregado. Verifique a conexão com o servidor.",
          );
        }
      } else {
        // Export only filtered processes
        processesToExport = filteredProcesses;
      }

      toast({
        title: "Gerando arquivo Excel...",
        description: `Processando ${processesToExport.length} ${processesToExport.length === 1 ? "processo" : "processos"}...`,
      });

      await exportToExcel(
        processesToExport,
        "processos-lista",
        selectedColumns,
      );

      toast({
        title: "✅ Exportação concluída!",
        description: `${processesToExport.length} ${processesToExport.length === 1 ? "processo exportado" : "processos exportados"} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível exportar os processos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Calculate total processes from pagination info
  const totalProcessesInDB = useMemo(() => {
    return paginationInfo.total || 0;
  }, [paginationInfo]);

  // Helper function to filter activities based on user role
  const getFilteredActivities = (process: Process): Activity[] => {
    const activities: Activity[] = process?.activities || [];

    if (user?.role === UserRolesEnum.ADMIN) {
      // Admin vê todas as atividades
      return activities;
    } else {
      // Outros usuários veem apenas atividades em que estão envolvidos
      const userId = user?._id;
      if (!userId) return [];

      return activities.filter((activity) => {
        // Verificar se o usuário está atribuído à atividade
        const assignedToId =
          typeof activity.assignedTo === "string"
            ? activity.assignedTo
            : activity.assignedTo?._id;

        // Verificar se o usuário completou a atividade
        const completedById =
          typeof activity.completedBy === "string"
            ? activity.completedBy
            : activity.completedBy?._id;

        // Verificar se o usuário atribuiu a atividade
        const assignedById =
          typeof activity.assignedBy === "string"
            ? activity.assignedBy
            : activity.assignedBy?._id;

        return (
          assignedToId === userId ||
          completedById === userId ||
          assignedById === userId
        );
      });
    }
  };

  // Get selected count based on mode
  const selectedCount = useMemo(() => {
    if (selectAllMode === "all") {
      return totalProcessesInDB;
    }
    return selectedProcessIds.size;
  }, [selectAllMode, selectedProcessIds.size, totalProcessesInDB]);

  const filteredProcesses: Process[] = useMemo(() => {
    return allProcesses.filter((process) => {
      if (filters.stageDateFrom || filters.stageDateTo) {
        const processDate = process.createdAt
          ? parseISO(process.createdAt)
          : undefined;
        if (processDate) {
          if (filters.stageDateFrom && filters.stageDateTo) {
            if (
              !isWithinInterval(processDate, {
                start:
                  typeof filters.stageDateFrom === "string"
                    ? new Date(filters.stageDateFrom)
                    : new Date(),
                end:
                  typeof filters.stageDateTo === "string"
                    ? new Date(filters.stageDateTo)
                    : new Date(),
              })
            )
              return false;
          } else if (filters.stageDateFrom) {
            if (
              filters.stageDateFrom &&
              processDate <
                (typeof filters.stageDateFrom === "string"
                  ? new Date(filters.stageDateFrom)
                  : filters.stageDateFrom)
            )
              return false;
          } else if (filters.stageDateTo) {
            if (
              processDate >
              (typeof filters.stageDateTo === "string"
                ? new Date(filters.stageDateTo)
                : filters.stageDateTo)
            )
              return false;
          }
        }
      }
      return true;
    });
  }, [allProcesses, filters]);

  // Check if all visible processes are selected
  const allVisibleSelected = useMemo(() => {
    if (filteredProcesses.length === 0) return false;
    return filteredProcesses.every((p) => selectedProcessIds.has(p._id));
  }, [filteredProcesses, selectedProcessIds]);

  // Check if some (but not all) visible processes are selected
  const someVisibleSelected = useMemo(() => {
    if (selectedProcessIds.size === 0 || filteredProcesses.length === 0)
      return false;
    return (
      filteredProcesses.some((p) => selectedProcessIds.has(p._id)) &&
      !allVisibleSelected
    );
  }, [filteredProcesses, selectedProcessIds, allVisibleSelected]);

  // Auto-detect when all visible are selected and update mode
  useEffect(() => {
    if (
      allVisibleSelected &&
      filteredProcesses.length > 0 &&
      selectedProcessIds.size === filteredProcesses.length &&
      selectAllMode !== "all"
    ) {
      setSelectAllMode("page");
    } else if (selectedProcessIds.size === 0) {
      setSelectAllMode(null);
    }
  }, [
    allVisibleSelected,
    filteredProcesses.length,
    selectedProcessIds.size,
    selectAllMode,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (breadcrumbRef.current) {
        const { top } = breadcrumbRef.current.getBoundingClientRect();
        setBreadcrumbFixed(top <= 0);
      }
      setShowScrollTopButton(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Normalizar filtros
  const normalizedFilters = useMemo(
    () => ({
      search:
        typeof filters.search === "string"
          ? filters.search
          : String(filters.search || ""),
      status:
        typeof filters.status === "string"
          ? filters.status
          : String(filters.status ?? "all"),
      classProcess:
        typeof filters.classProcess === "string"
          ? filters.classProcess
          : String(filters.classProcess ?? "all"),
      startDate:
        typeof filters.startDate === "string"
          ? new Date(filters.startDate)
          : typeof filters.startDate === "object" &&
              filters.startDate !== null &&
              !Array.isArray(filters.startDate)
            ? (filters.startDate as Date)
            : undefined,
      endDate:
        typeof filters.endDate === "string"
          ? new Date(filters.endDate)
          : typeof filters.endDate === "object" &&
              filters.endDate !== null &&
              !Array.isArray(filters.endDate)
            ? (filters.endDate as Date)
            : undefined,
      lossReason:
        typeof filters.lossReason === "string"
          ? filters.lossReason
          : String(filters.lossReason ?? "all"),
      contentFilter:
        typeof filters.contentFilter === "string"
          ? filters.contentFilter
          : String(filters.contentFilter ?? "all"),
      emptyDocuments: filters.emptyDocuments || false,
      emptyInstances: filters.emptyInstances || false,
      hasNewMovementsNow: filters.hasNewMovementsNow || false,
      hasSecondInstance: filters.hasSecondInstance || false,
      hasAutos: filters.hasAutos || false,
      hasAcordao: filters.hasAcordao || false,
    }),
    [filters],
  );

  const handleOpenInsertModal = () => {
    setIsInsertModalOpen(true);
  };

  const handleCloseInsertModal = () => {
    setIsInsertModalOpen(false);
  };

  const handleInsertProcess = async (
    processNumber: string,
    file: File | null,
  ) => {
    try {
      if (processNumber) {
        const res = await fetchData({
          type: "number",
          value: [processNumber],
        });
      } else {
        await fetchData({
          type: "upload",
          file: file as File,
        });
      }
      toast({
        title: "Processo inserido com sucesso!",
        description: `O processo ${processNumber} foi inserido e está sendo processado. Ele aparecerá na lista em breve.`,
      });
      handleCloseInsertModal();
    } catch (error) {
      toast({
        title: "Erro ao inserir processo",
        description: "Ocorreu um erro ao inserir o processo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      style={{
        marginRight: showMassEditPanel ? "420px" : "0",
        transition: "margin-right 0.3s ease-in-out",
      }}
    >
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-8 bg-gradient-to-b from-background via-background to-muted/30">
        <>
          <div className="mb-4 flex items-center justify-end">
            <Button
              onClick={handleOpenInsertModal}
              className="ml-4 bg-gradient-to-r from-secondary to-accent text-white shadow-md focus:ring-2 focus:ring-secondary/30 hover:from-secondary hover:to-accent"
            >
              Inserir Processo
            </Button>
          </div>
          <div className="mb-8">
            <FiltersBar
              filters={{
                search: normalizedFilters.search,
                status: normalizedFilters.status,
                classProcess: normalizedFilters.classProcess,
                startDate: normalizedFilters.startDate,
                endDate: normalizedFilters.endDate,
                lossReason: normalizedFilters.lossReason,
                contentFilter: normalizedFilters.contentFilter,
                emptyDocuments: Boolean(normalizedFilters.emptyDocuments),
                emptyInstances: Boolean(normalizedFilters.emptyInstances),
                hasNewMovementsNow: Boolean(
                  normalizedFilters.hasNewMovementsNow,
                ),
                hasSecondInstance: Boolean(normalizedFilters.hasSecondInstance),
                hasAutos: Boolean(normalizedFilters.hasAutos),
                hasAcordao: Boolean(normalizedFilters.hasAcordao),
              }}
              onFiltersChange={(newFilters) => {
                Object.entries(newFilters).forEach(([key, value]) =>
                  setFilter(
                    key,
                    value as string | number | boolean | null | undefined,
                  ),
                );
              }}
              onApplyFilters={() => {
                // React Query will automatically refetch when apiFilters change
              }}
              onClearFilters={() => {
                resetFilters();
              }}
              isLoading={isLoading && page === 1}
            />
          </div>

          {/* Skeleton loading for filtered results */}
          {isLoading &&
            (filters.search ||
              filters.status !== "all" ||
              (filters.type && filters.type !== "all") ||
              (filters.lossReason && filters.lossReason !== "all") ||
              filters.startDate ||
              filters.endDate ||
              filters.emptyDocuments ||
              filters.emptyInstances ||
              filters.hasNewMovementsNow) && (
              <div className="space-y-8">
                {/* List/Table Skeleton */}
                <div className="rounded-2xl border overflow-hidden bg-card/80 backdrop-blur-xl border-border shadow-xl">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="p-6 space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-lg animate-pulse bg-gray-100 dark:bg-gray-700/50"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Loading indicator */}
                <div className="flex justify-center py-8">
                  <div className="rounded-2xl shadow-lg p-6 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border-4 rounded-full animate-spin border-blue-200 dark:border-blue-400 border-t-blue-500"></div>
                      <span className="font-medium text-foreground">
                        Aplicando filtros...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Actual content */}
          {/* Loading skeleton for initial load (page 1, no filters) */}
          {isLoading &&
          page === 1 &&
          !filters.search &&
          filters.status === "all" &&
          (!filters.type || filters.type === "all") &&
          (!filters.lossReason || filters.lossReason === "all") &&
          !filters.startDate &&
          !filters.endDate &&
          !filters.emptyDocuments &&
          !filters.emptyInstances &&
          !filters.hasNewMovementsNow ? (
            <div className="backdrop-blur-sm rounded-2xl border shadow-lg overflow-hidden bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Número do Processo</TableHead>
                      <TableHead>Valor da Causa</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-center">Instâncias</TableHead>
                      <TableHead className="text-center">Documentos</TableHead>
                      <TableHead className="text-center">Atividades</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(10)].map((_, i) => (
                      <TableRow
                        key={i}
                        className="border-gray-200 dark:border-gray-700"
                      >
                        <TableCell className="text-center">
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* List/Table View */
            <div className="backdrop-blur-sm rounded-2xl border shadow-lg overflow-hidden bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
              <ProcessTableToolbar
                totalProcessesInDB={totalProcessesInDB}
                filteredProcesses={filteredProcesses}
                selectedCount={selectedCount}
                selectAllMode={selectAllMode}
                allVisibleSelected={allVisibleSelected}
                handleOpenExportDialog={handleOpenExportDialog}
                setSelectAllMode={setSelectAllMode}
                setSelectedProcessIds={setSelectedProcessIds}
              />

              <div className="overflow-x-auto overflow-y-visible">
                <div className="min-w-max">
                  <Table>
                    <ProcessTableHeader
                      allVisibleSelected={allVisibleSelected}
                      someVisibleSelected={someVisibleSelected}
                      filteredProcesses={filteredProcesses}
                      setSelectedProcessIds={setSelectedProcessIds}
                      setSelectAllMode={setSelectAllMode}
                    />
                    <TableBody>
                      {filteredProcesses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Nenhum processo encontrado
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProcesses.map((process) => (
                          <ProcessTableRow
                            key={process._id}
                            process={process}
                            isSelected={selectedProcessIds.has(process._id)}
                            selectAllMode={selectAllMode}
                            filteredProcesses={filteredProcesses}
                            selectedProcessIds={selectedProcessIds}
                            getFilteredActivities={getFilteredActivities}
                            setSelectedProcessIds={setSelectedProcessIds}
                            setSelectAllMode={setSelectAllMode}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {(() => {
                // Use pagination info from API response, fallback to data if available
                const totalPages =
                  data?.totalPages || paginationInfo.totalPages || 0;
                const totalItems = data?.total || paginationInfo.total || 0;
                const limit = data?.limit || paginationInfo.limit || 10;

                // Always show pagination if there are items, even if only one page
                if (totalItems === 0 && !isLoading) return null;

                // Don't show pagination while loading initial data
                if (isLoading && page === 1 && totalItems === 0) return null;

                return (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                      currentPage={page}
                      totalPages={Math.max(totalPages, 1)}
                      onPageChange={(newPage) => {
                        setPage(newPage);
                        // Clear selection when changing pages
                        setSelectedProcessIds(new Set());
                        setSelectAllMode(null);
                        // Scroll to top of table
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      totalItems={totalItems}
                      itemsPerPage={limit}
                      className="bg-white/80 dark:bg-gray-800/80"
                    />
                  </div>
                );
              })()}
            </div>
          )}

          {/* <CompanyModalDialog
            cnpj={selectedCompany?.cnpj || ""}
            isOpen={showCompanyModal}
            onClose={() => setShowCompanyModal(false)}
          /> */}
        </>
      </main>

      {/* Mass Edit Panel */}
      {showMassEditPanel && selectedCount > 0 && (
        <MassEditPanel
          selectedProcesses={selectAllMode === "all" ? [] : selectedProcesses}
          onClose={handleCloseMassEdit}
          users={usersData?.users || []}
          selectAllMode={selectAllMode}
          totalSelected={selectedCount}
          apiFilters={selectAllMode === "all" ? apiFiltersParams : undefined}
          isAdmin={user?.role === UserRolesEnum.ADMIN}
        />
      )}

      {showScrollTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 z-40 bg-primary text-primary-foreground rounded-2xl shadow-xl p-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          style={{
            right: showMassEditPanel ? "calc(420px + 1.5rem)" : "1.5rem",
            transition: "right 0.3s ease-in-out",
          }}
          title="Ir para o topo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className="group-hover:scale-110 transition-transform"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {/* Export Columns Dialog */}
      <ExportColumnsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExportWithColumns}
        totalProcesses={filteredProcesses.length}
        totalProcessesInDB={totalProcessesInDB}
      />

      {/* Modal para inserir processo */}
      <InsertProcessModal
        isOpen={isInsertModalOpen}
        onClose={handleCloseInsertModal}
        onSubmit={handleInsertProcess}
      />
    </div>
  );
}
