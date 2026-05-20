# Testing

## Estado atual

O projeto nao possui suite de testes automatizados.

## Recomendacao

- Framework: Vitest (compativel com Next.js) ou Jest.
- Componentes: React Testing Library.
- E2E: Playwright.
- Lint: ESLint ja configurado (`eslint.config.mjs`).

## Prioridades sugeridas

1. Middleware (seguranca e routing).
2. Auth hooks e providers (sessao e token).
3. API hooks (mock Axios, verificar payloads).
4. Componentes Kanban (interacao e estado).
5. Utils de formatacao e exportacao (pure functions).

## Convencoes recomendadas

- Arquivos de teste: `*.spec.tsx` ou `*.test.tsx` junto ao arquivo testado.
- Mocks: diretorio `__mocks__/` ou inline.
- Cobertura minima: focar em areas de risco alto (ver `risk-map.md`).
