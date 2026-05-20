# Brain Index

Este e o entrypoint canonico do repositorio para tasks assistidas por LLM.

Sempre leia este arquivo no inicio de uma task. Depois, carregue somente os documentos necessarios para a area investigada.

## Objetivo

O brain existe para reduzir custo de investigacao, evitar redescoberta recorrente e preservar conhecimento operacional sobre features, componentes, hooks, integracao com API e decisoes.

Ele nao substitui o codigo. Ele orienta onde olhar, quais conceitos importam e quais riscos evitar.

## Ordem de leitura

1. Leia `project.md` para entender o contexto geral.
2. Use `task-router.md` quando a task tiver sintoma, area ou palavra-chave clara.
3. Consulte `architecture.md` quando a task envolver estrutura, componentes, providers ou fluxo de dados.
4. Consulte `features/README.md` para localizar mapas de feature existentes.
5. Se a task vier como sintoma visual ou operacional, consulte `debug-index.md`.
6. Leia somente os mapas em `features/` relacionados a task.
7. Consulte `runtime/` quando a task envolver Socket.io ou estado real-time.
8. Consulte `engineering/` quando a task envolver padroes de codigo, componentes ou convencoes.
9. Consulte `decisions/` quando a task tocar uma decisao arquitetural ja registrada.

## Politica de carregamento

- Nao carregar todo o brain por padrao.
- Comecar pelo indice e pelos mapas mais proximos da task.
- Expandir a leitura conforme os imports, componentes, hooks e chamadas de API revelarem necessidade.
- Preferir evidencia local do repositorio a memoria ou suposicao.

## Politica de atualizacao

Atualize o brain quando a investigacao revelar conhecimento duravel, como:

- novo componente ou pagina com logica relevante;
- relacao importante entre hook, componente, provider ou pagina;
- regra de UI que impacta fluxo do usuario;
- risco operacional recorrente;
- decisao estrutural que futuras tasks devem respeitar.

Nao atualize o brain para detalhes efemeros, logs temporarios, valores de debug ou explicacoes linha a linha do codigo.

## Estrutura

- `project.md`: contexto geral, escopo e vocabulario do produto.
- `architecture.md`: visao de alto nivel da arquitetura do repositorio.
- `application-map.md`: indice operacional dos principais modulos, paginas e componentes.
- `coverage.md`: cobertura atual e lacunas controladas.
- `debug-index.md`: indice por sintoma para iniciar debug com poucos arquivos.
- `manifest.json`: indice machine-readable para roteamento por ferramenta ou script.
- `task-router.md`: matriz de termos de task para documentos iniciais.
- `test-matrix.md`: matriz de testes e risco.
- `risk-map.md`: arquivos e areas de maior blast radius.
- `local-setup.md`: setup local para desenvolvimento.
- `features/`: mapas progressivos por feature.
- `workflows/`: roteiros para tarefas recorrentes.
- `decisions/`: registros de decisoes arquiteturais e operacionais.
- `runbooks/`: triagens operacionais curtas.
- `incidents/`: postmortems tecnicos de bugs e incidentes confirmados.
- `templates/`: templates para runbook, incidente e ADR.
- `engineering/`: convencoes praticas de implementacao, componentes e infraestrutura.
- `specs/`: contratos de especificacao (API hooks, data contracts, stages, state, env vars, websocket, routes, third-party).
- `generated/`: inventarios gerados do codigo.
- `CHANGELOG.md`: historico de evolucao do brain.

## Atalhos por tipo de task

- Kanban, esteiras, stages, drag and drop: `features/kanban-dashboard.md`.
- Detalhe de processo, movimentos, documentos, insights: `features/process-detail.md`.
- Login, sessao, roles, permissoes: `features/auth-users.md`.
- Componentes Radix UI, Tailwind, tema: `engineering/conventions.md`.
- API hooks, React Query, Axios: `engineering/infrastructure.md`.
- Socket.io, notificacoes real-time: `specs/websocket.md`.
- Docker, deploy, Traefik: `engineering/infrastructure.md`.
- Endpoints consumidos com shapes: `specs/api-hooks.md`.
- Interfaces TypeScript, enums: `specs/data-contracts.md`.
- StageByCode, esteiras, progressao: `specs/stage-mapping.md`.
- Contexts, React Query cache keys, polling: `specs/state-management.md`.
- Variaveis de ambiente: `specs/env-vars.md`.
- Rotas App Router, auth guard, nav: `specs/routes.md`.
- PDF viewer, Excel, charts, DnD: `specs/third-party.md`.

## Atalhos por sintoma

- Pagina nao carrega ou tela branca: `debug-index.md`.
- Componente nao renderiza ou erro de hydration: `debug-index.md`.
- Chamada API falhando ou dados nao aparecem: `debug-index.md`.
- WebSocket nao conecta ou notificacao nao chega: `debug-index.md`.
- Login nao funciona ou sessao expira: `debug-index.md`.
- Exportacao Excel falha: `debug-index.md`.
- PDF nao exibe ou viewer quebrado: `debug-index.md`.
- Kanban nao atualiza ou drag-drop falha: `debug-index.md`.

## Protocolo de investigacao progressiva

1. Identifique termos da task e busque no codigo com `rg`.
2. Localize pontos de entrada: paginas, componentes, hooks ou providers.
3. Siga dependencias diretas: hooks de API, componentes filhos, contexts e utils.
4. Localize testes existentes da mesma area (se houver).
5. Se houver mapa de feature, compare o mapa com o que foi encontrado.
6. Atualize o mapa apenas com conhecimento confirmado.

## Criterio para criar um novo mapa de feature

Crie um novo arquivo em `features/` quando uma task revelar uma area funcional recorrente que ainda nao tem mapa proprio.

Use `features/_template.md` como base.
