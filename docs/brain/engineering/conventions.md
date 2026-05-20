# Conventions

Convencoes praticas de implementacao observadas no repositorio.

## Componentes

- Componentes UI base ficam em `src/components/ui/` e usam Radix UI + CVA + Tailwind.
- Componentes de feature ficam em `src/components/process/`, `src/components/layout/`, etc.
- Cada componente e um arquivo `.tsx` com export default ou named.
- `"use client"` obrigatorio em componentes que usam hooks, estado ou browser APIs.

## Naming

- Paginas: `page.tsx` dentro de diretorios do App Router.
- Componentes: PascalCase (`KanbanBoard.tsx`, `ProcessHeader.tsx`).
- Hooks: camelCase com prefixo `use` (`useProcess.ts`, `useChangeStage.ts`).
- Interfaces: PascalCase em `src/app/interfaces/`.
- Utils: camelCase (`excelExport.ts`, `processUtils.ts`).

## Data fetching

- Toda comunicacao com backend via hooks React Query em `src/app/api/hooks/`.
- Hooks usam `useQuery` para leitura e `useMutation` para escrita.
- Instancia Axios centralizada em `src/app/api/index.ts` com `withCredentials: true`.
- Stale time padrao: 10 minutos.
- Invalidacao de cache apos mutacoes com `queryClient.invalidateQueries`.

## Forms

- React Hook Form + Zod resolvers para validacao.
- Schemas Zod para validacao tipada.

## Estilizacao

- Tailwind CSS v4 com CSS variables para temas.
- Dark mode via classe `dark`.
- `cn()` utility (clsx + tailwind-merge) para composicao de classes.
- Icones via lucide-react.

## Imports

- Path alias `@/*` aponta para `./src/*`.
- Imports de componentes UI: `@/components/ui/button`.
- Imports de hooks: `@/app/api/hooks/process/useProcess`.
