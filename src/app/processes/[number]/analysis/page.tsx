"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Save, X } from "lucide-react";
import { useProcessAutoRefresh } from "@/app/hooks/useProcessAutoRefresh";
import { useState, useEffect } from "react";
import { PipedriveFormCard, PipedriveFormData } from "@/components/process/PipedriveFormCard";
import { mascararCNPJ } from "@/app/utils/masks";
import { getProcessTitle } from "@/app/utils/processPartsUtils";
import { toast } from "react-toastify";
import { useUpdateProcessForm } from "@/app/api/hooks/process/useUpdateProcessForm";

const FIELD_KEYS = {
  calculoHomologado: "105998d73858eeca828ef7e47740a33e05e0765d",
  calculoAutos: "7da05be1e1c53f0d7595f883512baf69cf832f88",
  observacao: "4ff33f89281e645310c0c124414cf84de4624334",
  execucaoProvisoria: "fc5f94cbf972eacef5050f1f53b4f88f1770f87c",
} as const;

// Função para formatar as empresas reclamadas
function formatDefendantsForForm(companies: any[]): string {
  if (!companies || companies.length === 0) return "";
  
  return companies
    .map((company) => {
      const cnpj = mascararCNPJ(company.cnpj);
      const name = company.name?.toUpperCase() || "";
      
      // Determinar solvência
      let solvency = "";
      if (company.specialRule) {
        // SpecialRule usa valores em minúsculas: "solvente" ou "insolvente"
        solvency = company.specialRule === "solvente" ? "solvente" : "insolvente";
      } else if (typeof company.score === "number") {
        solvency = company.score >= 7 ? "solvente" : "insolvente";
      }
      
      return `${name} (${cnpj}) - Solvência: ${solvency || "N/D"}`;
    })
    .join("\n");
}

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;

  const { process, isLoading, refetch } = useProcessAutoRefresh({
    processId: id,
    enabled: false,
    intervalMs: 10000,
  });

  const updateFormMutation = useUpdateProcessForm(process?.number);

  const [formState, setFormState] = useState<PipedriveFormData>({
    title: "",
    processNumber: "",
    executionNumber: "",
    duplicated: "",
    dl: "",
    firstDegree: "",
    secondDefendantResponsibility: "",
    defendants: "",
    analysis: "",
    prazo: "",
    abatimento: "",
    observacao: "",
    calculoAutos: "",
    calculoAutosValue: "",
    calculoHomologado: "",
    execucaoProvisoria: "",
    sucumbencia: "",
    freeJustice: "",
    conclusion: "",
    observacaoPreAnalise: "",
  });

  const [initialFormState, setInitialFormState] = useState<PipedriveFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (process) {
      const processTitle = getProcessTitle(
        process?.processParts || [], 
        process?.number,
        process?.title || (process as any)?.formPipedrive?.title,
        false
      );
      
      if (process?.formPipedrive) {
        const newFormState = {
          title: processTitle,
          processNumber: process?.formPipedrive?.processNumber || process?.number || "",
          executionNumber: process?.formPipedrive?.executionNumber || process?.calledByProvisionalLawsuitNumber || "",
          duplicated: process?.formPipedrive?.duplicated || "",
          dl: process?.formPipedrive?.dl || "",
          firstDegree: process?.formPipedrive?.firstDegree || "",
          secondDefendantResponsibility: process?.formPipedrive?.secondDefendantResponsibility || "",
          defendants: formatDefendantsForForm(process?.companies || []) || process?.formPipedrive?.defendants || "",
          analysis: extractPureAnalysis(process?.formPipedrive?.analysis || ""),
          prazo: process?.parametersStepDeadlineInMonths
            ? process.parametersStepDeadlineInMonths.toString()
            : process?.formPipedrive?.prazo || "",
          abatimento: process?.formPipedrive?.abatimento || "",
          observacao: process?.observation?.description || process?.formPipedrive?.observacao || "",
          observacaoPreAnalise: (process?.formPipedrive as any)?.observacaoPreAnalise || "",
          calculoAutos: (process?.formPipedrive as any)?.calculoAutos || "",
          calculoAutosValue: (process?.formPipedrive as any)?.calculoAutosValue || "",
          calculoHomologado: (process?.formPipedrive as any)?.calculoHomologado || "",
          execucaoProvisoria: (process?.formPipedrive as any)?.execucaoProvisoria || "",
          sucumbencia: (process?.formPipedrive as any)?.sucumbencia || "",
          freeJustice: (process?.formPipedrive as any)?.freeJustice || "",
          conclusion: (process?.formPipedrive as any)?.conclusion || "",
          stageLabel: process?.stage,
        };
        setFormState(newFormState);
        setInitialFormState(newFormState);
      } else {
        const defendantParts = process?.processParts?.filter(part => 
          part.polo === "PASSIVO" && 
          (part.tipo?.toLowerCase() === "reclamado" || part.tipo?.toLowerCase() === "réu")
        ) || [];
        
        const defendantNames = new Set(defendantParts.map(part => part.nome));
        
        const newFormState = {
          title: processTitle,
          processNumber: process?.number || "",
          executionNumber: process?.calledByProvisionalLawsuitNumber || "",
          duplicated: "",
          dl: "",
          firstDegree: "",
          secondDefendantResponsibility: "",
          defendants: formatDefendantsForForm(process?.companies || []) || "",
          analysis: "",
          prazo: process?.parametersStepDeadlineInMonths
            ? process.parametersStepDeadlineInMonths.toString()
            : "",
          abatimento: "",
          observacao: process?.observation?.description || "",
          observacaoPreAnalise: "",
          calculoAutos: "",
          calculoAutosValue: "",
          calculoHomologado: "",
          execucaoProvisoria: "",
          sucumbencia: "",
          freeJustice: "",
          conclusion: "",
          stageLabel: process?.stage,
        };
        setFormState(newFormState);
        setInitialFormState(newFormState);
      }
    }
  }, [process]);

  useEffect(() => {
    if (initialFormState) {
      const changed = JSON.stringify(formState) !== JSON.stringify(initialFormState);
      setHasChanges(changed);
    }
  }, [formState, initialFormState]);

  const mapFormToApiFormat = (formData: PipedriveFormData) => {
    const { title, ...formDataWithoutTitle } = formData;
    
    const mappedData: any = { ...formDataWithoutTitle };
    const fieldsToMap = Object.keys(FIELD_KEYS) as Array<keyof typeof FIELD_KEYS>;

    fieldsToMap.forEach(fieldName => {
      const fieldValue = formData[fieldName];
      if (fieldValue) {
        const key = FIELD_KEYS[fieldName];
        
        if (fieldName === "calculoAutos") {
          if (formData.calculoAutos === "Sim" && formData.calculoAutosValue && formData.calculoAutosValue.trim() !== "") {
            mappedData[key] = formData.calculoAutosValue;
          } else {
            mappedData[key] = fieldValue;
          }
        } else {
          mappedData[key] = fieldValue;
        }
      }
    });

    if (formData.executionNumber) {
      mappedData.executionNumber = formData.executionNumber;
    }

    return mappedData;
  };

  const handleSave = async () => {
    try {
      const mappedFormData = mapFormToApiFormat(formState);
      
      const dataToSend = {
        ...mappedFormData,
        title: process?.title || ""
      };
      
      await updateFormMutation.mutateAsync({
        processNumber: process!.number,
        formData: dataToSend,
      });

      await refetch();
      setInitialFormState(formState);
      setHasChanges(false);
      toast.success("Formulário de Análise salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar Formulário de Análise");
      console.error("Erro:", error);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm("Você tem alterações não salvas. Deseja sair sem salvar?")) {
        window.close();
        setTimeout(() => router.back(), 100);
      }
    } else {
      window.close();
      setTimeout(() => router.back(), 100);
    }
  };

  const extractPureAnalysis = (analysisText: string): string => {
    if (!analysisText || !analysisText.trim()) return "";
    
    const isConcatenatedFormat = /^[A-Z\sX]+[\n]{2}Número processo:/m.test(analysisText);
    
    if (isConcatenatedFormat) {
      const analysisMatch = analysisText.match(/Análise:\s*\n\n([\s\S]*?)(?=\n\n(?:Justiça gratuita:|Parâmetros Proposta|$))/i);
      if (analysisMatch && analysisMatch[1]) {
        return analysisMatch[1].trim();
      }
      const beforeJustice = analysisText.split(/Justiça gratuita:/i)[0];
      const beforeParams = beforeJustice.split(/Parâmetros Proposta/i)[0];
      const analysisSection = beforeParams.split(/Análise:\s*\n\n/i);
      if (analysisSection.length > 1) {
        return analysisSection[analysisSection.length - 1].trim();
      }
    }
    
    const oldMarkers = [
      "\n\n---\n\n**Informações do Formulário:**",
      "**Informações do Formulário:**",
    ];
    
    let pureAnalysis = analysisText;
    for (const marker of oldMarkers) {
      const index = pureAnalysis.indexOf(marker);
      if (index > 0) {
        pureAnalysis = pureAnalysis.substring(0, index).trim();
        break;
      }
    }
    
    return pureAnalysis;
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
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                <span>Formulário de Análise</span>
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

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <PipedriveFormCard
              form={{ ...formState, stageLabel: process?.stage }}
              setForm={setFormState}
              readOnly={false}
              alwaysExpanded={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

