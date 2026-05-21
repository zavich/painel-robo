# Refatoracao painel-robo — Escopo Completo do PR

> **AVISO PARA REVISORES**
>
> Este PR e grande **por design**. O escopo foi definido desde o inicio, baseado em uma auditoria estruturada de 58 achados nos 3 servicos (`scraping-fetch-robo`, `robo-api`, `painel-robo`), documentada em 7 arquivos `MELHORIAS-*.md` na raiz do diretorio pai (`robo_coleta/`).
>
> **Este branch ja passou por 5-6 rodadas de code review profundos** (registradas em `robo_coleta/review/v1-*.md` ate `review/v5-*.md`). Cada rodada identificou ate dezenas de issues, fechou todos os blockers das rodadas anteriores e introduziu um conjunto cada vez menor de novos achados. Saimos de **22 blockers v1 -> 6 blockers v2 -> 1 blocker v3 -> 0 blockers v4 e v5**.
>
> Por causa desse historico, **qualquer review feito a partir de agora deve ser O MAIS APROFUNDADO POSSIVEL**: bugs de superficie ja foram filtrados; o que sobrou ou e nuance dificil de pegar, ou e contexto faltando no review. Tempo gasto em revisao sera bem investido. Reviews superficiais (so olhar o diff sem cruzar com o resto do sistema) provavelmente vao perder o ponto.

---

## Contexto da refatoracao

O `painel-robo` e o frontend Next.js 16 (App Router) do sistema robo. Ele:
- Autentica via cookie httpOnly emitido pelo `robo-api`
- Consome a API do `robo-api` via axios com `withCredentials: true` (alguns hooks legados usam `fetch()` raw, documentado)
- Mostra dashboard de processos (Kanban + lista), pagina de detalhes (`/processes/[number]`), gerencia atividades, prompts, mass edit
- Roda em `*.juri.capital` (subdominio compartilhado com painel principal)

A equipe (Pedro e Rafael) reportou problemas de instabilidade e processos falhando — o painel nao era a causa raiz, mas a auditoria revelou divida significativa em seguranca, performance e arquitetura de componentes.

Do total de 58 achados, **14 sao responsabilidade do `painel-robo`** — concentrados em seguranca (cookies, CSP, RBAC client-side), performance (componentes monoliticos, polling, invalidacao de cache) e arquitetura (hooks gigantes, componentes 1300-1900 linhas).

---

## O que mudou no `painel-robo` neste PR

### Bugs

| ID | Descricao | Arquivos |
|----|-----------|----------|
| BUG-011 | Race condition no `useProcessAutoRefresh` — effect sobrescrevia `lastProcessStatusRef` toda vez que `process.processStatus` mudava, fazendo o polling ler o snapshot ja atualizado e nunca detectar mudancas | `app/hooks/useProcessAutoRefresh.ts` (effect consolidado, ref so reseta em troca de `processId`/`intervalMs`, valor inicial vem do `process.processStatus` no primeiro render) |
| BUG-013 | TanStack Query: `forEach` disparava N invalidacoes paralelas em mass edit (potencial DDoS no proprio backend) | `components/process/MassEditPanel.tsx`, `api/hooks/processes/useInsertExecution.ts` (invalidacao especifica por `processId`, preservando `refetchType: 'none'`) |

### Seguranca

| ID | Descricao | Arquivos |
|----|-----------|----------|
| SEG-003 | `NEXT_PUBLIC_API_KEY` no client bundle | `next.config.ts` (removido), hooks reescritos para usar JWT cookie |
| SEG-011 | Middleware JWT verify (server-side) | `middleware.ts` (`jose.jwtVerify` com `JWT_SECRET_KEY`, redirect para `/login` em falha, limpa cookie em token expirado) |
| SEG-012 | CSP com `'unsafe-inline'` em script-src em producao | `middleware.ts:27-65` (nonce gerado per-request com `crypto.getRandomValues`, `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`; `layout.tsx` async lendo `headers().get('x-nonce')` e injetando no `themeScript`) |
| Maintenance | Modo manutencao via env var | `middleware.ts` (verifica `MAINTENANCE_MODE`/`NEXT_PUBLIC_MAINTENANCE_MODE`, redireciona para `/maintenance` exceto rotas publicas/estaticas) + `src/app/api/maintenance-status/route.ts` / `MaintenanceBanner.tsx` como source of truth runtime no client |
| Path sanitization | Path malicioso via URL | `middleware.ts:87-97` (rejeita `..`, `//`, `<>"'%;()&+` com 400) |
| RBAC | `rolePermissions` hardcoded no client | `hooks/user/auth/useAuth.tsx` (so le `user.permissions` populado pelo backend; `permissions.ts` helper extraido) |
| Login email-only | Decisao do produto: autenticar so por email | `app/login/Form/index.tsx` (removido input de senha, Zod schema sem `password`, `signIn({email})`), `app/interfaces/user.ts` (`SigninRequestType` sem `password`) |

### Performance

| ID | Descricao | Arquivos |
|----|-----------|----------|
| PERF-006 | Componentes 1300-1900 linhas | `ProcessHeader` 1216→675, `ActivitiesCard` 1041→666 |
| PERF-011 | Sem `React.memo` em componentes hot | `memo()` em `ActivityTimelineItem`, `DecisionTimelineItem`, `ProcessActionsDropdown`, `ProcessPartsModal`, `ProcessStatusBadges`, `ProcessTableRow` (renderizado 25x por pagina), etc.; callbacks estabilizados via `setSelectedProcessIds` dispatcher pattern |
| BUG-013 | Invalidacao broad demais | `useInsertExecution`/`MassEditPanel` invalidam `['process', processId]` especifico com `refetchType: 'none'` |
| Polling | `useProcessAutoRefresh` com `enabled: false` (PNL-4) | Reativado com error backoff (`errorIntervalMs`), cleanup de timeout, isMountedRef, callbacks via ref para evitar stale closure |

### Arquitetura

| ID | Descricao | Arquivos |
|----|-----------|----------|
| ARQ-006 | Componentes monoliticos | `processes/[number]/components/` — extracoes: `ProcessInfoDialog`, `ProcessOwnerDialog`, `ProcessProvisionalExecutionDialogs`, `ProcessSidebar`, `ProcessSyncCompleteDialog`, `ProcessTimelineSection`, `ProcessUpdateConfirmationDialog`, `ProcessMetadataField` |
| ARQ-009 | Tipos `any` no frontend | Reducao em fluxos criticos (forms, hooks, services) |
| Hook gigante | `useProcessPageState.ts` (1195 linhas) | Decomposto: `useProcessPageState.ts` (494, orquestrador), `processPageState.utils.ts` (283, helpers puros), `useProcessFormState.ts` (124), `useProcessTitleEditor.ts` (135), `useProcessUpdateMonitor.ts` (214) |
| Types extraidos | `PipedriveFormData` e `InstanceEnum` em componentes React (impedia testar logica pura) | `components/process/PipedriveForm.types.ts` (NOVO), `components/process/TimelineCard.types.ts` (NOVO) |
| Logger wrapper | `console.*` espalhado pelo codigo | `app/lib/logger.ts` (silencia em producao, evita vazar PII em logs do browser) |
| Hook duplicado | `usePrompts` em duas pastas (`process/usePrompts.ts` legacy + `prompts/usePrompts.ts` React Query) | `process/usePrompts.ts` deletado, adapter no `prompts/usePrompts.ts` mantem compatibilidade (`prompts`, `loading`, `error` fields) |
| Middleware duplicado | `src/middleware.ts` e `painel-robo/middleware.ts` ambos existiam | `src/middleware.ts` deletado; so o root continua |

### Infra e deploy

- `.github/workflows/deploy.yml` agora le account ID, regiao, ECR repo, cluster, service, e API URL publica todos de `secrets.*`
- O deploy nao fixa mais `NEXT_PUBLIC_MAINTENANCE_MODE` no build arg; o runtime consulta `/api/maintenance-status`
- O workflow publica `${GITHUB_SHA}` e `latest` de forma atomica com `docker push --all-tags`
- Brain docs (`docs/brain/specs/api-hooks.md`) documenta:
  - Hooks que usam `fetch()` raw em vez de axios `api` (legacy debt reconhecido — `useAddPrompt`, `useEditPrompt`, `useDeletePrompt`, `useFetchPDF`, `useInsertProcess`)
  - Cache keys do React Query
  - Endpoints consumidos por categoria (Auth, Processos, Activities, Documents & Insights, Companies, Pipedrive, Admin, Outros)

---

## Estatisticas do diff (rough)

- **~15 arquivos novos** (componentes extraidos, hooks extraidos, types, brain docs)
- **~30 arquivos modificados** (middleware, layout, useAuth, useProcessAutoRefresh, KanbanDashboard, MassEditPanel, etc.)
- **~5000 linhas adicionadas, ~3000 removidas** (refletindo extracoes em vez de adicao pura)

---

## Como revisar (sugestao)

Por causa do tamanho, sugiro revisao por dominio:

1. **Middleware + CSP** — `middleware.ts`, `app/layout.tsx`. Coracao da seguranca. Confirmar que:
   - Nonce e gerado por request (nao por sessao).
   - `script-src 'nonce-${nonce}' 'strict-dynamic'` esta em prod.
   - `themeScript` (e qualquer outro inline) recebe o nonce.
   - JWT verify roda em rotas protegidas, redireciona para `/login` quando expira.
2. **useAuth** — `app/hooks/user/auth/useAuth.tsx` + `permissions.ts`. RBAC agora depende 100% do backend popular `user.permissions`. `signIn` em caso de erro limpa cookies + estado + chama `/auth/logout`. Login agora aceita so email.
3. **useProcessAutoRefresh** — `app/hooks/useProcessAutoRefresh.ts`. Polling com error backoff, cleanup, ref de callback para evitar stale closure. Confirmar que o effect que sincroniza `lastProcessStatusRef` so dispara em troca de `processId`/`intervalMs` (nao em cada update de `processStatus`).
4. **Decomposicao de `useProcessPageState`** — `processes/[number]/hooks/`. 1195 linhas viraram 5 arquivos. Verificar que a logica de form state, title editing e update monitor esta isolada e que nada caiu no chao.
5. **Decomposicao de `ProcessActionDialogs`** — `processes/[number]/components/`. 697 linhas viraram 7+ componentes pequenos. Confirmar que cada dialog continua sendo controlado pelo state do `useProcessPageState`.
6. **KanbanDashboard + ProcessTableRow** — `app/dashboard/KanbanDashboard/`. `ProcessTableRow` agora memoizado, recebendo `visibleProcessIds: string[]` (estavel) em vez do array de processos completos. Callbacks de setState sao dispatchers (estaveis por design React).
7. **Login form** — `app/login/Form/index.tsx`. So pede email. Validacao Zod sem `password`.
8. **api-hooks** — `app/api/hooks/`. Hooks de mutacao usam `useMutation` com `onSuccess` invalidando o cache key correto (`['process', processId]`). Hooks que ainda usam `fetch()` raw estao documentados.
9. **Brain docs** — `docs/brain/specs/api-hooks.md`. Confirmar que todos os endpoints listados batem com os controllers no `robo-api`.

---

## O que NAO esta neste PR (escopo deferido conscientemente)

- **ARQ-003** Cobertura de testes — harness de Jest + ts-jest agora esta ativo. Ja ha testes unitarios para os helpers extraidos da pagina de processo e para o helper de permissoes do auth client; a base atual cobre logica pura e pode crescer para testes de componente (`.spec.tsx`) organicamente.
- **Migracao dos hooks que usam `fetch()` raw** para o axios `api` — documentado como divida tecnica.
- **SSO com painel principal** — investigacao mostrou JWTs incompativeis entre `juri-api` e `robo-api`; auth do painel-robo continua independente, mas agora simplificada para email-only.

---

## Referencias

- Auditoria original: `robo_coleta/MELHORIAS-*.md` (8 arquivos)
- Code reviews: `robo_coleta/review/v1-*.md` ate `review/v5-*.md` (mais o resumo `00-RESUMO-FINAL.md`)
- Status item-a-item: `robo_coleta/MELHORIAS-STATUS.md`
- Secrets a configurar: `robo_coleta/GITHUB_ACTIONS_SECRETS.md`
