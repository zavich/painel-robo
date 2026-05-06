import {
  Activity,
  ActivityType,
} from "@/app/api/hooks/process/useCreateActivity";
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
import { capitalizeWords } from "@/app/utils/format";
import { getProcessTitle } from "@/app/utils/processPartsUtils";
import { ExportColumnsDialog } from "@/components/ExportColumnsDialog";
import { FiltersBar } from "@/components/FiltersBar";
import InsertProcessModal from "@/components/process/InsertProcessModal";
import { MassEditPanel } from "@/components/process/MassEditPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isWithinInterval, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

  const apiFilters = useMemo(() => {
    const baseFilters: any = {
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
    const params: any = {};

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
          let lastError: any = null;

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
            } catch (pageError: any) {
              retries++;
              lastError = pageError;

              const errorMessage =
                pageError?.response?.data?.message ||
                pageError?.message ||
                "Erro desconhecido";
              const statusCode = pageError?.response?.status || "desconhecido";

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
    const activities: Activity[] = (process as any)?.activities || [];

    if (user?.role === UserRolesEnum.ADMIN) {
      // Admin vê todas as atividades
      return activities;
    } else {
      // Outros usuários veem apenas atividades em que estão envolvidos
      const userId = (user as any)?._id;
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
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-8">
        <>
          <div className="mb-4 flex items-center justify-end">
            <Button
              variant="default"
              onClick={handleOpenInsertModal}
              className="ml-4"
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
                <div className="backdrop-blur-sm rounded-2xl border shadow-lg overflow-hidden bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
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
                      <span className="font-medium text-gray-700 dark:text-gray-300">
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
              <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Lista de Processos
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenExportDialog}
                    className="gap-2 border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                    disabled={filteredProcesses.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <div className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {(() => {
                      const total = totalProcessesInDB;
                      return `${total} ${total === 1 ? "processo" : "processos"}`;
                    })()}
                  </div>
                </div>
              </div>

              {/* Action Bar - Shows when items are selected */}
              {selectedCount > 0 && (
                <div className="px-6 py-3 border-b flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1" />
                </div>
              )}

              {/* Banner for selecting all from database */}
              {selectAllMode === "page" &&
                allVisibleSelected &&
                totalProcessesInDB > filteredProcesses.length && (
                  <div className="px-6 py-3 border-b flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {filteredProcesses.length} processo
                      {filteredProcesses.length !== 1 ? "s" : ""} selecionado
                      {filteredProcesses.length !== 1 ? "s" : ""} nesta página.
                    </span>
                    <button
                      onClick={() => setSelectAllMode("all")}
                      className="text-sm font-semibold underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Selecionar todos os {totalProcessesInDB} processos
                    </button>
                  </div>
                )}

              {/* Banner showing all selected */}
              {selectAllMode === "all" && (
                <div className="px-6 py-3 border-b flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Todos os {totalProcessesInDB} processos estão selecionados.
                  </span>
                  <button
                    onClick={() => {
                      setSelectAllMode("page");
                      setSelectedProcessIds(
                        new Set(filteredProcesses.map((p) => p._id)),
                      );
                    }}
                    className="text-sm font-semibold underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Limpar seleção
                  </button>
                </div>
              )}

              <div className="overflow-x-auto overflow-y-visible">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="w-12">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={
                                      allVisibleSelected &&
                                      filteredProcesses.length > 0
                                        ? true
                                        : someVisibleSelected
                                          ? "indeterminate"
                                          : false
                                    }
                                    onCheckedChange={(checked) => {
                                      if (
                                        checked === true ||
                                        checked === "indeterminate"
                                      ) {
                                        // Select all visible
                                        setSelectedProcessIds(
                                          new Set(
                                            filteredProcesses.map((p) => p._id),
                                          ),
                                        );
                                        setSelectAllMode("page");
                                      } else {
                                        // Deselect all
                                        setSelectedProcessIds(new Set());
                                        setSelectAllMode(null);
                                      }
                                    }}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {allVisibleSelected
                                    ? "Desmarcar todos"
                                    : someVisibleSelected
                                      ? `Selecionar todos os ${filteredProcesses.length} visíveis`
                                      : `Selecionar todos os ${filteredProcesses.length} visíveis`}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Número do Processo</TableHead>
                        <TableHead>Valor da Causa</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-center">
                          Instâncias
                        </TableHead>
                        <TableHead className="text-center">
                          Documentos
                        </TableHead>
                        <TableHead className="text-center">
                          Atividades
                        </TableHead>
                      </TableRow>
                    </TableHeader>
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
                        filteredProcesses.map((process) => {
                          const isSelected = selectedProcessIds.has(
                            process._id,
                          );
                          return (
                            <TableRow
                              key={process._id}
                              className={`transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50"
                                  : "hover:bg-gray-50 border-gray-200 dark:hover:bg-gray-700/50 dark:border-gray-700"
                              }`}
                            >
                              <TableCell
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle selection on cell click
                                  if (selectAllMode === "all") {
                                    // When unchecking from "all" mode, populate with all visible except this one
                                    const newSet = new Set(
                                      filteredProcesses.map((p) => p._id),
                                    );
                                    newSet.delete(process._id);
                                    setSelectedProcessIds(newSet);
                                  } else {
                                    const newSet = new Set(selectedProcessIds);
                                    if (isSelected) {
                                      newSet.delete(process._id);
                                    } else {
                                      newSet.add(process._id);
                                    }
                                    setSelectedProcessIds(newSet);
                                  }
                                }}
                                className="cursor-pointer text-center align-middle group"
                              >
                                <div className="flex items-center justify-center p-1 rounded-md transition-colors group-hover:bg-blue-50 dark:group-hover:bg-transparent">
                                  <Checkbox
                                    checked={
                                      selectAllMode === "all" || isSelected
                                    }
                                    onCheckedChange={(checked) => {
                                      if (selectAllMode === "all") {
                                        // When unchecking from "all" mode, populate with all visible except this one
                                        const newSet = new Set(
                                          filteredProcesses.map((p) => p._id),
                                        );
                                        newSet.delete(process._id);
                                        setSelectedProcessIds(newSet);
                                        setSelectAllMode(null);
                                      } else {
                                        const newSet = new Set(
                                          selectedProcessIds,
                                        );
                                        if (checked) {
                                          newSet.add(process._id);
                                        } else {
                                          newSet.delete(process._id);
                                        }
                                        setSelectedProcessIds(newSet);
                                      }
                                    }}
                                  />
                                </div>
                              </TableCell>
                              <TableCell
                                className="font-medium"
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {capitalizeWords(
                                      getProcessTitle(
                                        process.processParts || [],
                                        process.number,
                                        process.title ||
                                          (process as any).formPipedrive?.title,
                                      ),
                                    )}
                                  </span>
                                  {process.processOwner?.user?.email && (
                                    <span className="text-xs text-gray-600 dark:text-gray-500">
                                      {process.processOwner.user.email}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                  {process.number}
                                </span>
                              </TableCell>
                              <TableCell
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                {process.valueCase ? (
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    }).format(process.valueCase)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-600">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {process.createdAt
                                    ? new Date(
                                        process.createdAt,
                                      ).toLocaleDateString("pt-BR")
                                    : "-"}
                                </span>
                              </TableCell>
                              <TableCell
                                className="text-center"
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                {process.hasInstancias ? (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-500 text-blue-700 bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/30"
                                  >
                                    ✓
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-600">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell
                                className="text-center"
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                {process.hasDocuments ? (
                                  <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-700 bg-green-50 dark:border-green-500 dark:text-green-400 dark:bg-green-950/30"
                                  >
                                    ✓
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-600">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell
                                className="text-center"
                                onClick={() =>
                                  (window.location.href = `/processes/${process.number}`)
                                }
                              >
                                {(() => {
                                  const filteredActivities =
                                    getFilteredActivities(process);

                                  if (filteredActivities.length === 0) {
                                    return (
                                      <span className="text-xs text-gray-400 dark:text-gray-600">
                                        -
                                      </span>
                                    );
                                  }

                                  // Mapear tipos de atividade para labels
                                  const activityLabels: Record<
                                    ActivityType,
                                    string
                                  > = {
                                    PRE_ANALISE: "Pré-Análise",
                                    ANALISE: "Análise",
                                    CALCULO: "Cálculo",
                                  };

                                  return (
                                    <div className="flex flex-col gap-1 items-center">
                                      {filteredActivities.map(
                                        (activity, index) => {
                                          const label =
                                            activityLabels[activity.type] ||
                                            activity.type;
                                          const isCompleted =
                                            activity.isCompleted;

                                          return (
                                            <Badge
                                              key={activity._id || index}
                                              variant="outline"
                                              className={`text-xs ${
                                                isCompleted
                                                  ? "border-green-500 text-green-700 bg-green-50 dark:border-green-500 dark:text-green-400 dark:bg-green-950/30"
                                                  : "border-yellow-500 text-yellow-700 bg-yellow-50 dark:border-yellow-500 dark:text-yellow-400 dark:bg-yellow-950/30"
                                              }`}
                                              title={`${label}${isCompleted ? " - Concluída" : " - Pendente"}`}
                                            >
                                              {label}
                                            </Badge>
                                          );
                                        },
                                      )}
                                    </div>
                                  );
                                })()}
                              </TableCell>
                            </TableRow>
                          );
                        })
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
          className="fixed bottom-6 z-40 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
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
