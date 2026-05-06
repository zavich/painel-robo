import { useRejectionReasons } from "@/app/api/hooks/process/useRejectionReasons";
import { useTheme } from "@/app/hooks/use-theme-client";
import { Situation } from "@/app/interfaces/processes";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronDownIcon,
  FileText,
  Filter,
  Layers,
  Link,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface FilterValues {
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  lossReason?: string;
  contentFilter?: string;
  emptyDocuments?: boolean;
  emptyInstances?: boolean;
  hasNewMovementsNow?: boolean;
  hasSecondInstance?: boolean;
  classProcess?: string;
  hasAutos?: boolean;
  hasAcordao?: boolean;
}

export interface FiltersBarProps {
  filters: FilterValues;
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

function isDefaultFilters(filters: FilterValues) {
  return (
    (filters.search === "" || !filters.search) &&
    (filters.status === "all" || !filters.status) &&
    (filters.classProcess === "all" || !filters.classProcess) &&
    (filters.lossReason === "all" || !filters.lossReason) &&
    (filters.contentFilter === "all" || !filters.contentFilter) &&
    !filters.startDate &&
    !filters.endDate &&
    !filters.emptyDocuments &&
    !filters.hasSecondInstance &&
    !filters.hasAutos &&
    !filters.hasAcordao
  );
}

const defaultFilters: FilterValues = {
  search: "",
  status: "all",
  startDate: undefined,
  endDate: undefined,
  lossReason: "all",
  contentFilter: "all",
  emptyDocuments: false,
  emptyInstances: false,
  hasNewMovementsNow: false,
  hasSecondInstance: false,
  classProcess: "all",
  hasAutos: false,
  hasAcordao: false,
};

export function FiltersBar({
  filters,
  onFiltersChange,
  onApplyFilters,
  isLoading = false,
}: FiltersBarProps) {
  const [mounted, setMounted] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset lossReason when status changes away from LOSS
  useEffect(() => {
    if (
      filters.status !== Situation.LOSS &&
      filters.lossReason &&
      filters.lossReason !== "all"
    ) {
      onFiltersChange({
        ...filters,
        lossReason: "all",
      });
    }
  }, [filters.status]);

  // Debounce search input
  useEffect(() => {
    if (filters.search !== undefined && filters.search !== "") {
      const timeoutId = setTimeout(() => {
        onApplyFilters();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (filters.search === "") {
      // If search is cleared, apply filters immediately
      onApplyFilters();
    }
  }, [filters.search, onApplyFilters]);

  const updateFilter = (key: keyof FilterValues, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    // Auto-apply filters for status, type, lossReason, contentFilter changes and date changes (immediate)
    if (
      key === "status" ||
      key === "lossReason" ||
      key === "contentFilter" ||
      key === "startDate" ||
      key === "endDate"
    ) {
      onApplyFilters();
    }
    // Search is handled by useEffect with debounce
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status !== "all" ||
      (filters.classProcess && filters.classProcess !== "all") ||
      (filters.lossReason && filters.lossReason !== "all") ||
      (filters.contentFilter && filters.contentFilter !== "all") ||
      filters.startDate ||
      filters.endDate ||
      filters.hasSecondInstance ||
      filters.hasAutos ||
      filters.hasAcordao
    );
  };

  // Função para limpar todos os filtros
  const handleClearAllFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const showClearButton = !isDefaultFilters(filters);

  // Evitar problemas de hidratação
  if (!mounted) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }
  type ContentFilterKeys =
    | "emptyDocuments"
    | "hasSecondInstance"
    | "hasAutos"
    | "hasAcordao";

  const contentOptions: { label: string; value: ContentFilterKeys }[] = [
    { label: "Sem documentos", value: "emptyDocuments" },
    { label: "Contém segunda instancia", value: "hasSecondInstance" },
    { label: "Contém autos", value: "hasAutos" },
    { label: "Contém acórdão", value: "hasAcordao" },
  ];
  function getSelectedLabel(filters: FilterValues) {
    const selected = [];

    if (filters.emptyDocuments) selected.push("Sem documentos");
    if (filters.hasSecondInstance) selected.push("Contém segunda instancia");
    if (filters.hasAutos) selected.push("Contém autos");
    if (filters.hasAcordao) selected.push("Contém acórdão");

    if (selected.length === 0) return "Selecionar filtros";
    if (selected.length === 1) return selected[0];

    return `${selected.length} selecionados`;
  }
  return (
    <Card
      className={`border shadow-lg ${
        theme === "dark"
          ? "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900/50"
          : "border-0 bg-gradient-to-br from-white to-gray-50/50"
      }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Filtros
              </h3>
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                  <span
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  >
                    Aplicando...
                  </span>
                </div>
              )}
            </div>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Encontre processos específicos rapidamente
            </p>
          </div>
        </div>

        {/* Main filters row */}
        <div className="flex flex-col gap-2">
          {/* First row - Search */}
          <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-end">
            {/* Search Field */}
            <div className="w-full">
              <Label
                htmlFor="search"
                className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Busca Rápida
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="search"
                  placeholder="Número, requerente ou requerido..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className={`pl-12 h-12 rounded-xl transition-all duration-200 shadow-sm ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                      : "border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full lg:w-auto">
              {showClearButton && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                  size="sm"
                  className={`flex-1 lg:flex-none h-12 px-4 rounded-xl transition-all duration-200 ${
                    theme === "dark"
                      ? "border-red-600 text-red-400 hover:bg-red-900/50 hover:border-red-500 hover:text-red-300"
                      : "border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  }`}
                >
                  <X className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Limpar</span>
                </Button>
              )}
            </div>
          </div>

          {/* Second row - Período, Etapa, Status, Motivo de Perda, Conteúdo */}
          <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-end flex-wrap">
            {/* Date Filter Modal Button - Período */}
            <div className="w-full lg:flex-1 lg:min-w-[140px] lg:max-w-[180px]">
              <Label
                className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Período
              </Label>
              <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 rounded-lg transition-colors border flex items-center gap-2 px-3",
                      theme === "dark"
                        ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700/30 focus:border-yellow-400"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:border-yellow-500",
                      !filters.startDate &&
                        (theme === "dark" ? "text-gray-400" : "text-gray-500"),
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 flex-shrink-0 opacity-70" />

                    <span className="truncate text-sm flex-1">
                      {filters.startDate && filters.endDate
                        ? `${format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })}`
                        : filters.startDate
                          ? `A partir de ${format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })}`
                          : filters.endDate
                            ? `Até ${format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })}`
                            : "Selecionar período"}
                    </span>

                    <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </button>
                </DialogTrigger>

                <DialogContent
                  className={cn(
                    "rounded-xl shadow-lg border",
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900",
                  )}
                >
                  <DialogHeader>
                    <DialogTitle
                      className={
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }
                    >
                      Filtrar por Período
                    </DialogTitle>

                    <DialogDescription
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Selecione o período inicial e final para filtrar os
                      processos
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* START DATE */}
                    <div className="space-y-2">
                      <Label
                        className={
                          theme === "dark" ? "text-gray-300" : "text-gray-900"
                        }
                      >
                        Data Inicial
                      </Label>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 rounded-lg transition-all duration-200 border flex items-center gap-2 px-3",

                              theme === "dark"
                                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20",

                              // estado vazio
                              !filters.startDate &&
                                (theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"),
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />

                            {filters.startDate
                              ? format(filters.startDate, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "Data inicial"}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          className={cn(
                            "w-auto p-0 rounded-xl shadow-lg border",
                            theme === "dark"
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-200 bg-white",
                          )}
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(date) => updateFilter("startDate", date)}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* END DATE */}
                    <div className="space-y-2">
                      <Label
                        className={
                          theme === "dark" ? "text-gray-300" : "text-gray-900"
                        }
                      >
                        Data Final
                      </Label>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 rounded-lg transition-all duration-200 border flex items-center gap-2 px-3",

                              theme === "dark"
                                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-gray-900 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20",

                              // estado vazio
                              !filters.startDate &&
                                (theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"),
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />

                            {filters.endDate
                              ? format(filters.endDate, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "Data final"}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          className={cn(
                            "w-auto p-0 rounded-xl shadow-lg border",
                            theme === "dark"
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-200 bg-white",
                          )}
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date) => updateFilter("endDate", date)}
                            initialFocus
                            locale={ptBR}
                            disabled={(date) =>
                              filters.startDate
                                ? date < filters.startDate
                                : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* SHORTCUTS */}
                    <div
                      className={cn(
                        "pt-4 border-t",
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-gray-200",
                      )}
                    >
                      <Label
                        className={
                          theme === "dark" ? "text-gray-300" : "text-gray-900"
                        }
                      >
                        Atalhos
                      </Label>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-9 px-3 text-xs rounded-lg transition-all duration-200",

                            theme === "dark"
                              ? "text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-300"
                              : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-700",
                          )}
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(
                              today.getTime() - 7 * 24 * 60 * 60 * 1000,
                            );
                            updateFilter("startDate", lastWeek);
                            updateFilter("endDate", today);
                          }}
                        >
                          Última semana
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-9 px-3 text-xs rounded-lg transition-all duration-200",

                            theme === "dark"
                              ? "text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-300"
                              : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-700",
                          )}
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(
                              today.getFullYear(),
                              today.getMonth() - 1,
                              today.getDate(),
                            );
                            updateFilter("startDate", lastMonth);
                            updateFilter("endDate", today);
                          }}
                        >
                          Último mês
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-9 px-3 text-xs rounded-lg transition-colors",
                            theme === "dark"
                              ? "text-gray-300 hover:bg-gray-700/30"
                              : "text-gray-600 hover:bg-red-50 hover:text-red-600",
                          )}
                          onClick={() => {
                            updateFilter("startDate", undefined);
                            updateFilter("endDate", undefined);
                          }}
                        >
                          Limpar datas
                        </Button>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setDateModalOpen(false)}
                        className={
                          theme === "dark"
                            ? "border-gray-600 text-gray-200"
                            : ""
                        }
                      >
                        Fechar
                      </Button>

                      <Button
                        onClick={() => {
                          onApplyFilters();
                          setDateModalOpen(false);
                        }}
                        className={
                          theme === "dark"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                            : ""
                        }
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Content Filter - Select */}
            <div className="w-full lg:flex-1 lg:min-w-[190px] lg:max-w-[220px]">
              <Label
                className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Filtros de Conteúdo
              </Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "rounded-lg transition-all duration-200 w-full justify-start focus:outline-none focus:ring-2 focus:ring-yellow-500/20 bg-white",

                      theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-yellow-50",

                      "data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-700",
                    )}
                  >
                    <span className="truncate">
                      {getSelectedLabel(filters)}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className={cn(
                    "w-[220px] rounded-xl shadow-lg border p-1",
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-white",
                  )}
                >
                  {contentOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters[option.value]}
                      onCheckedChange={(checked) => {
                        const newFilters = {
                          ...filters,
                          [option.value]: checked,
                        };

                        onFiltersChange(newFilters);
                        onApplyFilters();
                      }}
                      className={cn(
                        "rounded-lg transition-colors",
                        theme === "dark"
                          ? "text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white data-[state=checked]:bg-yellow-900/40 data-[state=checked]:text-yellow-300"
                          : "text-gray-700 hover:bg-yellow-50 hover:text-gray-900 focus:bg-yellow-50 focus:text-gray-900 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-700",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {option.label}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-full lg:flex-1 lg:min-w-[190px] lg:max-w-[220px]">
              <Label
                className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Classe do Processo
              </Label>

              <Select
                value={filters.classProcess || "all"}
                onValueChange={(value) => {
                  onFiltersChange({
                    ...filters,
                    classProcess: value,
                  });
                  onApplyFilters();
                }}
              >
                <SelectTrigger
                  className={cn(
                    "w-full h-12 rounded-lg transition-colors justify-start",
                    theme === "dark"
                      ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-750 focus:bg-gray-700 focus:text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:bg-yellow-50 focus:text-gray-900",
                  )}
                >
                  <SelectValue placeholder="Selecionar filtro de conteúdo..." />
                </SelectTrigger>

                <SelectContent
                  className={cn(
                    "rounded-xl shadow-lg border p-1 w-[220px]",
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-white",
                  )}
                >
                  <SelectItem
                    value="all"
                    className={cn(
                      "rounded-lg transition-colors",
                      theme === "dark"
                        ? "text-gray-200 data-[highlighted]:bg-gray-700/40 data-[highlighted]:text-white data-[state=checked]:bg-gray-700/60"
                        : "text-gray-700 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-700",
                    )}
                  >
                    <div className="flex items-center gap-2 text-inherit">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      Todos
                    </div>
                  </SelectItem>

                  <SelectItem
                    value="MAIN"
                    className={cn(
                      "rounded-lg transition-colors",
                      theme === "dark"
                        ? "text-gray-200 data-[highlighted]:bg-gray-700/40 data-[highlighted]:text-white data-[state=checked]:bg-gray-700/60"
                        : "text-gray-700 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-700",
                    )}
                  >
                    <div className="flex items-center gap-2 text-inherit">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Processo Principal
                    </div>
                  </SelectItem>

                  <SelectItem
                    value="PROVISIONAL_EXECUTION"
                    className={cn(
                      "rounded-lg transition-colors",
                      theme === "dark"
                        ? "text-gray-200 data-[highlighted]:bg-gray-700/40 data-[highlighted]:text-white data-[state=checked]:bg-gray-700/60"
                        : "text-gray-700 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-700",
                    )}
                  >
                    <div className="flex items-center gap-2 text-inherit">
                      <Link className="h-4 w-4 text-gray-500" />
                      Execução Provisória
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Status Indicator */}
          {hasActiveFilters() && (
            <div
              className={`flex flex-wrap items-center gap-2 pt-3 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Filtros ativos:
              </span>
              {filters.search && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                    theme === "dark"
                      ? "bg-yellow-900/50 text-yellow-300 border-yellow-700"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  Busca
                </div>
              )}
              {filters.startDate && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                    theme === "dark"
                      ? "bg-green-900/50 text-green-300 border-green-700"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Data início
                </div>
              )}
              {filters.endDate && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                    theme === "dark"
                      ? "bg-orange-900/50 text-orange-300 border-orange-700"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Data fim
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
