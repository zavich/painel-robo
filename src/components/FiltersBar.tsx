import { memo } from "react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface FilterValues {
  search?: string;
}

export interface FiltersBarProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const FiltersBar = memo(function FiltersBar({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}: FiltersBarProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const updateFilter = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const showClearButton = Boolean(filters.search);

  const handleClearAllFilters = () => {
    onClearFilters();
  };

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
                Busca
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
              Busque um processo pelo número
            </p>
          </div>
        </div>

        {/* Search row */}
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-end">
          <div className="w-full">
            <Label
              htmlFor="search"
              className={`text-sm font-semibold mb-2 block ${
                theme === "dark" ? "text-gray-300" : "text-gray-900"
              }`}
            >
              Número do Processo
            </Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="search"
                placeholder="Digite o número do processo..."
                value={filters.search}
                onChange={(e) => updateFilter(e.target.value)}
                className={`pl-12 h-12 rounded-xl transition-all duration-200 shadow-sm ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                    : "border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white"
                }`}
              />
            </div>
          </div>

          {showClearButton && (
            <div className="flex gap-2 w-full lg:w-auto">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
