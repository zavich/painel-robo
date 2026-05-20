# Task Router

Use este roteador apos ler `INDEX.md` para carregar o menor conjunto inicial de contexto.

## Sintomas visuais e operacionais

| Termos da task | Ler primeiro | Depois carregar |
|---|---|---|
| `kanban`, `board`, `drag`, `stage`, `esteira` | `features/kanban-dashboard.md` | `engineering/conventions.md` |
| `processo`, `detalhe`, `number`, `partes` | `features/process-detail.md` | `features/kanban-dashboard.md` |
| `documento`, `PDF`, `viewer`, `insight`, `extracao` | `features/process-detail.md` | `engineering/infrastructure.md` |
| `login`, `auth`, `sessao`, `role`, `permissao` | `features/auth-users.md` | `engineering/infrastructure.md` |
| `empresa`, `company`, `CNPJ`, `solvente` | `application-map.md` | `features/auth-users.md` |
| `notificacao`, `socket`, `real-time`, `websocket` | `engineering/infrastructure.md` | `debug-index.md` |
| `exportar`, `excel`, `xlsx`, `download` | `application-map.md` | `debug-index.md` |
| `filtro`, `busca`, `paginacao` | `features/kanban-dashboard.md` | `application-map.md` |
| `componente`, `Radix`, `Tailwind`, `tema`, `dark` | `engineering/conventions.md` | `architecture.md` |
| `metrica`, `grafico`, `recharts` | `application-map.md` | `engineering/conventions.md` |
| `prompt`, `AI`, `Gemini` | `application-map.md` | `features/process-detail.md` |
| `Docker`, `deploy`, `Traefik`, `build` | `engineering/infrastructure.md` | `architecture.md` |
| `atividade`, `activity`, `note`, `Pipedrive` | `features/process-detail.md` | `application-map.md` |

## Mudancas de comportamento

| Mudanca | Ler primeiro | Testes provaveis |
|---|---|---|
| Novo componente UI | `engineering/conventions.md` | Verificar rendering e acessibilidade |
| Nova pagina | `architecture.md` | Verificar routing e providers |
| Novo hook de API | `engineering/infrastructure.md` | Verificar cache e invalidacao |
| Mudanca em filtros | `features/kanban-dashboard.md` | Verificar parametros de query |
| Mudanca em auth | `features/auth-users.md` | Verificar guards e cookies |

## Quando nao houver rota clara

Use `workflows/investigacao-progressiva.md` e crie um mapa em `features/` se a area tiver componente e logica de negocio propria.
