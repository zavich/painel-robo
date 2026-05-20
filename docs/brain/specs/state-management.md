# State Management

## Provider Hierarchy

```
QueryClientProvider (TanStack Query, default QueryClient — sem config custom)
  ThemeProvider
    AuthProvider
      NotificationsProvider
        FilterProvider
          ToastContainer (react-toastify, hideProgressBar, closeButton=false)
            children
```

Arquivo: `src/app/providers.tsx`

---

## AuthContext

Arquivo: `src/app/hooks/user/auth/useAuth.tsx`

### Estado

```typescript
user: UserType    // { _id, name, contact, email, isActive, role }
isAuthenticated: boolean
```

### Acoes

- `signIn(data)`: `POST /auth/login` → `GET /auth/me`. Limpa cookies primeiro. Redireciona para `/`.
- `logout()`: `POST /auth/logout`, limpa cookies, redireciona para `/login`.
- On mount: `GET /auth/me` → se falha, limpa cookies e redireciona para `/login`.

### Cookie management

Usa `js-cookie` para `remove("token")` e `remove("refreshToken")` em signIn e logout. Sem logica de refresh no frontend — inteiramente cookie-session.

---

## FilterContext

Arquivo: `src/app/hooks/filter/useFilter.tsx`

### Estado inicial

```typescript
{ limit: 10, status: "all", type: "all", lossReason: "all", contentFilter: "all" }
```

### Estado de reset

```typescript
{
  limit: 10, status: "all", type: "all", search: "",
  startDate: undefined, endDate: undefined,
  stageDateFrom: undefined, stageDateTo: undefined,
  lossReason: "all", contentFilter: "all",
  emptyDocuments: false, emptyInstances: false,
  hasNewMovementsNow: false, hasSecondInstance: false
}
```

### FilterValues (FiltersBar)

```typescript
{
  search?, status?, startDate?, endDate?, lossReason?, contentFilter?,
  emptyDocuments?, emptyInstances?, hasNewMovementsNow?, hasSecondInstance?,
  classProcess?: "all" | "MAIN" | "PROVISIONAL_EXECUTION",
  hasAutos?, hasAcordao?
}
```

- Search: debounce de 500ms
- Status/lossReason/contentFilter/date: trigger API imediato

---

## NotificationsContext

Arquivo: `src/app/hooks/notifications/useNotifications.tsx`

### Estado

```typescript
notifications: NotificationDoc[]   // ate 100, paginado 50 da API
unreadCount: number                // derivado
isConnected: boolean               // status Socket.IO
```

### Query config

- `staleTime: 1000 * 60 * 2` (2 min)
- `refetchOnWindowFocus: false`

---

## ThemeContext

Arquivo: `src/app/hooks/use-theme-client.tsx`

- Valores: `theme: "light" | "dark"`, `toggleTheme()`
- Persistencia: localStorage
- Inline script (`use-theme-script.ts`) previne FOUC

---

## Auto-Refresh / Polling

Arquivo: `src/app/hooks/useProcessAutoRefresh.ts`

### Intervalos

| Estado | Intervalo |
|--------|-----------|
| Normal | 10000ms (10s) |
| Erro | 2000ms (2s) |

### Comportamento

- Poll via `refetch()` do React Query `useProcess`
- Detecta mudancas em `processStatus` (name, log, errorReason)
- `onStatusChange` callback quando status muda
- Troca intervalo dinamicamente baseado em `hasError(processStatus)`
- Controles: `startPolling()`, `stopPolling()`, `forceRefresh()`

### Document detail polling

- Intervalo: 5s
- Para quando `status !== "PROCESSING"` E tem `data` (ou ERROR)
- Continua se `COMPLETED` mas sem `data` ainda
