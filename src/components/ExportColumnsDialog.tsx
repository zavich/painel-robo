"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/app/hooks/use-theme-client";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ExportColumn {
  id: string;
  label: string;
  enabled: boolean;
}

interface ExportColumnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (selectedColumns: string[], exportAll: boolean) => void;
  totalProcesses: number;
  totalProcessesInDB: number;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  { id: "title", label: "Título", enabled: true },
  { id: "number", label: "Número do Processo", enabled: true },
  { id: "stage", label: "Etapa", enabled: true },
  { id: "valueCase", label: "Valor da Causa", enabled: true },
  { id: "createdAt", label: "Data", enabled: true },
  { id: "hasInstances", label: "Instâncias", enabled: true },
  { id: "hasDocuments", label: "Documentos", enabled: true },
  { id: "owner", label: "Responsável", enabled: false },
];

export function ExportColumnsDialog({
  open,
  onOpenChange,
  onExport,
  totalProcesses,
  totalProcessesInDB,
}: ExportColumnsDialogProps) {
  const { theme } = useTheme();
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_COLUMNS);
  const [exportAll, setExportAll] = useState(false);

  const toggleColumn = (id: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === id ? { ...col, enabled: !col.enabled } : col
      )
    );
  };

  const selectAll = () => {
    setColumns(prev => prev.map(col => ({ ...col, enabled: true })));
  };

  const deselectAll = () => {
    setColumns(prev => prev.map(col => ({ ...col, enabled: false })));
  };

  const handleExport = () => {
    const selectedColumns = columns
      .filter(col => col.enabled)
      .map(col => col.id);
    
    if (selectedColumns.length === 0) {
      return;
    }
    
    onExport(selectedColumns, exportAll);
    onOpenChange(false);
  };

  const selectedCount = columns.filter(col => col.enabled).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] max-h-[90vh] overflow-y-auto ${
        theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-lg font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}>
            Selecionar Colunas para Exportação
          </DialogTitle>
          <p className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Escolha quais colunas você deseja incluir no arquivo Excel
          </p>
        </DialogHeader>

        {/* Export Scope Selection */}
        <div className={`flex flex-col gap-3 p-4 rounded-lg border mt-2 ${
          theme === "dark" ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50"
        }`}>
          <div className="flex items-center justify-between">
            <Label className={`text-sm font-semibold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Escopo da Exportação
            </Label>
            <span className={`text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}>
              Escolha o que exportar
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setExportAll(false)}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                !exportAll
                  ? theme === "dark"
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-blue-500 bg-blue-50"
                  : theme === "dark"
                    ? "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                    : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  !exportAll
                    ? "border-blue-500"
                    : theme === "dark"
                      ? "border-gray-500"
                      : "border-gray-400"
                }`}>
                  {!exportAll && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                    Processos Filtrados
                  </div>
                  <div className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Exportar apenas os processos visíveis na tela
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`font-semibold ${
                !exportAll
                  ? theme === "dark"
                    ? "border-blue-500 text-blue-400 bg-blue-950/30"
                    : "border-blue-600 text-blue-700 bg-blue-50"
                  : theme === "dark"
                    ? "border-gray-600 text-gray-400"
                    : "border-gray-400 text-gray-600"
              }`}>
                {totalProcesses}
              </Badge>
            </button>

            <button
              onClick={() => setExportAll(true)}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                exportAll
                  ? theme === "dark"
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-blue-500 bg-blue-50"
                  : theme === "dark"
                    ? "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                    : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  exportAll
                    ? "border-blue-500"
                    : theme === "dark"
                      ? "border-gray-500"
                      : "border-gray-400"
                }`}>
                  {exportAll && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                    Todos os Processos do Banco
                  </div>
                  <div className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Exportar todos os processos disponíveis
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`font-semibold ${
                exportAll
                  ? theme === "dark"
                    ? "border-blue-500 text-blue-400 bg-blue-950/30"
                    : "border-blue-600 text-blue-700 bg-blue-50"
                  : theme === "dark"
                    ? "border-gray-600 text-gray-400"
                    : "border-gray-400 text-gray-600"
              }`}>
                {totalProcessesInDB}
              </Badge>
            </button>
          </div>
        </div>

        <div className="py-2">
          <div className={`flex flex-col gap-3 p-4 rounded-lg border ${
            theme === "dark" ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <Label className={`text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Colunas para Exportar
                </Label>
                <p className={`text-xs mt-1 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}>
                  {selectedCount} de {columns.length} colunas selecionadas
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className={`text-xs h-8 ${
                    theme === "dark" ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  Todas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className={`text-xs h-8 ${
                    theme === "dark" ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Limpar
                </Button>
              </div>
            </div>

            <div className={`space-y-2 max-h-[300px] overflow-y-auto rounded-lg border p-3 ${
              theme === "dark" ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-white"
            }`}>
              {columns.map((column) => (
                <div 
                  key={column.id} 
                  className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                    theme === "dark" 
                      ? "hover:bg-gray-800/50" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Checkbox
                    id={column.id}
                    checked={column.enabled}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <Label
                    htmlFor={column.id}
                    className={`flex-1 cursor-pointer text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={`flex-1 sm:flex-none ${
              theme === "dark" 
                ? "border-gray-600 text-gray-300 hover:bg-gray-800" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedCount === 0}
            className={`gap-2 flex-1 sm:flex-none ${
              selectedCount === 0
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="font-semibold">
              Exportar {exportAll ? totalProcessesInDB : totalProcesses} {exportAll ? totalProcessesInDB === 1 ? 'processo' : 'processos' : totalProcesses === 1 ? 'processo' : 'processos'}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

