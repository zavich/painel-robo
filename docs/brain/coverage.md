# Brain Coverage

Este arquivo resume a cobertura atual do brain e orienta proximas expansoes.

## Cobertura forte

- Kanban dashboard: paginas, componentes, hooks, drag-and-drop, filtros, esteiras.
- Detalhe de processo: informacoes, documentos, movimentos, atividades, insights.
- Autenticacao: login, roles, sessao, guards no middleware.
- Arquitetura: stack, providers, fluxo de dados, componentes base.

## Cobertura parcial

- Empresas: listagem e detalhe mapeados, mas fluxo de CNDT e score nao detalhado.
- Prompts AI: CRUD basico mapeado, mas integracao com backend Vertex AI nao detalhada.
- Metricas: pagina existe, mas componentes de graficos nao mapeados em detalhe.
- Exportacao Excel: utilitario mapeado, mas fluxo completo nao documentado.

## Lacunas controladas

- Sem suite de testes automatizados; `test-matrix.md` documenta recomendacoes.
- Componentes de propostas/calculadora nao mapeados (criar feature map quando virar foco).
- Integracao detalhada com Socket.io (eventos, handlers) nao documentada por feature.
- Fluxo de modo manutencao documentado apenas no middleware.

## Politica de expansao

Expanda o brain quando houver conhecimento duravel e reutilizavel:

- novo componente com logica de negocio;
- nova pagina ou rota;
- novo hook de API ou contexto;
- bug com causa raiz confirmada;
- decisao de arquitetura ou convencao nova.

Nao expanda para logs temporarios, valores de debug, resultados pontuais ou explicacao linha a linha.
