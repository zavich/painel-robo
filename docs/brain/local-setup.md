# Brain Local Setup

Guia local para usar o brain e desenvolver no painel-robo.

## Setup basico

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis de ambiente:

```bash
export NEXT_PUBLIC_API_URL="http://localhost:8080"
```

3. Rode o servidor de desenvolvimento:

```bash
npm run dev
```

O app estara disponivel em `http://localhost:3000`.

## Docker

Para rodar via Docker:

```bash
docker compose up --build
```

O Docker build usa multi-stage com Node 22-Alpine. O app roda na porta 3000.

## Variaveis de ambiente

| Variavel | Descricao | Obrigatoria |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL do backend (robo-api) | Sim |
| `NEXT_API_KEY_MASTER` | API key master | Nao |
| `MAINTENANCE_MODE` | Ativa modo manutencao | Nao |

## Rotina por task

1. Leia `docs/brain/INDEX.md`.
2. Identifique a area da task no `task-router.md`.
3. Abra os mapas de feature relevantes.
4. Investigue o codigo real com `rg`, imports e componentes proximos.
5. Atualize o brain se o conhecimento for reutilizavel.

## Regras locais

- Nao salvar segredos em `docs/brain/`.
- Nao colocar payloads sensiveis em postmortems.
