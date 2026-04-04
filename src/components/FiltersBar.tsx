import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, Filter, Search, X, FileText, Layers, Check, ChevronDown, ChevronDownIcon, Activity, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Situation, StageProcess } from "@/app/interfaces/processes";
import { useRejectionReasons } from "@/app/api/hooks/process/useRejectionReasons";
import { useTheme } from "@/app/hooks/use-theme-client";

// MultiSelect Component
interface MultiSelectProps {
  options: { key: string; label: string }[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayItems?: number;
}

function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Selecionar opções...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhuma opção encontrada.",
  className,
  disabled = false,
  maxDisplayItems = 2,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { theme } = useTheme();

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );


  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onSelectionChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleSelectAll = () => {
    onSelectionChange(filteredOptions.map(option => option.key));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex].key);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  // Reset focused index when options change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchValue, filteredOptions.length]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full justify-between h-11 rounded-xl transition-all duration-200 group",
              theme === "dark"
                ? "border-slate-600 bg-slate-800/50 text-white hover:border-blue-400 hover:bg-slate-800"
                : "border-slate-200 hover:border-blue-300 hover:bg-white/80 bg-white",
              selected.length > 0 && "border-blue-400 bg-blue-50/50",
              open && "ring-2 ring-blue-200 ring-offset-2"
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {selected.length === 0 ? (
                <span className={cn(
                  "text-sm font-medium",
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                )}>
                  {placeholder}
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selected.slice(0, maxDisplayItems).map((value) => {
                    const option = options.find((opt) => opt.key === value);
                    return (
                      <span
                        key={value}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                          "hover:scale-105 hover:shadow-sm",
                          theme === "dark"
                            ? "bg-blue-900/60 text-blue-100 border border-blue-600/50"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        )}
                      >
                        <span className="truncate max-w-[120px]">{option?.label}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(value);
                          }}
                          className={cn(
                            "ml-0.5 hover:bg-blue-200/50 rounded-full p-0.5 cursor-pointer transition-colors",
                            theme === "dark" ? "hover:bg-blue-700/50" : "hover:bg-blue-200/50"
                          )}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </span>
                    );
                  })}
                  {selected.length > maxDisplayItems && (
                    <span className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      "hover:scale-105 hover:shadow-sm",
                      theme === "dark"
                        ? "bg-gray-700/60 text-gray-300 border border-gray-600/50"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    )}>
                      +{selected.length - maxDisplayItems} mais
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              {selected.length > 0 && (
                <span className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  theme === "dark" 
                    ? "bg-blue-600 text-blue-100" 
                    : "bg-blue-600 text-white"
                )}>
                  {selected.length}
                </span>
              )}
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                open && "rotate-180",
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              )} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn(
            "w-full p-0 rounded-xl shadow-2xl border-0 animate-in fade-in-0 zoom-in-95 duration-200",
            theme === "dark" 
              ? "bg-slate-800/95 backdrop-blur-md" 
              : "bg-white/95 backdrop-blur-md"
          )}
          align="start"
        >
          <div className="rounded-xl">
            <div className="p-4 border-b border-gray-200/20">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  className={cn(
                    "h-10 border-0 bg-transparent text-sm placeholder:text-gray-500 focus:ring-0 flex-1",
                    theme === "dark" 
                      ? "text-white placeholder:text-gray-400" 
                      : "text-gray-900 placeholder:text-gray-500"
                  )}
                />
                {filteredOptions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className={cn(
                      "h-7 px-2 text-xs font-medium rounded-md transition-all duration-200",
                      theme === "dark"
                        ? "hover:bg-blue-900/30 text-blue-300 hover:text-blue-200"
                        : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                    )}
                  >
                    Selecionar todos
                  </Button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                    )}>
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{emptyMessage}</p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                {filteredOptions.map((option, index) => {
                  const isSelected = selected.includes(option.key);
                  const isFocused = index === focusedIndex;
                  return (
                    <div
                      key={option.key}
                      onClick={() => handleSelect(option.key)}
                      className={cn(
                        "group flex items-center cursor-pointer rounded-lg transition-all duration-200 ease-in-out mx-1",
                        "hover:scale-[1.01] hover:shadow-sm",
                        isFocused && "ring-2 ring-blue-300 ring-offset-1",
                        theme === "dark"
                          ? cn(
                              "hover:bg-slate-700/50 hover:border-slate-600/50 border border-transparent",
                              isFocused && "bg-slate-700/30 border-slate-600/50",
                              isSelected && "bg-blue-900/30 border-blue-700/50"
                            )
                          : cn(
                              "hover:bg-slate-50 hover:border-slate-200 border border-transparent",
                              isFocused && "bg-slate-50 border-slate-200",
                              isSelected && "bg-blue-50 border-blue-200"
                            )
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 px-4 py-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={isSelected}
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
                              "data-[state=checked]:scale-105"
                            )}
                          />
                        </div>
                        <span className={cn(
                          "text-sm flex-1 transition-colors duration-200 leading-relaxed font-medium",
                          theme === "dark" 
                            ? cn(
                                "text-slate-200 group-hover:text-slate-100",
                                isSelected && "text-blue-200"
                              )
                            : cn(
                                "text-slate-700 group-hover:text-slate-900",
                                isSelected && "text-blue-700"
                              )
                        )}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <Check className="h-4 w-4 text-blue-600 transition-all duration-200 scale-105" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
            {selected.length > 0 && (
              <div className={cn(
                "flex items-center justify-between px-4 py-4 border-t bg-gradient-to-r from-blue-50/30 to-slate-50/30",
                theme === "dark" 
                  ? "border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-slate-900/20" 
                  : "border-slate-200/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    theme === "dark" ? "bg-blue-400" : "bg-blue-500"
                  )} />
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-sm font-semibold",
                      theme === "dark" ? "text-slate-200" : "text-slate-700"
                    )}>
                      {selected.length} selecionado{selected.length !== 1 ? 's' : ''}
                    </span>
                    <span className={cn(
                      "text-xs",
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    )}>
                      {filteredOptions.length} opções disponíveis
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectionChange([])}
                    className={cn(
                      "h-8 px-3 text-xs font-medium rounded-lg transition-all duration-200",
                      "hover:scale-105 hover:shadow-sm",
                      theme === "dark"
                        ? "hover:bg-red-900/30 text-red-400 hover:text-red-300"
                        : "hover:bg-red-50 text-red-600 hover:text-red-700"
                    )}
                  >
                    <X className="h-3 w-3 mr-1.5" />
                    Limpar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className={cn(
                      "h-8 px-3 text-xs font-medium rounded-lg transition-all duration-200",
                      "hover:scale-105 hover:shadow-sm",
                      theme === "dark"
                        ? "hover:bg-blue-900/30 text-blue-300 hover:text-blue-200"
                        : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                    )}
                  >
                    <Check className="h-3 w-3 mr-1.5" />
                    Todos
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export interface FilterValues {
  search?: string;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  lossReason?: string;
  contentFilter?: string;
  emptyDocuments?: boolean;
  emptyInstances?: boolean;
  hasNewMovementsNow?: boolean;
}

export interface FiltersBarProps {
  filters: {
    search: string;
    status: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    lossReason?: string;
    contentFilter?: string;
    emptyDocuments?: boolean;
    emptyInstances?: boolean;
    hasNewMovementsNow?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

function isDefaultFilters(filters: FilterValues) {
  return (
    (filters.search === "" || !filters.search) &&
    (filters.status === "all" || !filters.status) &&
    (filters.type === "all" || !filters.type) &&
    (filters.lossReason === "all" || !filters.lossReason) &&
    (filters.contentFilter === "all" || !filters.contentFilter) &&
    !filters.startDate &&
    !filters.endDate
  );
}

const defaultFilters: FilterValues = {
  search: "",
  status: "all",
  type: "all",
  startDate: undefined,
  endDate: undefined,
  lossReason: "all",
  contentFilter: "all",
  emptyDocuments: false,
  emptyInstances: false,
  hasNewMovementsNow: false,
};

export function FiltersBar({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}: FiltersBarProps) {
  const [mounted, setMounted] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const { theme } = useTheme();

  const { data: rejectionReasons, isLoading: loadingReasons } =
    useRejectionReasons();


  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset lossReason when status changes away from LOSS
  useEffect(() => {
    if (filters.status !== Situation.LOSS && filters.lossReason && filters.lossReason !== "all") {
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
    if (key === "status" || key === "type" || key === "lossReason" || key === "contentFilter" || key === "startDate" || key === "endDate") {
      onApplyFilters();
    }
    // Search is handled by useEffect with debounce
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status !== "all" ||
      (filters.type && filters.type !== "all") ||
      (filters.lossReason && filters.lossReason !== "all") ||
      (filters.contentFilter && filters.contentFilter !== "all") ||
      filters.startDate ||
      filters.endDate
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
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

  return (
    <Card className={`border shadow-lg ${
      theme === "dark" 
        ? "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900/50" 
        : "border-0 bg-gradient-to-br from-white to-gray-50/50"
    }`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>Filtros</h3>
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className={`text-xs font-medium ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}>Aplicando...</span>
                </div>
              )}
            </div>
            <p className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>Encontre processos específicos rapidamente</p>
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
                      ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
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
              <Label className={`text-sm font-semibold mb-2 block ${
                theme === "dark" ? "text-gray-300" : "text-gray-900"
              }`}>
                Período
              </Label>
              <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      `w-full h-9 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-between gap-2 px-3 border ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-800 text-white hover:border-blue-400 hover:bg-gray-700 focus:border-blue-400 focus:outline-none"
                          : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 bg-white focus:border-blue-500 focus:outline-none"
                      }`,
                      (!filters.startDate && !filters.endDate) && (theme === "dark" ? "text-gray-400" : "text-gray-500")
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">
                        {filters.startDate && filters.endDate
                          ? `${format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })}`
                          : filters.startDate
                          ? `A partir de ${format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })}`
                          : filters.endDate
                          ? `Até ${format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })}`
                          : "Selecionar período"}
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </button>
                </DialogTrigger>
                <DialogContent className={`rounded-xl shadow-lg ${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                  <DialogHeader>
                    <DialogTitle className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Filtrar por Período
                    </DialogTitle>
                    <DialogDescription className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Selecione o período inicial e final para filtrar os processos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>
                        Data Inicial
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              `w-full justify-start text-left font-normal h-10 rounded-lg transition-all duration-200 ${
                                theme === "dark"
                                  ? "border-gray-600 bg-gray-800 text-white hover:border-blue-400 hover:bg-gray-700"
                                  : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 bg-white"
                              }`,
                              !filters.startDate && (theme === "dark" ? "text-gray-400" : "text-gray-500")
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.startDate
                              ? format(filters.startDate, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "Data inicial"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={`w-auto p-0 rounded-xl shadow-lg border ${
                          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                        }`} align="start">
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

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>
                        Data Final
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              `w-full justify-start text-left font-normal h-10 rounded-lg transition-all duration-200 ${
                                theme === "dark"
                                  ? "border-gray-600 bg-gray-800 text-white hover:border-blue-400 hover:bg-gray-700"
                                  : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 bg-white"
                              }`,
                              !filters.endDate && (theme === "dark" ? "text-gray-400" : "text-gray-500")
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.endDate
                              ? format(filters.endDate, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "Data final"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={`w-auto p-0 rounded-xl shadow-lg border ${
                          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                        }`} align="start">
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date) => updateFilter("endDate", date)}
                            initialFocus
                            locale={ptBR}
                            disabled={(date) =>
                              filters.startDate ? date < filters.startDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date Shortcuts */}
                    <div className={`pt-4 border-t ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}>
                      <Label className={`text-sm font-semibold mb-3 block ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>
                        Atalhos
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-9 px-3 text-xs rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-gray-700 hover:text-blue-300 text-gray-300"
                              : "hover:bg-blue-50 hover:text-blue-700"
                          }`}
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(
                              today.getTime() - 7 * 24 * 60 * 60 * 1000
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
                          className={`h-9 px-3 text-xs rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-gray-700 hover:text-blue-300 text-gray-300"
                              : "hover:bg-blue-50 hover:text-blue-700"
                          }`}
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(
                              today.getFullYear(),
                              today.getMonth() - 1,
                              today.getDate()
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
                          className={`h-9 px-3 text-xs rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-gray-700 hover:text-red-300 text-gray-300"
                              : "hover:bg-red-50 hover:text-red-700"
                          }`}
                          onClick={() => {
                            updateFilter("startDate", undefined);
                            updateFilter("endDate", undefined);
                          }}
                        >
                          Limpar datas
                        </Button>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setDateModalOpen(false)}
                        className={theme === "dark" ? "border-gray-600" : ""}
                      >
                        Fechar
                      </Button>
                      <Button
                        onClick={() => {
                          onApplyFilters();
                          setDateModalOpen(false);
                        }}
                        className={theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Type (Etapa) Dropdown */}
            <div className="w-full lg:flex-1 lg:min-w-[140px] lg:max-w-[180px]">
              <Label
                htmlFor="type"
                className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Etapa
              </Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => updateFilter("type", value)}
              >
                <SelectTrigger className={`w-full h-12 rounded-xl transition-all duration-200 shadow-sm ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 text-white focus:border-blue-400"
                    : "border-gray-200 focus:border-blue-500 bg-white"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`rounded-xl shadow-lg border ${
                  theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                }`}>
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      Todas
                    </div>
                  </SelectItem>
                  <SelectItem value={StageProcess.PRE_ANALYSIS} className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Pré-Análise
                    </div>
                  </SelectItem>
                  <SelectItem value={StageProcess.ANALYSIS} className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Análise
                    </div>
                  </SelectItem>
                  <SelectItem value={StageProcess.CALCULATION} className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Cálculo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Dropdown */}
            <div className="w-full lg:flex-1 lg:min-w-[140px] lg:max-w-[180px]">
              <Label
                htmlFor="status"
                className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger className={`w-full h-12 rounded-xl transition-all duration-200 shadow-sm ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 text-white focus:border-blue-400"
                    : "border-gray-200 focus:border-blue-500 bg-white"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`rounded-xl shadow-lg border ${
                  theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                }`}>
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value={Situation.APPROVED} className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Aprovado
                    </div>
                  </SelectItem>
                  <SelectItem value={Situation.LOSS} className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Rejeitado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Loss Reason Filter - Select - Only show when status is LOSS */}
            {filters.status === Situation.LOSS && (
              <div className="w-full lg:flex-1 lg:min-w-[180px] lg:max-w-[220px]">
                <Label className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}>
                  Motivo de Perda
                </Label>
                
                {loadingReasons ? (
                  <div className="flex items-center gap-2 p-4">
                    <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Carregando motivos...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={filters.lossReason || "all"}
                    onValueChange={(value) => updateFilter("lossReason", value)}
                    disabled={loadingReasons}
                  >
                    <SelectTrigger className={`w-full h-12 rounded-xl transition-all duration-200 shadow-sm ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-800 text-white focus:border-purple-400"
                        : "border-gray-200 focus:border-purple-500 bg-white"
                    }`}>
                      <SelectValue placeholder="Selecionar motivo de perda..." />
                    </SelectTrigger>
                    <SelectContent className={`rounded-xl shadow-lg border ${
                      theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                    }`}>
                      <SelectItem value="all" className="rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          Todos
                        </div>
                      </SelectItem>
                      {(rejectionReasons || []).map((reason) => (
                        <SelectItem key={reason.key} value={reason.key} className="rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            {reason.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Content Filter - Select */}
            <div className="w-full lg:flex-1 lg:min-w-[180px] lg:max-w-[220px]">
              <Label className={`text-sm font-semibold mb-2 block ${
                theme === "dark" ? "text-gray-300" : "text-gray-900"
              }`}>
                Filtros de Conteúdo
              </Label>
              <Select
                value={filters.contentFilter || "all"}
                onValueChange={(value) => {
                  // Reset all content filters
                  const newFilters = {
                    ...filters,
                    contentFilter: value,
                    emptyDocuments: false,
                    emptyInstances: false,
                    hasNewMovementsNow: false,
                  };
                  
                  // Set the selected filter to true
                  if (value === "emptyDocuments") {
                    newFilters.emptyDocuments = true;
                  } else if (value === "emptyInstances") {
                    newFilters.emptyInstances = true;
                  } else if (value === "hasNewMovementsNow") {
                    newFilters.hasNewMovementsNow = true;
                  }
                  
                  onFiltersChange(newFilters);
                  onApplyFilters();
                }}
              >
                <SelectTrigger className={`w-full h-12 rounded-xl transition-all duration-200 shadow-sm ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 text-white focus:border-cyan-400"
                    : "border-gray-200 focus:border-cyan-500 bg-white"
                }`}>
                  <SelectValue placeholder="Selecionar filtro de conteúdo..." />
                </SelectTrigger>
                <SelectContent className={`rounded-xl shadow-lg border ${
                  theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                }`}>
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value="emptyDocuments" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-cyan-500" />
                      Sem documentos
                    </div>
                  </SelectItem>
                  <SelectItem value="emptyInstances" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-teal-500" />
                      Sem instâncias
                    </div>
                  </SelectItem>
                  <SelectItem value="hasNewMovementsNow" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-amber-500" />
                      Novas movimentações
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Status Indicator */}
          {hasActiveFilters() && (
            <div className={`flex flex-wrap items-center gap-2 pt-3 border-t ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <span className={`text-sm font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Filtros ativos:
              </span>
              {filters.search && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-blue-900/50 text-blue-300 border-blue-700"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  <Search className="h-4 w-4" />
                  Busca
                </div>
              )}
              {filters.status !== "all" && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-indigo-900/50 text-indigo-300 border-indigo-700"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  Status
                </div>
              )}
              {filters.type && filters.type !== "all" && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-pink-900/50 text-pink-300 border-pink-700"
                    : "bg-pink-50 text-pink-700 border-pink-200"
                }`}>
                  Etapa
                </div>
              )}
              {filters.startDate && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-green-900/50 text-green-300 border-green-700"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}>
                  <CalendarIcon className="h-4 w-4" />
                  Data início
                </div>
              )}
              {filters.endDate && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-orange-900/50 text-orange-300 border-orange-700"
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }`}>
                  <CalendarIcon className="h-4 w-4" />
                  Data fim
                </div>
              )}
              {filters.lossReason && filters.lossReason !== "all" && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-purple-900/50 text-purple-300 border-purple-700"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}>
                  Motivo de Perda
                </div>
              )}
              {filters.contentFilter && filters.contentFilter !== "all" && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border ${
                  theme === "dark"
                    ? "bg-cyan-900/50 text-cyan-300 border-cyan-700"
                    : "bg-cyan-50 text-cyan-700 border-cyan-200"
                }`}>
                  {filters.contentFilter === "emptyDocuments" && (
                    <>
                      <FileText className="h-4 w-4" />
                      Sem documentos
                    </>
                  )}
                  {filters.contentFilter === "emptyInstances" && (
                    <>
                      <Layers className="h-4 w-4" />
                      Sem instâncias
                    </>
                  )}
                  {filters.contentFilter === "hasNewMovementsNow" && (
                    <>
                      <Activity className="h-4 w-4" />
                      Novas movimentações
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
