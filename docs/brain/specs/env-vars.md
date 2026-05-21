# Environment Variables

## Variaveis confirmadas no codigo

| Variavel | Arquivo fonte | Client/Server | Descricao |
|----------|--------------|---------------|-----------|
| `NEXT_PUBLIC_API_URL` | `src/app/api/index.ts`, hooks de fetch | Client | URL base da API (axios baseURL) |
| `NEXT_PUBLIC_API_WS` | `src/lib/socket.ts` | Client | URL WebSocket explicita. Fallback: strip `/v1` do `NEXT_PUBLIC_API_URL` |
| `JWT_SECRET_KEY` | `middleware.ts` | Server | Validacao do JWT no middleware do painel |
| `MAINTENANCE_MODE` | `middleware.ts` | Server | Ativa modo manutencao (aceita `"true"` ou `"1"`) |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | `middleware.ts`, `src/app/api/maintenance-status/route.ts` | Build/Server | Flag publica opcional ainda lida no runtime para compatibilidade; o client nao deve ler `process.env` diretamente para maintenance mode |

## next.config.ts

Re-expoe via `env` block apenas as variaveis publicas necessarias ao client, como `NEXT_PUBLIC_API_URL`.

## Notas

- `NEXT_PUBLIC_API_WS` e opcional. Se nao definido, URL do socket e derivado removendo `/v1` do `NEXT_PUBLIC_API_URL`.
- O source of truth client-side para maintenance mode passou a ser `GET /api/maintenance-status`, que le `MAINTENANCE_MODE`/`NEXT_PUBLIC_MAINTENANCE_MODE` no runtime e responde com `Cache-Control: no-store`.
- `NEXT_PUBLIC_API_KEY` nao e mais usado pelos hooks de processo/prompts. A autenticacao dessas mutacoes depende do cookie JWT enviado pelo axios com `withCredentials: true`.
- Sem validacao Zod ou schema de env vars.
- Se nenhuma URL de socket for resolvida, socket fica silenciosamente desabilitado (retorna `null`).
