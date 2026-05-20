# Environment Variables

## Variaveis confirmadas no codigo

| Variavel | Arquivo fonte | Client/Server | Descricao |
|----------|--------------|---------------|-----------|
| `NEXT_PUBLIC_API_URL` | `src/app/api/index.ts`, hooks de fetch | Client | URL base da API (axios baseURL) |
| `NEXT_PUBLIC_API_WS` | `src/lib/socket.ts` | Client | URL WebSocket explicita. Fallback: strip `/v1` do `NEXT_PUBLIC_API_URL` |
| `NEXT_PUBLIC_API_KEY` | hooks de prompts e reason-loss | Client | Usado como header `x-api-key` em mutacoes fetch-based |
| `NEXT_API_KEY_MASTER` | `next.config.ts` | Server | Exposto via env block, sem uso encontrado em hooks |
| `MAINTENANCE_MODE` | `middleware.ts` | Server | Ativa modo manutencao (aceita `"true"` ou `"1"`) |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | `middleware.ts` | Client | Flag manutencao client-side (aceita `"true"` ou `"1"`) |

## next.config.ts

Re-expoe via `env` block: `NEXT_PUBLIC_API_URL`, `NEXT_API_KEY_MASTER`.

## Notas

- `NEXT_PUBLIC_API_WS` e opcional. Se nao definido, URL do socket e derivado removendo `/v1` do `NEXT_PUBLIC_API_URL`.
- Sem validacao Zod ou schema de env vars.
- Se nenhuma URL de socket for resolvida, socket fica silenciosamente desabilitado (retorna `null`).
