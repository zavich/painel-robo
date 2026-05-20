# WebSocket (Socket.IO Client)

Arquivo: `src/lib/socket.ts`

## Configuracao de conexao

```typescript
io(url, {
  auth: { userId },            // user._id do AuthContext
  withCredentials: true,
  transports: ["websocket"],   // sem fallback para polling (intencional)
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
})
```

## Resolucao de URL

1. Usa `NEXT_PUBLIC_API_WS` se definido
2. Senao: remove sufixo `/v1` do `NEXT_PUBLIC_API_URL`
3. Retorna `null` se nenhuma URL encontrada (socket desabilitado)

## Padrao singleton

- Variavel module-level `socketInstance`
- Reutiliza conexao existente, atualiza `auth` se userId muda
- `connectNotificationsSocket(userId)`: cria ou reutiliza
- `disconnectNotificationsSocket()`: desconecta e anula

## Lifecycle

- Socket criado quando `NotificationsProvider` monta E `isAuthenticated && user._id` e truthy
- Desconectado quando usuario faz logout

## Eventos ouvidos (server → client)

### `notification`

- Upsert no cache React Query `["notifications", "me"]`
- Cap de 100 items
- Payload: `NotificationDoc` completo

### `connect`

- Seta `isConnected: true`

### `disconnect`

- Seta `isConnected: false`

### `connect_error`

- Log warning (deduplicado por mensagem)

## Notas

- DnD kit NAO usa WebSocket
- Atualizacoes de processo usam polling (10s), nao WebSocket
- Socket e usado exclusivamente para notificacoes
