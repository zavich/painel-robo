# Application Map

## Estado

Documento inicial de scan geral. Mapas detalhados de feature ficam em `features/`.

## Paginas

- `/` (`src/app/page.tsx`): redireciona para `/dashboard`.
- `/login` (`src/app/login/page.tsx`): formulario de login com email/senha.
- `/dashboard` (`src/app/dashboard/page.tsx`): Kanban principal com processos.
- `/dashboard/companies` (`src/app/dashboard/companies/page.tsx`): gestao de empresas.
- `/dashboard/prompts` (`src/app/dashboard/prompts/page.tsx`): gestao de prompts AI (admin).
- `/dashboard/metrics` (`src/app/dashboard/metrics/page.tsx`): metricas e graficos.
- `/dashboard/reason-loss` (`src/app/dashboard/reason-loss/page.tsx`): motivos de perda (admin).
- `/processes/[number]` (`src/app/processes/[number]/page.tsx`): detalhe do processo.
- `/processes/[number]/analysis`: pagina de analise.
- `/processes/[number]/pre-analysis`: pagina de pre-analise.
- `/processes/[number]/document/[documentId]`: visualizador de documento PDF.
- `/health` (`src/app/health/`): health check (retorna `{ok: true}`).
- `/maintenance` (`src/app/maintenance/page.tsx`): pagina de manutencao.

## Componentes principais

### Layout

- `MainShell`: shell principal com sidebar e navegacao.
- `AppHeader`: header da aplicacao.

### Processo

- `KanbanBoard`, `KanbanColumn`, `KanbanCard`: Kanban com drag-and-drop.
- `ProcessHeader`: header do detalhe de processo.
- `ProcessInfoCard`: informacoes gerais do processo.
- `DocumentsCard`: lista de documentos com status de extracao.
- `TimelineCard`: movimentos processuais.
- `ActivitiesCard`: atividades e notas.
- `ProcessPartsCard`: partes do processo (reclamante, reclamada, advogados).
- `MassEditPanel`: edicao em massa de processos.
- `InsertProcessModal`: modal para inserir novo processo.
- `ProcessDocumentModal`: modal de visualizacao de documento.
- `FiltersBar`: barra de filtros avancados.

### UI Base

- 20+ componentes Radix UI em `src/components/ui/`: button, dialog, input, select, table, badge, pagination, tooltip, avatar, dropdown-menu, tabs, etc.

## Hooks de API (React Query)

### Processo (unitario)

- `useProcess`, `useChangeStage`, `useProcessLoss`, `useProcessReopen`.
- `useInsertProcess`, `useBulkUpdateProcesses`, `useUpdateProcessForm`.
- `useCreateActivity`, `useCompleteActivity`, `useChangeActivityAssignee`, `useUpdateActivityNotes`.
- `useNewMovements`, `useMarkMovementsAsViewed`.
- `useExtractInsights`, `useRemoveInsights`, `useDocumentDetails`.
- `useAddPipedriveNote`, `useSendNoteToPipedrive`.
- `useRejectionReasons`, `usePrompts`, `useAvailableStages`.
- `useProcessMetrics`, `useAssignProcessOwner`, `useCreateMassActivity`.
- `useFetchPDF`.

### Processos (listagem)

- `useProcesses`, `useMarkProcessAsRead`, `useRemoveProvisionalLawsuit`, `useInsertExecution`.

### Empresa

- `useCompanies`, `useCompany`, `useCompanyByCnpj`, `useEditCompany`, `useRequestCompanyDocument`.

### Outros

- `useRunLawsuits`, `useLawsuit` (executar busca de processos).
- `useAssignableUsers` (usuarios para atribuicao).
- `useSteps` (esteiras/steps).
- `useReasonLoss`, `useAddReasonLoss`, `useEditReasonLoss`, `useDeleteReasonLoss`.
- `usePrompts`, `useAddPrompt`, `useEditPrompt`, `useDeletePrompt`.
- `useObservation`.

## Contexts/Providers

- `AuthProvider` (`src/app/hooks/user/auth/`): autenticacao e sessao.
- `FilterProvider` (`src/app/hooks/filter/`): estado global de filtros.
- `NotificationsProvider` (`src/app/hooks/notifications/`): notificacoes Socket.io.

## Utils

- `excelExport.ts`: exportacao de processos para Excel.
- `processUtils.ts`: helpers de stages e workflow.
- `processStatusMapper.ts`: mapeamento de status para exibicao.
- `processPartsUtils.ts`: extracao de reclamante, reclamada, advogados.
- `formatUtils.ts`, `format.ts`, `masks.ts`: formatacao de texto, CPF, CNPJ.
- `formatar-dinheiro.ts`: formatacao de moeda BRL.
- `processSyncStatus.ts`: status de sincronizacao de documentos.

## Problemas atuais conhecidos

- Vulnerabilidades conhecidas em pdfjs-dist e xlsx (mitigadas, ver SECURITY.md).
- Sem suite de testes automatizados.
