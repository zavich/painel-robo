# Risk Map

Mapa de arquivos com maior blast radius.

| Area | Arquivos | Risco | Antes de alterar |
|---|---|---|---|
| Middleware | `middleware.ts` | Alto: seguranca, routing e manutencao | Ler `debug-index.md`; testar paths maliciosos |
| Providers | `src/app/providers.tsx` | Alto: toda a app depende da stack de providers | Ler `architecture.md`; verificar ordem |
| Auth context | `src/app/hooks/user/auth/` | Alto: sessao, token, redirect | Ler `features/auth-users.md` |
| API client | `src/app/api/index.ts` | Alto: toda comunicacao com backend | Ler `engineering/infrastructure.md` |
| Kanban board | `src/components/KanbanBoard.tsx` | Alto: fluxo principal de trabalho | Ler `features/kanban-dashboard.md` |
| Process hooks | `src/app/api/hooks/process/` | Alto: 25+ hooks de mutacao/query | Ler `application-map.md` |
| Interfaces | `src/app/interfaces/processes.ts` | Alto: tipos usados em toda a app | Ler `architecture.md` |
| Layout/Shell | `src/components/layout/MainShell.tsx` | Medio: navegacao e sidebar | Ler `architecture.md` |
| Socket.io | `src/lib/socket.ts` | Medio: notificacoes real-time | Ler `engineering/infrastructure.md` |

## Politica

- Se o arquivo estiver neste mapa, a task deve explicar quais verificacoes foram feitas.
- Mudancas nestes arquivos devem atualizar feature map ou workflow quando revelarem comportamento duravel.
