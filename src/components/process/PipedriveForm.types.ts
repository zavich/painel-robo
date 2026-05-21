import { StageProcess } from "@/app/interfaces/processes";

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
