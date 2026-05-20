# Debug Index

Use este indice quando a task vier como sintoma visual ou operacional. Ele aponta o menor conjunto inicial de arquivos para iniciar a investigacao.

## Pagina nao carrega ou tela branca

Checar:

- `src/app/layout.tsx` e `src/app/providers.tsx` (stack de providers).
- Erros no console do browser (hydration, import circular, provider ausente).
- Se `NEXT_PUBLIC_API_URL` esta definida.
- Se o middleware esta bloqueando a rota (`middleware.ts`).
- Se o modo manutencao esta ativo.

## Componente nao renderiza ou erro de hydration

Checar:

- Se o componente usa `"use client"` quando necessario.
- Se ha mismatch server/client (ex: `window`, `document`, `localStorage`).
- Se providers estao na ordem correta em `providers.tsx`.
- Se Radix UI components estao importados corretamente.

## Chamada API falhando ou dados nao aparecem

Checar:

- Hook React Query correspondente em `src/app/api/hooks/`.
- Instancia Axios em `src/app/api/index.ts`.
- Se `NEXT_PUBLIC_API_URL` aponta para o backend correto.
- Network tab do browser para status HTTP e payload.
- Se o token de autenticacao esta presente (cookie).
- Se React Query stale time expirou e precisa refetch.

## WebSocket nao conecta ou notificacao nao chega

Checar:

- Configuracao Socket.io em `src/lib/socket.ts`.
- `NotificationsProvider` em `src/app/hooks/notifications/`.
- Se o backend (robo-api) esta rodando e aceitando conexoes WebSocket.
- Se o userId esta sendo passado corretamente na autenticacao do socket.

## Login nao funciona ou sessao expira

Checar:

- `src/app/login/page.tsx` (formulario e chamada de API).
- `AuthProvider` em `src/app/hooks/user/auth/`.
- Cookies de autenticacao (js-cookie).
- Resposta do endpoint de login no backend.
- Se `middleware.ts` esta redirecionando corretamente.

## Exportacao Excel falha

Checar:

- `src/app/utils/excelExport.ts`.
- Se os dados estao carregados antes de exportar.
- Se xlsx e file-saver estao importados corretamente.
- Console do browser para erros de memoria ou tipo.

## PDF nao exibe ou viewer quebrado

Checar:

- `src/components/layout/PDFViewer.tsx` e `PdfViewerHeader.tsx`.
- `src/components/process/ProcessDocumentModal.tsx`.
- Se o `temp_link` do documento esta valido (S3 pre-signed URL pode ter expirado).
- Se pdfjs-dist worker esta configurado.

## Kanban nao atualiza ou drag-drop falha

Checar:

- `src/components/KanbanBoard.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`.
- `useChangeStage` hook.
- `@dnd-kit` imports e configuracao.
- Se o backend responde corretamente ao PATCH de stage.
- Se React Query invalida o cache apos mutacao.
