import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/hooks/use-theme-client";
import { Process } from "@/app/interfaces/processes";
import { X, RefreshCw } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRunLawsuits } from "@/app/api/hooks/run-lawsuit/useRunLawsuits";

interface MassEditPanelProps {
  selectedProcesses: Process[];
  onClose: () => void;
  totalSelected?: number;
}

export function MassEditPanel({
  selectedProcesses,
  onClose,
  totalSelected = 0,
}: MassEditPanelProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const runLawsuitsMutation = useRunLawsuits();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runAction, setRunAction] = useState<"keep" | "edit">("keep");
  const [runMode, setRunMode] = useState<"movements" | "documents">("movements");

  const handleClose = () => {
    setRunAction("keep");
    setRunMode("movements");
    onClose();
  };

  const handleSubmit = async () => {
    if (runAction !== "edit") return;

    setIsSubmitting(true);
    try {
      const lawsuits = selectedProcesses.map((p) => p.number).filter(Boolean);
      await runLawsuitsMutation.mutateAsync({
        lawsuits,
        movements: runMode === "movements",
        documents: runMode === "documents",
      });
      toast({
        title: "Execução iniciada",
        description: `${lawsuits.length} processo(s) enviados para processamento.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["processes"] });
      handleClose();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      toast({
        title: "Erro ao executar",
        description: axiosErr?.response?.data?.message || "Ocorreu um erro ao executar os processos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const count = totalSelected || selectedProcesses.length;

  return (
    <div
      className={`fixed right-0 w-[400px] shadow-2xl border-l z-50 overflow-y-auto ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
      style={{ top: 0, height: "100vh" }}
    >
      {/* Header */}
      <div
        className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2
          className={`text-lg font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Edição em massa
        </h2>
        <button
          onClick={handleClose}
          className={`p-1 rounded-lg transition-colors ${
            theme === "dark"
              ? "hover:bg-gray-700 text-gray-400"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <label
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Executar processos
          </label>
          <select
            value={runAction}
            onChange={(e) => setRunAction(e.target.value as "keep" | "edit")}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="keep">Não executar</option>
            <option value="edit">Executar processos selecionados...</option>
          </select>

          {runAction === "edit" && (
            <div className="flex gap-3 mt-2">
              {(["movements", "documents"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRunMode(mode)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    runMode === mode
                      ? "bg-blue-600 border-blue-600 text-white"
                      : theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {mode === "movements" ? "Movimentações" : "Documentos"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`sticky bottom-0 px-6 py-4 border-t ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || runAction !== "edit"}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
          {isSubmitting ? "Executando..." : `Executar ${count} processo(s)`}
        </Button>
      </div>
    </div>
  );
}
