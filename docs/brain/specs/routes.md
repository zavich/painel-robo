# Routes (App Router)

## Arvore de rotas

```
/                                 → page.tsx (redirect para /dashboard apos 2s)
/login                            → login/page.tsx (publica)
/maintenance                      → maintenance/page.tsx
/not-found                        → not-found.tsx
/health                           → health/route.ts (GET → { ok: true })
/api/maintenance-status           → api/maintenance-status/route.ts (GET → { maintenanceMode: boolean })
/dashboard                        → dashboard/page.tsx (Kanban/table view)
/dashboard/companies              → dashboard/companies/page.tsx
/dashboard/prompts                → dashboard/prompts/page.tsx (admin only no nav)
/dashboard/reason-loss            → dashboard/reason-loss/page.tsx (comentado no nav)
/dashboard/metrics                → dashboard/metrics/page.tsx (comentado no nav)
/processes/[number]               → processes/[number]/page.tsx (detalhe do processo)
/processes/[number]/analysis      → processes/[number]/analysis/page.tsx
/processes/[number]/pre-analysis  → processes/[number]/pre-analysis/page.tsx
/processes/[number]/document/[documentId] → processes/[number]/document/[documentId]/page.tsx
```

## Layout raiz

- `src/app/layout.tsx`: wraps em `Providers` + `MaintenanceBanner`
- Fonts: Geist Sans + Geist Mono
- Title: "Analises Juri Capital"
- Favicon: `/martelo.png`

## Navegacao (MainShell)

Arquivo: `src/components/layout/MainShell.tsx`

| Label | Path | Acesso |
|-------|------|--------|
| Processos | `/dashboard` | Todos |
| Empresas | `/dashboard/companies` | Todos |
| Prompts | `/dashboard/prompts` | `adminOnly: true` |
| Metricas | `/dashboard/metrics` | Comentado |
| Motivos de Recusa | `/dashboard/reason-loss` | Comentado |

## Auth guard

- `middleware.ts` valida o cookie JWT (`prosolutti_accessToken`) server-side com `jose.jwtVerify` nas rotas protegidas.
- Se o token for invalido ou expirado, redireciona para `/login` e limpa o cookie.
- O `AuthProvider` continua chamando `GET /auth/me` para hidratar usuario e permissoes no client.
- **Sem role guard por rota**: paginas admin ainda podem ser acessadas por URL, mas as acoes dependem das permissoes retornadas pelo backend e dos guards do `robo-api`.

## Maintenance mode

- Env vars `MAINTENANCE_MODE` ou `NEXT_PUBLIC_MAINTENANCE_MODE` = `"true"` ou `"1"`
- Quando ativo: todas rotas redirecionam para `/maintenance` (exceto assets estaticos)
- `MaintenanceBanner` sincroniza o estado via `GET /api/maintenance-status` com `cache: "no-store"` e redireciona client-side quando necessario

## Notification routing

Ao clicar notificacao:
- Tipo `ACTIVITY` + `redirectId` → `/processes/${redirectId}?tab=activities`
- Outros tipos + `redirectId` → `/processes/${redirectId}`

## Dashboard

- View principal e uma **tabela paginada** (NAO kanban drag-and-drop)
- `KanbanBoard.tsx` existe como componente mas o dashboard ativo renderiza como tabela
- Limite: 25 por pagina (hardcoded)
- Filtros: search, status, classProcess, startDate, endDate, lossReason, emptyDocuments, emptyInstances, hasNewMovementsNow, hasSecondInstance, hasAutos, hasAcordao

## Mass Edit Panel

- Visivel apenas para admins (`isAdmin` prop)
- Quando `selectAllMode === "all"`: busca TODAS paginas da API (50 por pagina, 100ms delay entre paginas) para coletar todos IDs
- Operacao suportada: criacao massiva de atividades
