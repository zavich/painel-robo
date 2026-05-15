# Feature: Process Detail

## Quando usar

Use este mapa quando a task envolver detalhe de processo, documentos, movimentos, atividades, insights ou visualizacao de PDF.

## Status do mapeamento

- Estado: parcial
- Ultima area investigada: pagina de detalhe e componentes de processo
- Principais lacunas: fluxo de analise e pre-analise nao detalhados

## Pontos de entrada

- `src/app/processes/[number]/page.tsx`: pagina de detalhe.
- `src/app/processes/[number]/analysis/page.tsx`: pagina de analise.
- `src/app/processes/[number]/pre-analysis/page.tsx`: pagina de pre-analise.
- `src/app/processes/[number]/document/[documentId]/page.tsx`: visualizador de documento.

## Arquivos relacionados

- `src/components/process/ProcessHeader.tsx`: header com numero, titulo e acoes.
- `src/components/process/ProcessInfoCard.tsx`: informacoes gerais.
- `src/components/process/DocumentsCard.tsx`: lista de documentos com status.
- `src/components/process/TimelineCard.tsx`: movimentos processuais.
- `src/components/process/ActivitiesCard.tsx`: atividades e notas.
- `src/components/process/ProcessPartsCard.tsx`: partes (reclamante, reclamada, advogados).
- `src/components/process/ProcessDocumentModal.tsx`: modal de visualizacao PDF.
- `src/components/insights/InsightGeneric.tsx`: exibicao de insight AI.
- `src/app/api/hooks/process/useProcess.ts`: query de processo unitario.
- `src/app/api/hooks/process/useExtractInsights.ts`: mutacao para extrair insights.
- `src/app/api/hooks/process/useNewMovements.ts`: novos movimentos.
- `src/app/api/hooks/process/useCreateActivity.ts`: criar atividade.
- `src/app/api/hooks/process/useCompleteActivity.ts`: completar atividade.
- `src/app/api/hooks/process/useDocumentDetails.ts`: detalhes de documento.
- `src/app/api/hooks/process/useFetchPDF.ts`: buscar PDF.

## Fluxo resumido

1. Pagina carrega com `useProcess(number)`.
2. Renderiza header, info card, partes, timeline, documentos e atividades.
3. Documentos mostram status de extracao (PENDING, PROCESSING, COMPLETED, ERROR).
4. Usuario pode solicitar extracao de insights via `useExtractInsights`.
5. Insights sao exibidos por tipo de documento (PeticaoInicial, Sentenca, Acordao, etc.).
6. Atividades podem ser criadas, atribuidas e concluidas.
7. Notas podem ser enviadas ao Pipedrive via `useAddPipedriveNote`.

## Conceitos

- DocumentExtract: documento com title, temp_link (S3 URL), uniqueName, date, status.
- StatusExtractionInsight: PENDING, PROCESSING, COMPLETED, ERROR.
- PromptType: tipo de documento para analise AI (PeticaoInicial, Homologacao, Sentenca, etc.).
- Instancia: instancia judicial (primeiro grau, segundo grau, TST).
- FormPipedrive: campos do deal no Pipedrive vinculados ao processo.
- SimpleCalcProposal: propostas de calculo com tres cenarios (sem antecipacao, 50/50, antecipacao).

## Riscos e cuidados

- temp_link de documento e pre-signed URL do S3; pode expirar.
- Extracao de insights depende do backend e Vertex AI; pode falhar ou demorar.
- Multiplos tipos de documento requerem prompts diferentes.

## Pendencias de mapeamento

- Detalhar fluxo de analise vs pre-analise.
- Mapear componentes de proposta e calculadora.
- Documentar fluxo de observacoes.
