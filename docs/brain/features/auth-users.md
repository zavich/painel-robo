# Feature: Auth & Users

## Quando usar

Use este mapa quando a task envolver login, autenticacao, sessao, roles ou gestao de usuarios.

## Status do mapeamento

- Estado: parcial
- Ultima area investigada: login page e auth context
- Principais lacunas: fluxo de permissoes admin nao detalhado

## Pontos de entrada

- `src/app/login/page.tsx`: pagina de login.
- `src/app/hooks/user/auth/`: AuthProvider e hooks de autenticacao.
- `middleware.ts`: validacao de paths e redirect.

## Arquivos relacionados

- `src/app/api/index.ts`: instancia Axios com `withCredentials: true`.
- `src/app/interfaces/user.ts`: interface User e UserRolesEnum.
- `src/app/providers.tsx`: AuthProvider na stack de providers.

## Fluxo resumido

1. Usuario acessa `/login` e preenche apenas email.
2. Chamada POST para `/v1/auth/login` no backend.
3. O backend responde setando o cookie httpOnly `prosolutti_accessToken`.
4. AuthProvider valida sessao ao carregar a app via `/auth/me`.
5. Middleware verifica o JWT server-side e redireciona se nao autenticado.
6. Logout limpa cookies no backend e redireciona para `/login`.

## Conceitos

- UserRolesEnum: admin, advogado.
- Admin: acesso a prompts, motivos de perda e gestao completa.
- Advogado: acesso ao Kanban, processos e empresas.
- Cookie de autenticacao: httpOnly, emitido e limpo pelo `robo-api`.
- Middleware: valida paths contra traversal e caracteres maliciosos.

## Riscos e cuidados

- Mudanca no middleware afeta todas as rotas.
- Token expirado deve redirecionar para login sem perder estado.
- Roles determinam visibilidade de paginas (prompts, reason-loss sao admin-only).

## Pendencias de mapeamento

- Detalhar guards e verificacao de role em componentes.
