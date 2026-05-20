# Workflow: Investigacao Progressiva

## Quando usar

Use este workflow quando a task for ampla, a area for pouco conhecida ou nao houver mapa de feature especifico.

## Entradas necessarias

- Descricao da task ou sintoma reportado.
- Area suspeita (pagina, componente, hook) se conhecida.

## Passos

1. Identificar termos-chave da task e buscar no codigo com `rg`.
2. Localizar pontos de entrada: pagina (page.tsx), componente principal ou hook.
3. Seguir dependencias diretas: hooks de API, componentes filhos, contexts, utils.
4. Verificar interfaces em `src/app/interfaces/` para entender o shape dos dados.
5. Verificar se ha mapa de feature existente em `features/`.
6. Se nao houver mapa, avaliar se a area justifica criar um novo.
7. Testar no browser com DevTools aberto (Network, Console, React DevTools).
8. Atualizar o brain se a investigacao revelar conhecimento duravel.

## Arquivos comuns

- `src/app/interfaces/processes.ts`: interfaces centrais.
- `src/app/api/index.ts`: instancia Axios.
- `src/app/providers.tsx`: stack de providers.
- `src/app/hooks/`: contexts de auth, filter, notifications.

## Riscos

- Nao confiar apenas no brain; sempre verificar o codigo atual.
- Interfaces podem ter mudado desde o ultimo scan.
