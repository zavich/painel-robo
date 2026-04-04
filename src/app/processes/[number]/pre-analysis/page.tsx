"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileSearch, Save, X, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProcessAutoRefresh } from "@/app/hooks/useProcessAutoRefresh";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateProcessForm } from "@/app/api/hooks/process/useUpdateProcessForm";

export default function PreAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;

  const { process, isLoading, refetch } = useProcessAutoRefresh({
    processId: id,
    enabled: false,
    intervalMs: 10000,
  });

  const updateFormMutation = useUpdateProcessForm(process?.number);

  const [observacaoPreAnalise, setObservacaoPreAnalise] = useState("");
  const [value, setValue] = useState("");
  const [calculoAutos, setCalculoAutos] = useState("");
  const [calculoAutosValue, setCalculoAutosValue] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);

  // Atualizar observação quando o processo carregar
  useEffect(() => {
    if (process?.formPipedrive) {
      const initialObservacao = (process.formPipedrive as any)?.observacaoPreAnalise || "";
      const initialValue = (process.formPipedrive as any)?.value || "";
      const initialCalculoAutos = (process.formPipedrive as any)?.calculoAutos || "";
      const initialCalculoAutosValue = (process.formPipedrive as any)?.calculoAutosValue || "";
      setObservacaoPreAnalise(initialObservacao);
      setValue(initialValue);
      setCalculoAutos(initialCalculoAutos);
      setCalculoAutosValue(initialCalculoAutosValue);
    }
  }, [process]);

  // Detectar mudanças
  useEffect(() => {
    const originalObservacao = (process?.formPipedrive as any)?.observacaoPreAnalise || "";
    const originalValue = (process?.formPipedrive as any)?.value || "";
    const originalCalculoAutos = (process?.formPipedrive as any)?.calculoAutos || "";
    const originalCalculoAutosValue = (process?.formPipedrive as any)?.calculoAutosValue || "";
    setHasChanges(
      observacaoPreAnalise !== originalObservacao || 
      value !== originalValue ||
      calculoAutos !== originalCalculoAutos ||
      calculoAutosValue !== originalCalculoAutosValue
    );
  }, [observacaoPreAnalise, value, calculoAutos, calculoAutosValue, process]);

  const handleSave = async () => {
    try {
      const FIELD_KEY_OBSERVACAO = "4ff33f89281e645310c0c124414cf84de4624334"; // observações da análise júridica
      const FIELD_KEY_CALCULO_AUTOS = "7da05be1e1c53f0d7595f883512baf69cf832f88"; // Cálculo nos autos
      
      // Enviar dados do formulário + title do processo (se existir)
      const dataToSend: any = {
        [FIELD_KEY_OBSERVACAO]: observacaoPreAnalise,
        observacaoPreAnalise: observacaoPreAnalise,
        value: parseFloat(value) || 0,
        title: process?.title || "" // Title do processo (pode ser vazio)
      };

      // Adicionar cálculo nos autos se preenchido
      if (calculoAutos) {
        if (calculoAutos === "Sim" && calculoAutosValue && calculoAutosValue.trim() !== "") {
          // Se for "Sim" e tiver valor digitado, usar o valor digitado
          dataToSend[FIELD_KEY_CALCULO_AUTOS] = calculoAutosValue;
        } else {
          // Caso contrário, usar o valor selecionado ("Sim" ou "Não")
          dataToSend[FIELD_KEY_CALCULO_AUTOS] = calculoAutos;
        }
        dataToSend.calculoAutos = calculoAutos;
        if (calculoAutosValue) {
          dataToSend.calculoAutosValue = calculoAutosValue;
        }
      }
      
      await updateFormMutation.mutateAsync({
        processNumber: process!.number,
        formData: dataToSend,
      });

      await refetch();
      setHasChanges(false);
      toast.success("Pré-Análise salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar Pré-Análise");
      console.error("Erro:", error);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm("Você tem alterações não salvas. Deseja sair sem salvar?")) {
        window.close();
        // Se window.close() não funcionar (quando não foi aberta via script), volta
        setTimeout(() => router.back(), 100);
      }
    } else {
      window.close();
      setTimeout(() => router.back(), 100);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2 w-fit"
            >
              <X className="h-4 w-4" />
              Fechar
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex flex-wrap items-center gap-2">
                <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                <span>Formulário de Pré-Análise</span>
                {hasChanges && (
                  <span className="text-xs font-normal px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                    Não salvo
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Processo: {process?.number || id}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateFormMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <Save className="h-4 w-4" />
              {updateFormMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pt-6">
            <div>
              <Label className="text-xs sm:text-sm font-semibold mb-2 block">
                Cálculo nos autos
              </Label>
              <Select value={calculoAutos} onValueChange={setCalculoAutos}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-sm sm:text-base">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectItem value="Sim" className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Sim
                  </SelectItem>
                  <SelectItem value="Não" className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Não
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {calculoAutos === "Sim" && (
              <div>
                <Label className="text-xs sm:text-sm font-semibold mb-2 block">
                  Detalhes do Cálculo nos autos
                </Label>
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Textarea
                    value={calculoAutosValue}
                    onChange={(e) => setCalculoAutosValue(e.target.value)}
                    placeholder="Digite os detalhes do cálculo nos autos..."
                    rows={3}
                    className="w-full resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs sm:text-sm font-semibold mb-2 block flex items-center gap-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                Valor do Processo (Pipedrive)
              </Label>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
                  R$
                </span>
                <Input
                  type="text"
                  value={isEditingValue 
                    ? (value ? String(value).replace('.', ',') : "")
                    : (value ? parseFloat(String(value)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")
                  }
                  onChange={(e) => {
                    let input = e.target.value;
                    // Remove tudo exceto números e vírgula
                    input = input.replace(/[^\d,]/g, '');
                    // Substitui vírgula por ponto para armazenar
                    const cleaned = input.replace(',', '.');
                    // Limita a 2 casas decimais
                    const parts = cleaned.split('.');
                    if (parts[1] && parts[1].length > 2) {
                      setValue(parts[0] + '.' + parts[1].substring(0, 2));
                    } else {
                      setValue(cleaned);
                    }
                  }}
                  onFocus={() => setIsEditingValue(true)}
                  onBlur={() => {
                    setIsEditingValue(false);
                    // Valida e normaliza o valor ao sair
                    if (value) {
                      const numValue = parseFloat(String(value));
                      if (!isNaN(numValue) && numValue > 0) {
                        setValue(numValue.toString());
                      } else {
                        setValue("");
                      }
                    }
                  }}
                  placeholder="0,00"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 pl-10 sm:pl-12 text-sm sm:text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Informe o valor do processo que será sincronizado com o Pipedrive.
              </p>
            </div>

            <div>
              <Label className="text-xs sm:text-sm font-semibold mb-2 block">
                Observações
              </Label>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Textarea
                  value={observacaoPreAnalise}
                  onChange={(e) => setObservacaoPreAnalise(e.target.value)}
                  placeholder="Digite suas observações da pré-análise. Ex: Acórdão, Improcedência, Duplicado, Cessão, Cálculos, Reclamadas, valor da decisão, etc."
                  rows={10}
                  className="w-full resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Exemplo: Acórdão: Sim, Improcedente: Não, Cálculo Atualizado: Líquido R$ 254.509,42
              </p>
            </div>

            {process?.filterValueSelectedSpreadsheet?.liquido && (
              <div>
                <Label className="text-xs sm:text-sm font-semibold mb-2 block">
                  Cálculo Atualizado
                </Label>
                <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300 break-all">
                    Líquido: R$ {process.filterValueSelectedSpreadsheet.liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

