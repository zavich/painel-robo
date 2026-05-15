# Test Matrix

## Estado atual

O projeto nao possui suite de testes automatizados. Esta matriz documenta areas criticas e recomendacoes para implementacao futura.

## Recomendacao de setup

- Framework: Vitest ou Jest com React Testing Library.
- E2E: Playwright ou Cypress.
- Lint: ESLint ja configurado.

## Areas criticas para testes

| Area | Arquivos principais | Tipo recomendado | Risco |
|---|---|---|---|
| Auth/Login | `src/app/hooks/user/auth/`, `src/app/login/` | Unit + integration | Alto: seguranca e sessao |
| Kanban/Stages | `src/components/Kanban*.tsx`, `useChangeStage` | Integration | Alto: workflow principal |
| API hooks | `src/app/api/hooks/` | Unit (mock Axios) | Alto: toda comunicacao com backend |
| Filtros | `FiltersBar.tsx`, `FilterProvider` | Unit + integration | Medio: impacta listagem |
| Exportacao Excel | `excelExport.ts` | Unit | Medio: dados corrompidos |
| Formatacao | `masks.ts`, `formatUtils.ts`, `formatar-dinheiro.ts` | Unit | Baixo: regressao visual |
| Middleware | `middleware.ts` | Unit | Alto: seguranca e routing |

## Lacunas

- Nenhum teste existe atualmente.
- Componentes Radix UI dependem de mocks de portal/dialog para testes.
- Hooks de Socket.io precisam de mock de conexao.
