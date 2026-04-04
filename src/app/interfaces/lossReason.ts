export enum LossReason {
  ARQUIVADO = "ARQUIVADO",
  CLASSE_INELEGIVEL = "CLASSE_INELEGIVEL", 
  SEM_VERBA_SALARIAL = "SEM_VERBA_SALARIAL",
  VALOR_BAIXO = "VALOR_BAIXO",
  EMPRESA_INSOLVENTE = "EMPRESA_INSOLVENTE",
  PRESCRICAO = "PRESCRICAO",
  ACORDO_JUDICIAL = "ACORDO_JUDICIAL",
  OUTROS = "OUTROS"
}

export const lossReasonLabels: Record<LossReason, string> = {
  [LossReason.ARQUIVADO]: "Arquivado",
  [LossReason.CLASSE_INELEGIVEL]: "Classe Inelegível", 
  [LossReason.SEM_VERBA_SALARIAL]: "Sem Verba Salarial",
  [LossReason.VALOR_BAIXO]: "Valor Baixo",
  [LossReason.EMPRESA_INSOLVENTE]: "Empresa Insolvente",
  [LossReason.PRESCRICAO]: "Prescrição",
  [LossReason.ACORDO_JUDICIAL]: "Acordo Judicial",
  [LossReason.OUTROS]: "Outros"
};

export interface FilterState {
  search: string | null;
  status: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  stageDateFrom: Date | string | null;
  stageDateTo: Date | string | null;
  lossReason: string | null; // ✅ Novo campo
}