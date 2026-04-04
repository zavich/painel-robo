import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Process, EsteiraByStageId, NextStageIdByEsteira } from "@/app/interfaces/processes";
import { useChangeStage } from "@/app/api/hooks/process/useChangeStage";
import { useAvailableStages } from "@/app/api/hooks/process/useAvailableStages";
import { getStageIdForStage } from "@/app/utils/processUtils";
import { toast } from "react-toastify";

interface ChangeStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: Process | null;
  onSuccess?: () => void;
}

export function ChangeStageDialog({
  open,
  onOpenChange,
  process,
  onSuccess,
}: ChangeStageDialogProps) {
  const [selectedStage, setSelectedStage] = useState("");
  const [reason, setReason] = useState("");

  const { data: availableStages, isLoading: isLoadingStages, error: stagesError } = useAvailableStages();
  const changeStage = useChangeStage();

  const handleSubmit = async () => {
    if (!process?._id || !selectedStage || !reason.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Verificar se o stage selecionado é diferente do atual
    if (selectedStage === process.stage) {
      toast.error("O processo já está na etapa selecionada");
      return;
    }

    // Obter o stageId correspondente ao stage selecionado
    const stageId = getStageIdForStage(process, selectedStage);
    if (!stageId) {
      toast.error("Não foi possível determinar o stageId para a etapa selecionada");
      return;
    }
      try {
        await changeStage.mutateAsync({
          processId: process._id,
          newStageId: stageId,
          reason: reason.trim(),
        });

      toast.success("Etapa do processo alterada com sucesso!");
      
      // Limpar formulário
      setSelectedStage("");
      setReason("");
      
      // Fechar modal
      onOpenChange(false);
      
      // Callback de sucesso
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao alterar etapa do processo");
    }
  };

  const handleClose = () => {
    setSelectedStage("");
    setReason("");
    onOpenChange(false);
  };

  const currentStageLabel = availableStages?.find(stage => stage.key === process?.stage)?.label || process?.stage;

  // Mock stages como fallback se a API não funcionar
  const mockStages = [
    { key: 'PRE_ANALISE', label: 'Pré-Análise', order: 1 },
    { key: 'ANALISE', label: 'Análise', order: 2 },
    { key: 'CALCULO', label: 'Cálculo', order: 3 },
  ];

  // Usar mock se não há dados da API
  const stagesToUse = availableStages && availableStages.length > 0 ? availableStages : mockStages;
  
  // Filtrar stages disponíveis (excluir o atual)
  const filteredStages = stagesToUse?.filter(stage => stage.key !== process?.stage) || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Alterar Etapa do Processo</DialogTitle>
        </DialogHeader>

        {process && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Processo</Label>
              <div className="p-2 bg-muted dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100">
                {process.number}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stage Atual</Label>
              <div className="p-2 bg-muted dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100">
                {currentStageLabel}
              </div>
            </div>

            <div>
              <Label htmlFor="newStage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Novo Stage *
              </Label>
              {isLoadingStages ? (
                <div className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-muted-foreground dark:text-gray-400 bg-white dark:bg-gray-700">
                  Carregando stages...
                </div>
              ) : filteredStages.length > 0 ? (
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {filteredStages.map((stage) => (
                      <SelectItem key={stage.key} value={stage.key} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-muted-foreground dark:text-gray-400 bg-white dark:bg-gray-700">
                  Nenhum stage disponível para alteração
                </div>
              )}
              
              {/* Mostrar o stageId que será enviado */}
              {selectedStage && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
                  <div className="text-blue-700 dark:text-blue-300 font-medium">
                    StageId que será enviado: {getStageIdForStage(process!, selectedStage) || "Não encontrado"}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    Stage atual: {process?.stage} (ID: {process?.stageId})
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-xs">
                    Esteira atual: {process?.stageId ? EsteiraByStageId[process.stageId] || "Desconhecida" : "Não definida"}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Motivo da Alteração *
              </Label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo da alteração de stage..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px] text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={changeStage.isPending}
            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={
              !selectedStage ||
              !reason.trim() ||
              changeStage.isPending ||
              isLoadingStages
            }
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            {changeStage.isPending ? "Alterando..." : "Alterar Etapa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}