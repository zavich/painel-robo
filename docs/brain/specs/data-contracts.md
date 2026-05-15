# Data Contracts (TypeScript Interfaces)

Arquivo fonte: `src/app/interfaces/processes.ts`

---

## Enums

### Situation

```typescript
enum Situation { PENDING = "PENDING", LOSS = "LOSS", APPROVED = "APPROVED" }
```

### StageProcess

```typescript
enum StageProcess { ANALYSIS = "ANALISE", PRE_ANALYSIS = "PRE_ANALISE", CALCULATION = "CALCULO" }
```

### ProcessStatusEnum

```typescript
enum ProcessStatusEnum {
  PROCESSING = "Processando",
  PROCESSING_WITH_MOVIMENTS = "PROCESSING_WITH_MOVIMENTS",
  PROCESSING_WITH_DOCUMENTS = "PROCESSING_WITH_DOCUMENTS",
  PROCESS_WAITING_EXTRACTION_DOCUMENTS = "PROCESS_WAITING_EXTRACTION_DOCUMENTS",
  EXTRACTION_MOVIMENTS_FINISHED = "Extração de movimentações Finalizada",
  EXTRACTION_DOCUMENTS_FINISHED = "EXTRACTION_DOCUMENTS_FINISHED",
  EXTRACTION_FINISHED = "Extração finalizada",
  SUCCESS = "Success",
  PROCESSED = "Processado",
  ERROR = "Error",
}
```

### StatusExtractionInsight

```typescript
enum StatusExtractionInsight { PENDING, PROCESSING, COMPLETED, ERROR }
```

### SpecialRule

```typescript
enum SpecialRule { SOLVENT = "solvente", INSOLVENT = "insolvente" }
```

### PromptType

```typescript
enum PromptType {
  PeticaoInicial, Homologacao, PlanilhaCalculo, SentencaMerito, SentencaED,
  SentencaEE, Acordao, RecursoDeRevista, AcordaoMerito, DecisaoPrevencao,
  AcordaoED, AgravoPeticao, AdmissibilidadeRR, AcordoEParcelamento,
  Decisao, Alvara, HomologacaoDeAcordo, Garantia
}
```

### UserRolesEnum

```typescript
enum UserRolesEnum { ADMIN = "admin", LAWYER = "advogado" }
```

### LossReason

```typescript
enum LossReason {
  ARQUIVADO, CLASSE_INELEGIVEL, SEM_VERBA_SALARIAL, VALOR_BAIXO,
  EMPRESA_INSOLVENTE, PRESCRICAO, ACORDO_JUDICIAL, OUTROS
}
```

---

## Process (entidade central)

```typescript
interface Process {
  _id: string
  id: string
  number: string
  legalNature: string
  title?: string
  class: string                          // 'MAIN' | 'PROVISIONAL_EXECUTION'
  situation: Situation
  stage?: StageProcess
  stageId: number                        // Pipedrive stage ID
  dealId: number                         // Pipedrive deal ID
  processDecisions: ProcessDecision
  documents: DocumentExtract[]
  complainant: Complainant
  companies: Company[]
  processParts: ProcessPart[]
  instancias: Instancia[]
  instanciasAutos: Instancia[]
  moviments: Movimentacoes[]
  valueCase: number
  parameterStepCreditValue: number
  parametersStepDeadlineInMonths: number
  autosData: AutosData
  processExecution?: Process             // processo de execucao vinculado
  processMain?: Process
  filterValueSelectedSpreadsheet: {
    owner: string, fgts: number, bruto: number, liquido: number,
    inss_reclamante: number, irpf_reclamante: number, correcao: string,
    data_calculo: string, data_liquidacao: string, id: string, ownerType: string
  }
  simpleCalcProposals: SimpleCalcProposal
  observation: Observation
  insights: any[]
  formPipedrive?: FormPipedrive
  processOwner?: ProcessOwner
  processStatus?: ProcessStatus
  synchronizedAt?: string
  calledByProvisionalLawsuitNumber?: string
  rejectionDescription?: string
  rejectionReason?: string
  unreadByUsers?: string[]
  hasDocuments?: boolean
  hasInstancias?: boolean
  hasNewMovementsNow?: boolean
  oldMoviments?: {
    primeiroGrau: number | null
    segundoGrau: number | null
    tst: number | null
  }
  createdAt: string
  updatedAt: string
}
```

---

## FormPipedrive

```typescript
interface FormPipedrive {
  title: string
  processNumber: string
  executionNumber: string
  duplicated: string
  dl: string
  firstDegree: string
  secondDefendantResponsibility: string
  defendants: string
  analysis: string
  calculoAutos: string
  calculoHomologado: string
  naturezaJuridica: string
  execucaoProvisoria: string
  prazo: string
  abatimento: string
  observacao: string
  observacaoPreAnalise: string
  sucumbencia: string
  freeJustice: string
  conclusion: string
  sd: string
  fgts: string
  jornadaOuCP: string
  multaEmbargos: string
  alvara: string
  cessaoCredito: string
  minValueEstimate: string
  value: number
}
```

---

## Activity

```typescript
interface Activity {
  _id?: string
  type: "PRE_ANALISE" | "ANALISE" | "CALCULO"
  assignedTo: string | ActivityUser
  assignedBy?: string | ActivityUser
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null | ActivityUser
  notes: string | null
  status?: "APPROVE" | "LOSS"
  lossReason?: string
  createdAt: string
  updatedAt: string
}
```

---

## UserType

```typescript
interface UserType {
  _id: string
  name: string
  contact: string
  email: string
  isActive: boolean
  role: "admin" | "advogado"
}
```

---

## NotificationDoc

```typescript
interface NotificationDoc {
  _id: string
  title: string
  description: string
  user: string
  read: boolean
  type: "ACTIVITY" | "SYSTEM"
  redirectId?: string            // numero do processo para routing
  createdAt: string
  updatedAt: string
}
```

---

## Pipedrive Field Keys (hardcoded)

```typescript
const FIELD_KEY_OBSERVACAO = "4ff33f89281e645310c0c124414cf84de4624334"
const FIELD_KEY_CALCULO_AUTOS = "7da05be1e1c53f0d7595f883512baf69cf832f88"
```

Usados em `/processes/[number]/pre-analysis/page.tsx` dentro de `formPipedrive` data.
