# Project Context

## Estado

Documento de contexto geral apos scan inicial. Detalhes por area ficam nos mapas em `features/` e `engineering/`.

## Produto

`painel-robo` e um painel frontend Next.js/TypeScript para gestao de processos judiciais da Juri Capital (Prosolutti). Permite advogados e administradores gerenciar processos, acompanhar status via Kanban, analisar documentos, exportar dados e interagir com o CRM.

## Diretrizes de conhecimento

- O codigo e a fonte primaria de verdade.
- Este documento deve registrar apenas contexto amplo e duravel.
- Regras especificas devem ficar nos mapas de feature em `features/`.
- Decisoes estruturais devem ficar em `decisions/`.

## Vocabulario

- Processo: entidade central representando um processo judicial com numero, classe, partes, movimentos e documentos.
- Empresa: entidade representando reclamada (empresa re) com CNPJ, razao social, solvencia e score.
- Kanban: painel principal com colunas por estagio (PRE_ANALISE, ANALISE, CALCULO).
- Esteira: fila de trabalho dentro de cada estagio (Reclamantes Outbound, Reclamantes Inbound, Ticket Alto, Advogados Parceiros).
- Stage: estagio do processo no Pipedrive, mapeado por stageId numerico.
- Deal: negocio no Pipedrive vinculado ao processo.
- Analise: avaliacao do processo feita pelo backend e exibida no painel.
- Documento: arquivo PDF extraido do processo judicial, com status de extracao e insights.
- Insight: resultado de analise AI sobre um documento (extraido via Vertex AI no backend).
- Movimento: evento processual com data e descricao, obtido da fonte judicial.
- Atividade: tarefa criada por usuario, atribuida a advogado, com status de conclusao.
- Notificacao: alerta real-time via Socket.io para novos movimentos ou atividades.
- Situation: estado do processo (PENDING, LOSS, APPROVED).

## Dominios principais

- Gestao de processos: Kanban, listagem, detalhe, filtros, busca, bulk update.
- Gestao de empresas: listagem, detalhe, CNPJ, CNDT, solvencia.
- CRM/operacao: Pipedrive notes, deal forms, stages.
- Documentos/AI: visualizacao PDF, insights, prompts de AI.
- Metricas/exportacao: dashboard de metricas, exportacao Excel.
- Autenticacao: login, sessoes, roles (Admin, Advogado).

## Pendencias de mapeamento

- Aprofundar componentes de metricas quando houver task especifica.
- Mapear fluxo de propostas/calculadora quando virar foco.
