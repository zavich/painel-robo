# Infrastructure

Infraestrutura e servicos do painel-robo.

## Next.js App Router

- Versao: 16.0.0.
- App Router com `src/app/` como diretorio de paginas.
- Turbopack habilitado em desenvolvimento (`npm run dev`).
- Middleware em `middleware.ts` para seguranca e manutencao.

## API Client (Axios)

- Instancia centralizada em `src/app/api/index.ts`.
- Base URL: `NEXT_PUBLIC_API_URL`.
- `withCredentials: true` para enviar cookies.
- Todos os hooks React Query usam esta instancia.

## React Query

- Configuracao em `src/lib/queryClients.ts`.
- Stale time padrao: 10 minutos.
- Cache automatico e invalidacao apos mutacoes.

## Socket.io

- Configuracao em `src/lib/socket.ts`.
- Conecta ao backend (robo-api) para notificacoes real-time.
- Auth via userId no handshake.
- Eventos: notification (novos movimentos, atividades, sistema).

## Docker

- Dockerfile multi-stage com Node 22-Alpine.
- Build stage: `npm ci` + `npm run build`.
- Production stage: apenas dependencias de producao + `.next` + `public`.
- Porta exposta: 3000.

## Traefik

- Reverse proxy para roteamento.
- Producao: analisesprosolutti.com
- Staging: teste.analisesprosolutti.com
- Rede externa: traefik-net.

## Seguranca

- Headers de seguranca em `next.config.ts` (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).
- Middleware valida paths contra traversal (`..`, `//`) e caracteres maliciosos.
- React2Shell (CVE-2025-55182) mitigado com Next.js 16 e React 19.
- Vulnerabilidades conhecidas em pdfjs-dist e xlsx documentadas em SECURITY.md e VULNERABILITIES-MITIGATION.md.

## Variaveis de ambiente

| Variavel | Tipo | Descricao |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | public | URL do backend |
| `NEXT_API_KEY_MASTER` | server | API key master |
| `MAINTENANCE_MODE` | server | Ativa modo manutencao |
