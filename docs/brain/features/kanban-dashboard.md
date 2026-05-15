# Feature: Kanban Dashboard

## Quando usar

Use este mapa quando a task envolver o painel Kanban, esteiras, stages, drag-and-drop, filtros ou listagem de processos.

## Status do mapeamento

- Estado: parcial
- Ultima area investigada: componentes Kanban e hooks de stage
- Principais lacunas: componentes internos de filtro nao detalhados

## Pontos de entrada

- `src/app/dashboard/page.tsx`: pagina principal do dashboard.
- `src/components/KanbanBoard.tsx`: board com colunas.
- `src/components/KanbanColumn.tsx`: coluna por stage.
- `src/components/KanbanCard.tsx`: card de processo.

## Arquivos relacionados

- `src/components/FiltersBar.tsx`: barra de filtros avancados.
- `src/components/process/MassEditPanel.tsx`: edicao em massa.
- `src/components/process/InsertProcessModal.tsx`: modal de insercao.
- `src/app/api/hooks/processes/useProcesses.ts`: listagem paginada.
- `src/app/api/hooks/process/useChangeStage.ts`: mutacao de stage.
- `src/app/api/hooks/process/useBulkUpdateProcesses.ts`: bulk update.
- `src/app/hooks/filter/`: FilterProvider para estado global de filtros.
- `src/app/interfaces/processes.ts`: interfaces Process, StageProcess, Situation.

## Fluxo resumido

1. Dashboard carrega com `useProcesses` (paginacao, filtros, stage).
2. Processos sao agrupados por stage (PRE_ANALISE, ANALISE, CALCULO).
3. Cada stage possui esteiras (Reclamantes Outbound, Reclamantes Inbound, Ticket Alto, Advogados Parceiros).
4. StageId numerico mapeia para stage+esteira via `StageByCode` e `EsteiraByStageId`.
5. Drag-and-drop via @dnd-kit move processo entre stages.
6. `useChangeStage` envia PATCH para o backend com novo stageId.
7. React Query invalida cache e refaz query.

## Conceitos

- StageProcess: enum com ANALISE, PRE_ANALISE, CALCULO.
- Situation: enum com PENDING, LOSS, APPROVED.
- StageByCode: mapa de stageId numerico (Pipedrive) para stage interno.
- EsteiraByStageId: mapa de stageId para nome da esteira.
- NextStageIdByEsteira: dado esteira e stage destino, retorna stageId.

## Riscos e cuidados

- Mudar mapeamento de stageId quebra toda a logica de Kanban e Pipedrive.
- Bulk update afeta multiplos processos de uma vez.
- Filtros afetam a query de listagem; parametros errados podem ocultar processos.

## Pendencias de mapeamento

- Detalhar componentes internos de filtro (data range, status, classe, etc.).
- Mapear fluxo de selecao multipla para bulk operations.
