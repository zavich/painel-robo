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

1. Usuario acessa `/login` e preenche email/senha.
2. Formulario com opcao "Lembrar de mim".
3. Chamada POST para `/v1/auth/login` no backend.
4. Token retornado e salvo em cookie via js-cookie.
5. AuthProvider valida sessao ao carregar a app.
6. Middleware verifica paths e redireciona se nao autenticado.
7. Logout limpa cookies e redireciona para `/login`.

## Conceitos

- UserRolesEnum: admin, advogado.
- Admin: acesso a prompts, motivos de perda e gestao completa.
- Advogado: acesso ao Kanban, processos e empresas.
- Cookie de autenticacao: persistido via js-cookie.
- Middleware: valida paths contra traversal e caracteres maliciosos.

## Riscos e cuidados

- Mudanca no middleware afeta todas as rotas.
- Token expirado deve redirecionar para login sem perder estado.
- Roles determinam visibilidade de paginas (prompts, reason-loss sao admin-only).

## Pendencias de mapeamento

- Detalhar guards e verificacao de role em componentes.
- Mapear fluxo de "Lembrar de mim" e persistencia de sessao.
