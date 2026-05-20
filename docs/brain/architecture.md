# Architecture Map

## Estado

Documento inicial. Deve evoluir a partir de investigacoes confirmadas no codigo.

## Stack observada

- Next.js 16 (App Router).
- React 19.
- TypeScript.
- Tailwind CSS v4.
- Radix UI (componentes base).
- React Query / TanStack Query (data fetching).
- Axios (HTTP client).
- Socket.io-client (real-time).
- Zod (validacao de forms).
- React Hook Form.
- xlsx, papaparse, file-saver (exportacao).
- @react-pdf-viewer, pdf-lib (visualizacao PDF).
- recharts (graficos).
- lucide-react (icones).
- @dnd-kit (drag and drop).

## Bootstrap e paginas

- `src/app/layout.tsx` e o layout raiz, carrega fontes e globals.css.
- `src/app/providers.tsx` monta a stack de providers: QueryClientProvider > ThemeProvider > AuthProvider > NotificationsProvider > FilterProvider.
- `src/app/page.tsx` redireciona para `/dashboard`.
- `middleware.ts` valida paths contra traversal malicioso e gerencia modo manutencao.

## Diretorios principais

- `src/app/`: paginas (App Router), hooks de app, interfaces, utils e API hooks.
- `src/app/api/hooks/`: hooks React Query organizados por dominio (process, processes, company, prompts, etc.).
- `src/app/interfaces/`: interfaces TypeScript para dados do backend.
- `src/app/hooks/`: hooks de contexto (auth, filter, notifications, mobile).
- `src/app/dashboard/`: paginas do dashboard (Kanban, empresas, prompts, metricas, motivos de perda).
- `src/app/processes/`: paginas de detalhe de processo (dinamicas por [number]).
- `src/components/`: componentes React reutilizaveis.
- `src/components/ui/`: componentes base Radix UI (button, dialog, input, select, table, etc.).
- `src/components/process/`: componentes de processo (header, info card, documents, timeline, activities, etc.).
- `src/components/layout/`: shell principal e header.
- `src/lib/`: configuracao de React Query, Socket.io e utils gerais.
- `src/data/`: dados mock.

## Fluxo de dados

- Paginas usam hooks de `src/app/api/hooks/` para buscar e mutar dados.
- Hooks usam Axios via instancia centralizada em `src/app/api/index.ts`.
- Axios aponta para `NEXT_PUBLIC_API_URL` (robo-api backend).
- React Query gerencia cache, refetch e stale time (10 min padrao).
- Socket.io conecta ao backend para notificacoes real-time.

## Estado e contextos

- AuthProvider: estado de autenticacao, usuario logado, token em cookie.
- FilterProvider: filtros globais do Kanban (status, data, classe, etc.).
- NotificationsProvider: notificacoes via Socket.io.
- ThemeProvider: tema claro/escuro via CSS variables.

## Padroes de componente

- Componentes UI base: Radix UI + CVA (class-variance-authority) + Tailwind.
- Componentes de feature: composicao de UI base com logica de dominio.
- Forms: React Hook Form + Zod resolvers.
- Modais: Radix Dialog.
- Tabelas: componente Table com paginacao.

## Fronteiras confirmadas

- Frontend consome exclusivamente a robo-api via REST (Axios).
- Nao ha acesso direto a banco de dados.
- Real-time via Socket.io (namespace padrao, auth por userId).
- Exportacao de dados e feita client-side com xlsx.

## Pendencias de mapeamento

- Detalhar componentes de metricas e graficos conforme tasks.
- Mapear fluxo completo de propostas/calculadora.
