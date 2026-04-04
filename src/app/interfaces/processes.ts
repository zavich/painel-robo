export interface ProcessStep {
  _id: string;
  name: string;
  slug: string;
  next: string;
}

export enum Situation {
  PENDING = "PENDING",
  LOSS = "LOSS",
  APPROVED = "APPROVED",
}

export interface ProcessStatus {
  _id: string;
  name: ProcessStatusEnum | string; // Permite string para compatibilidade com valores do backend
  step: string | ProcessStep; // Can be string (step ID) or ProcessStep object
  log: string;
  errorReason?: string;
  createdAt: string; // Change from Date to string
  updatedAt: string; // Change from Date to string
}

export interface Movimentacoes {
  id: number;
  data: string;
  conteudo: string;
  instancia: string;
}
export interface PeticaoInicialData {
  qualificacao_reclamante: {
    estado_civil?: string;
    nacionalidade?: string;
    nome_completo?: string;
    endereco_completo?: string;
    data_nascimento?: string;
    filiacao?: string;
    cpf?: string;
    rg?: string;
    pis_pasep?: string;
  };
  dados_contrato?: {
    data_admissao?: string;
    data_demissao?: string;
    ultimo_salario?: number | null;
    funcao_exercida?: string;
    modalidade_demissao?: string;
  };
}

export interface Documento {
  tipo?: string;
  numero?: string;
}

export interface AutosData {
  class: string;
  relator: string;
  ativo: string;
  passivo: string;
  dateOfTransit: string;
  dateOfDistribution: string;
  movements: Movimentacoes[];
  number?: string;
}
export interface ProcessPart {
  id: string;
  tipo: string;
  nome: string;
  documento: Documento;
  oabs: { numero: string; uf: string }[];
  polo: string;
  principal: boolean;
  advogado_de: string;
}
export interface Complainant {
  _id: string;
  name: string;
}
export interface Partner {
  socios_nome: string;
  socios_cpf_cnpj: string;
  socios_entrada: string;
  socios_qualificacao: string;
  socios_faixa_etaria: string;
}
export interface Company {
  _id: string;
  name: string;
  cnpj: string;
  fantasyName: string;
  email: string;
  registrationStatus: string;
  legalNature: string;
  taxRegime: string;
  specialRule: SpecialRule | null;
  socialCapital: string;
  partners: Partner[];
  invoicing: string;
  createdAt: string;
  updatedAt: string;
  reason: string;
  cndt: {
    status: string;
    temp_link: string;
  };
  score?: number;
  porte?: string;
}
export interface ValueSelectedSpreadsheet {
  type: string;
  title: string;
  extension: string;
  data: {
    owner: string;
    fgts: number;
    bruto: number;
    liquido: number;
    inss_reclamante: number;
    irpf_reclamante: number;
    correcao: string;
    data_calculo: string;
    data_liquidacao: string;
    id: string;
    ownerType: string;
  };
  temp_link: string;
  uniqueName: string;
  date: string;
  _id: string;
}
export interface Instancia {
  id: number;
  url: string;
  sistema: string;
  instancia: string;
  extra_instancia: string;
  segredo: boolean;
  assunto: string;
  classe: string;
  area: string;
  data_distribuicao: string;
  orgao_julgador: string;
  moeda_valor_causa: string;
  valor_causa: string;
  arquivado: boolean;
  data_arquivamento: string;
  last_update_time: string;
  movimentacoes: Movimentacoes[];
}
export interface SimpleCalcProposal {
  noantecipation: {
    advCredit: number;
    reclamanteCredit: number;
    paymentCreditAdv: number;
    paymentCreditReclamant: number;
    desagio: number;
  };
  ["50/50"]: {
    advCredit: number;
    reclamanteCredit: number;
    paymentCreditAdvFiftyPercent: number;
    paymentCreditAdvFiftyPercentFinal: number;
    paymentCreditReclamantFiftyPercent: number;
    desagio: number;
  };
  antecipation: {
    advCredit: number;
    reclamanteCredit: number;
    paymentCreditAdvAntecipation: number;
    paymentCreditReclamantAntecipation: number;
    desagio: number;
  };
}
export interface Observation {
  _id: string;
  description: string;
  processId: string;
  createdAt: string;
  updatedAt: string;
}

export interface History {
  createdAt: string;
  updatedAt: string;
  user_id: string;
  stage?: StageProcess;
  status?: Situation;
  rejection_reason?: string;
  is_custom_reason?: boolean;
  rejection_description?: string;
}

export interface ProcessDecision {
  createdAt: string;
  updatedAt: string;
  _id: string;
  process_id: string;
  history: History[];
}

export interface FormPipedrive {
  title?: string;
  processNumber?: string;
  executionNumber?: string;
  duplicated?: string;
  dl?: string;
  firstDegree?: string;
  secondDefendantResponsibility?: string;
  defendants?: string;
  analysis?: string;
  calculoAutos?: string;
  calculoHomologado?: string;
  naturezaJuridica?: string;
  execucaoProvisoria?: string;
  prazo?: string;
  abatimento?: string;
  observacao?: string;
  observacaoPreAnalise?: string;
  sucumbencia?: string;
  freeJustice?: string;
  conclusion?: string;
  sd?: string;
  fgts?: string;
  jornadaOuCP?: string;
  multaEmbargos?: string;
  alvara?: string;
  cessaoCredito?: string;
  minValueEstimate?: string;
  value?: string;
}

interface ProcessOwner {
  _id: string;
  isActive: boolean;
  user: {
    _id: string;
    email: string;
    role: string;
  };
  userId: string;
}

export enum ProcessStatusEnum {
  // Status de processamento
  PROCESSING = 'Processando',
  PROCESSING_WITH_MOVIMENTS = 'PROCESSING_WITH_MOVIMENTS',
  PROCESSING_WITH_DOCUMENTS = 'PROCESSING_WITH_DOCUMENTS',
  PROCESS_WAITING_EXTRACTION_DOCUMENTS = 'PROCESS_WAITING_EXTRACTION_DOCUMENTS',
  
  // Status intermediários
  EXTRACTION_MOVIMENTS_FINISHED = 'Extração de movimentações Finalizada',
  EXTRACTION_DOCUMENTS_FINISHED = 'EXTRACTION_DOCUMENTS_FINISHED',
  EXTRACTION_FINISHED = 'Extração finalizada',
  
  // Status de sucesso
  SUCCESS = 'Success',
  PROCESSED = 'Processado',
  
  // Status de erro
  ERROR = 'Error',
}

export interface Process {
  _id: string;
  id: string;
  legalNature: string;
  title?: string;
  number: string;
  situation: Situation;
  processDecisions: ProcessDecision;
  documents: DocumentExtract[];
  complainant: Complainant;
  companies: Company[];
  processParts: ProcessPart[];
  createdAt: string;
  instancias: Instancia[];
  updatedAt: string;
  valueCase: number;
  parameterStepCreditValue: number;
  parametersStepDeadlineInMonths: number;
  moviments: Movimentacoes[];
  class: string;
  dealId: number;
  autosData: AutosData;
  processExecution?: Process;
  filterValueSelectedSpreadsheet: {
    owner: string;
    fgts: number;
    bruto: number;
    liquido: number;
    inss_reclamante: number;
    irpf_reclamante: number;
    correcao: string;
    data_calculo: string;
    data_liquidacao: string;
    id: string;
    ownerType: string;
  };
  processMain?: Process;
  simpleCalcProposals: SimpleCalcProposal;
  observation: Observation;
  insights: any[];
  stage?: StageProcess;
  stageId: number;
  formPipedrive?: FormPipedrive;
  synchronizedAt?: string;
  calledByProvisionalLawsuitNumber?: string;
  processOwner?: ProcessOwner;
  rejectionDescription?: string;
  rejectionReason?: string;
  unreadByUsers?: string[];
  processStatus?: ProcessStatus;
  isDocuments?: boolean;
  isInstancias?: boolean;
  hasNewMovementsNow?: boolean;
  oldMoviments?: {
    primeiroGrau: number | null;
    segundoGrau: number | null;
    tst: number | null;
  };
}

export enum SpecialRule {
  SOLVENT = "solvente",
  INSOLVENT = "insolvente",
}

export enum StageProcess {
  ANALYSIS = "ANALISE",
  PRE_ANALYSIS = "PRE_ANALISE",
  CALCULATION = "CALCULO",
}

export enum StatusExtractionInsight {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export interface DocumentExtract {
  _id: string;
  title: string;
  temp_link: string;
  uniqueName: string;
  date: string;
  status: StatusExtractionInsight;
  data?: any;
}

export enum PromptType {
  PeticaoInicial = "PeticaoInicial",
  Homologacao = "Homologacao",
  PlanilhaCalculo = "PlanilhaCalculo",
  SentencaMerito = "SentencaMerito",
  SentencaED = "SentencaED",
  SentencaEE = "SentencaEE",
  Acordao = "Acordao",
  RecursoDeRevista = "RecursoDeRevista",
  AcordaoMerito = "AcordaoMerito",
  DecisaoPrevencao = "DecisaoPrevencao",
  AcordaoED = "AcordaoED",
  AgravoPeticao = "AgravoPeticao",
  AdmissibilidadeRR = "AdmissibilidadeRR",
  AcordoEParcelamento = "AcordoEParcelamento",
  Decisao = "Decisao",
  Alvara = "Alvara",
  HomologacaoDeAcordo = "HomologacaoDeAcordo",
  Garantia = "Garantia",
}

export interface Prompt {
  _id: string;
  type: PromptType | string;
  content?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const StageByCode: Record<number, 'PRE_ANALISE' | 'ANALISE' | 'CALCULO'> = {
  781: 'PRE_ANALISE',
  779: 'PRE_ANALISE',
  777: 'PRE_ANALISE',
  802: 'PRE_ANALISE',
  769: 'ANALISE',
  762: 'ANALISE',
  755: 'ANALISE',
  787: 'ANALISE',
  770: 'CALCULO',
  763: 'CALCULO',
  756: 'CALCULO',
  797: 'CALCULO',
  849: 'CALCULO',
};

export const EsteiraByStageId: Record<number, string> = {
  781: "Reclamantes Outbound",
  779: "Reclamantes Inbound",
  777: "Ticket Alto",
  802: "Advogados Parceiros",
  769: "Reclamantes Outbound",
  762: "Reclamantes Inbound",
  755: "Ticket Alto",
  787: "Advogados Parceiros",
  770: "Reclamantes Outbound",
  763: "Reclamantes Inbound",
  756: "Ticket Alto",
  797: "Advogados Parceiros",
  849: "Advogados Parceiros",
};

export const NextStageIdByEsteira: Record<string, Record<string, number>> = {
  "Reclamantes Outbound": {
    PRE_ANALISE: 781,
    ANALISE: 769,
    CALCULO: 770,
  },
  "Reclamantes Inbound": {
    PRE_ANALISE: 779,
    ANALISE: 762,
    CALCULO: 763,
  },
  "Ticket Alto": {
    PRE_ANALISE: 777,
    ANALISE: 755,
    CALCULO: 756,
  },
  "Advogados Parceiros": {
    PRE_ANALISE: 802,
    ANALISE: 787,
    CALCULO: 797,
  },
};
