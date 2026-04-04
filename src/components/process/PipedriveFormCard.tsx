import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { StageProcess } from "@/app/interfaces/processes";
import { getStageLabel } from "@/app/utils/processUtils";
import dynamic from "next/dynamic";
import { marked } from 'marked';
import { useTheme } from "@/app/hooks/use-theme-client";
import TurndownService from 'turndown';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export interface PipedriveFormData {
  title: string;
  processNumber: string;
  stageLabel?: StageProcess;
  executionNumber?: string;
  duplicated: string;
  dl: string;
  firstDegree: string;
  secondDefendantResponsibility: string;
  defendants: string;
  analysis: string;
  calculoAutos: string;
  calculoAutosValue: string;
  calculoHomologado: string;
  execucaoProvisoria: string;
  prazo: string;
  abatimento: string;
  observacao: string;
  observacaoPreAnalise: string;
  sucumbencia: string;
  freeJustice: string;
  conclusion: string;
  value?: string;
}

interface PipedriveFormCardProps {
  form: PipedriveFormData;
  setForm: (data: PipedriveFormData) => void;
  readOnly?: boolean;
  alwaysExpanded?: boolean;
}

export function PipedriveFormCard({
  form,
  setForm,
  readOnly = false,
  alwaysExpanded = false,
}: PipedriveFormCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [analysisMarkdown, setAnalysisMarkdown] = useState('');
  const lastProcessedAnalysisRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Evitar processamento se o valor não mudou
    if (form.analysis === lastProcessedAnalysisRef.current) {
      return;
    }

    if (form.analysis !== undefined) {
      // Se o analysis contém HTML, converter para Markdown
      if (form.analysis && /<[a-z][\s\S]*>/i.test(form.analysis)) {
        try {
          const turndownService = new TurndownService();
          const markdown = turndownService.turndown(form.analysis);
          setAnalysisMarkdown(markdown);
          lastProcessedAnalysisRef.current = form.analysis;
        } catch (error) {
          console.error('Erro ao converter HTML para Markdown:', error);
          // Se falhar, tentar extrair apenas o texto
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = form.analysis;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          setAnalysisMarkdown(textContent);
          lastProcessedAnalysisRef.current = form.analysis;
        }
      } else if (form.analysis) {
        // Se não é HTML, usar diretamente como Markdown
        setAnalysisMarkdown(form.analysis);
        lastProcessedAnalysisRef.current = form.analysis;
      } else {
        // Se analysis está vazio, limpar o Markdown
        setAnalysisMarkdown('');
        lastProcessedAnalysisRef.current = form.analysis;
      }
    }
  }, [form.analysis]);

  const handleAnalysisChange = async (markdownValue: string | undefined) => {
    const value = markdownValue || '';
    setAnalysisMarkdown(value);
    try {
      const htmlValue = value ? await marked(value) : '';
      setForm({ ...form, analysis: htmlValue });
      // Atualizar a referência para evitar reconversão quando o usuário editar
      lastProcessedAnalysisRef.current = htmlValue;
    } catch (error) {
      setForm({ ...form, analysis: value });
      lastProcessedAnalysisRef.current = value;
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (readOnly) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSelectChange(name: string, value: string) {
    if (readOnly) return;
    setForm({ ...form, [name]: value });
  }

  const renderField = (label: string, value: string, fieldName?: string, placeholder?: string) => {
    if (readOnly) {
      return (
        <div>
          <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
          <div className="bg-muted dark:bg-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium text-primary dark:text-gray-100">
            {value || "-"}
          </div>
        </div>
      );
    }

    if (fieldName) {
      return (
        <div>
          <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
          <Input 
            name={fieldName} 
            value={value} 
            onChange={handleChange} 
            placeholder={placeholder}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-sm sm:text-base"
          />
        </div>
      );
    }

    return (
      <div>
        <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
        <div className="bg-muted dark:bg-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium text-primary dark:text-gray-100">
          {value}
        </div>
      </div>
    );
  };

  const renderSelectField = (label: string, value: string, fieldName: string, options: { value: string; label: string }[], forceReadOnly: boolean = false) => {
    const isReadOnly = readOnly || forceReadOnly;
    
    if (isReadOnly) {
      return (
        <div>
          <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
          <div className="bg-muted dark:bg-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium text-primary dark:text-gray-100">
            {value || "-"}
          </div>
        </div>
      );
    }

    return (
      <div>
        <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
        <Select value={value} onValueChange={v => handleSelectChange(fieldName, v)}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-sm sm:text-base">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            {options.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderTextareaField = (label: string, value: string, fieldName: string, rows: number = 2, forceReadOnly: boolean = false) => {
    const isReadOnly = readOnly || forceReadOnly;
    
    if (isReadOnly) {
      return (
        <div>
          <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
          <div className="bg-muted dark:bg-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium text-primary dark:text-gray-100 min-h-[60px] whitespace-pre-wrap">
            {value || "-"}
          </div>
        </div>
      );
    }

    return (
      <div>
        <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
        <Textarea 
          name={fieldName} 
          value={value} 
          onChange={handleChange} 
          rows={rows}
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-sm sm:text-base"
        />
      </div>
    );
  };

  const renderAnalysisField = (label: string, value: string, fieldName: string) => {
    if (readOnly) {
      return (
        <div>
          <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
          <div className="bg-muted dark:bg-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium text-primary dark:text-gray-100 min-h-[120px]">
            {value ? (
              <div 
                dangerouslySetInnerHTML={{ __html: value }} 
                className="prose prose-sm max-w-none dark:prose-invert"
              />
            ) : (
              "-"
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{label}</Label>
        <div 
          className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden md-editor-wrapper" 
          data-color-mode={theme === "dark" ? "dark" : "light"}
          onClick={(e) => {
            // Garantir que cliques no container ativem o editor
            const textarea = (e.currentTarget as HTMLElement).querySelector('textarea');
            if (textarea && !readOnly) {
              textarea.focus();
            }
          }}
        >
          <MDEditor
            value={analysisMarkdown}
            onChange={handleAnalysisChange}
            height={200}
            hideToolbar={false}
            preview="edit"
            visibleDragbar={false}
            textareaProps={{
              placeholder: 'Digite sua análise aqui... Você pode usar **negrito**, *itálico*, listas e outros elementos de formatação.',
              readOnly: false,
              disabled: false,
              autoFocus: false,
              spellCheck: true,
              style: {
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: 'inherit',
                pointerEvents: 'auto',
                cursor: 'text',
              },
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
          💡 Use Markdown para formatação: **negrito**, *itálico*, - listas, etc.
        </p>
      </div>
    );
  };

  return (
    <Card className="mb-4 sm:mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4">
        <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">
          {readOnly ? "Dados do Pipedrive" : "Enviar dados ao Pipedrive"}
        </CardTitle>
        {!alwaysExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher" : "Expandir"}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8 sm:h-10 sm:w-10"
          >
            {expanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />}
          </Button>
        )}
      </CardHeader>
      {(expanded || alwaysExpanded) && (
        <CardContent className="px-4 sm:px-6">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            style={{ gridAutoRows: "minmax(56px, auto)" }}
          >
            {form.title && form.title.trim() && (
              <div>
                <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  Título
                </Label>
                <div className="bg-muted dark:bg-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium text-primary dark:text-gray-100">
                  {form.title}
                </div>
              </div>
            )}
            {renderField("Nº do Processo", form.processNumber)}
            {renderField("Etapa", getStageLabel(form.stageLabel))}
            
            {form.executionNumber && renderField("Execução Provisória", form.executionNumber, "executionNumber", "Número do processo provisório")}
            
            {renderSelectField("Duplicado", form.duplicated, "duplicated", [
              { value: "Sim", label: "Sim" },
              { value: "Não", label: "Não" }
            ])}
            
            {renderField("DL", form.dl, "dl")}
            
            {renderSelectField("1º grau", form.firstDegree, "firstDegree", [
              { value: "OK", label: "OK" },
              { value: "Não", label: "Não" }
            ])}
            
            {renderField("Responsabilidade da 2ª reclamada", form.secondDefendantResponsibility, "secondDefendantResponsibility", "Digite a responsabilidade")}
            
            <div className="sm:col-span-2 lg:col-span-3">
              {renderTextareaField("Reclamadas (Nome, CNPJ e Solvência)", form.defendants, "defendants")}
            </div>
            
            <div className="sm:col-span-2 lg:col-span-3">
              {renderAnalysisField("Análise", form.analysis, "analysis")}
            </div>
            
            {/* Cálculo nos autos removido - agora está no formulário de Pré-Análise */}
            {form.calculoAutos && (
              <>
            {renderSelectField("Cálculo nos autos", form.calculoAutos, "calculoAutos", [
              { value: "Sim", label: "Sim" },
              { value: "Não", label: "Não" }
                ], true)}
            
                {form.calculoAutos === "Sim" && form.calculoAutosValue && (
              <div className="sm:col-span-2 lg:col-span-3">
                    {renderTextareaField("Detalhes do Cálculo nos autos", form.calculoAutosValue || "", "calculoAutosValue", 3, true)}
              </div>
                )}
              </>
            )}
            
            {renderSelectField("Cálculo homologado", form.calculoHomologado, "calculoHomologado", [
              { value: "Sim", label: "Sim" },
              { value: "Não", label: "Não" }
            ])}
            {renderField("Sucumbência", form.sucumbencia, "sucumbencia")}
            {renderSelectField("Justiça Gratuita", form.freeJustice, "freeJustice", [
              { value: "Sim", label: "Sim" },
              { value: "Não", label: "Não" }
            ])}
            {renderSelectField("Conclusão", form.conclusion, "conclusion", [
              { value: "Aprovado", label: "Aprovado" },
              { value: "Recusado", label: "Recusado" }
            ])}
            {renderField("Prazo", form.prazo, "prazo")}
            {renderField("Abatimento Valores", form.abatimento, "abatimento")}
            
            <div className="sm:col-span-2 lg:col-span-3">
              {renderTextareaField("Observação", form.observacao, "observacao")}
            </div>
            
            <div className="sm:col-span-2 lg:col-span-3">
              {/* Observações da Pré-Análise sempre somente leitura - vem da pré-análise */}
              {renderTextareaField("Observações da Pré-Análise", form.observacaoPreAnalise, "observacaoPreAnalise", 4, true)}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}