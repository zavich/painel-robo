# API Hooks (Endpoints consumidos)

## Client base

```typescript
// src/app/api/index.ts
const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  responseType: "json",
  withCredentials: true,   // envia cookies em toda requisicao
});
```

As mutacoes autenticadas usam o axios `api` com `withCredentials: true`, entao o painel depende do cookie JWT emitido pelo `robo-api`. O `useBulkUpdateProcesses` mantem prefixo `/v1/` por coerencia com a API versionada.

---

## Auth

| Hook | Metodo | Endpoint | Body/Params | Response |
|------|--------|----------|-------------|----------|
| `useAuth.signIn` | POST | `/auth/login` | `{ email, password }` | sets cookies |
| `useAuth.getMe` | GET | `/auth/me` | - | `UserType` |
| `useAuth.logout` | POST | `/auth/logout` | - | clears cookies |

---

## Processos

| Hook | Metodo | Endpoint | Body/Params | Response |
|------|--------|----------|-------------|----------|
| `useProcesses` | GET | `/process` | `ProcessesParams` (page, limit, search, filters...) | lista paginada |
| `useProcess` | GET | `/process/:numero` | - | `Process` completo |
| `useInsertProcess` (fetch) | POST | `/process` | `{ processes: string[] }` | - |
| `useInsertProcess` (xml) | POST | `/process/upload-xml` | FormData com `file` | - |
| `useInsertExecution` | POST | `/process/:id/insert-execution` | `{ lawsuitExecution, pipedriveFieldValue? }` | invalida `["process"]` e `["processes"]` via React Query |
| `useRemoveProvisionalLawsuit` | DELETE | `/process/:id/remove-provisional-lawsuit-number` | - | - |
| `useChangeStage` | POST | `/process/change-stage` | `{ processId, newStageId: number, reason }` | - |
| `useBulkUpdateProcesses` | POST | `/v1/process/bulk-update` | `{ filters, updates }` | **nota: prefixo /v1/** |
| `useProcessLoss` | POST | `/process/:id/loss` | `{ reason, isCustomReason, rejectionDescription, formPipedrive, activityType, activityDone, activitySubject }` | - |
| `useProcessReopen` | POST | `/process/:id/reopen` | - | - |
| `useAssignProcessOwner` | POST | `/process/:id/assign-owner` | `{ userId }` | - |
| `useUpdateProcessForm` | PATCH | `/process/:number/update` | `{ formPipedrive, title? }` | **nota: usa number, nao _id** |
| `useMarkProcessAsRead` | PATCH | `/process/:id/mark-as-read` | - | - |
| `useAvailableStages` | GET | `/process/stages/available` | - | `AvailableStage[]` |
| `useProcessMetrics` | GET | `/process/metrics` | - | `ProcessMetricsResponse` |
| `useNewMovements` | GET | `/process/:number/movements/new` | - | `NewMovementsResponse` |
| `useNewMovements` (mark) | POST | `/process/:number/movements/mark-viewed?type=&instance=` | query params | - |
| `useMarkMovementsAsViewed` | POST | `/process/:number/movements/mark-viewed?instance=` | - | - |
| `useRunLawsuits` | POST | `/process/run-lawsuits` | `{ lawsuits, movements?, documents? }` | - |
| `useLawsuit` | POST | `/process/run-lawsuit-validation` | `{ number, step }` | - |

---

## Activities

| Hook | Metodo | Endpoint | Body |
|------|--------|----------|------|
| `useCreateActivity` | POST | `/process/:id/activity` | `{ type: ActivityType, assignedTo }` |
| `useCompleteActivity` | PATCH | `/process/:id/activity/completed` | `{ type, notes?, status: "APPROVE"/"LOSS", lossReason? }` |
| `useChangeActivityAssignee` | PATCH | `/process/:id/activity/assigned` | `{ type, assignedTo }` |
| `useUpdateActivityNotes` | PATCH | `/process/:id/activity/notes` | `{ type, notes }` |
| `useCreateMassActivity` | POST | `/process/activity` | `{ type, assignedTo, processes: string[] }` |

---

## Documents & Insights

| Hook | Metodo | Endpoint | Body/Params |
|------|--------|----------|-------------|
| `useExtractInsights` | POST | `/process/run-documents-insights` | `{ number, documents: string[], prompt }` |
| `useRemoveInsights` | DELETE | `/process/:number/documents/:documentId` | - |
| `useDocumentDetails` | GET | `/process/:number/documents/:documentId` | polled cada 5s ate nao-PROCESSING |
| `useFetchPDF` | GET | `/process/documents/:pdfUrl` | raw `fetch()`, retorna Blob |

---

## Companies

| Hook | Metodo | Endpoint | Body/Params |
|------|--------|----------|-------------|
| `useCompanies` | GET | `/company` | `{ page, limit, search, status }` |
| `useCompany` | GET | `/company/:cnpj` | - |
| `useEditCompany` | PUT | `/company/:id` | `{ registrationStatus, specialRule, reason, score, porte }` |
| `useRequestCompanyDocument` | POST | `/company/document?cnpj=&type=` | - |

---

## Pipedrive

| Hook | Metodo | Endpoint | Body |
|------|--------|----------|------|
| `useSendNoteToPipedrive` | POST | `/process/:id/send-note-pipedrive` | `data: any` |
| `useAddPipedriveNote` | POST | `/pipedrive/add-note` | `{ content, dealId? }` |

---

## Admin (prompts, reason-loss) — autenticacao via cookie JWT

| Hook | Metodo | Endpoint | Body |
|------|--------|----------|------|
| `usePrompts` | GET | `/prompts` | `{ page, limit, search }` |
| `useAddPrompt` | POST | `/prompts` | `{ type, text }` |
| `useEditPrompt` | PUT | `/prompts/:id` | `{ type, text }` |
| `useDeletePrompt` | DELETE | `/prompts/:id` | - |
| `useReasonLoss` | GET | `/reason-loss` | `{ page, limit, search }` |
| `useAddReasonLoss` | POST | `/reason-loss` | `{ key, label }` |
| `useEditReasonLoss` | PATCH | `/reason-loss/:id` | `{ key, label }` |
| `useDeleteReasonLoss` | DELETE | `/reason-loss/:id` | - |

---

## Outros

| Hook | Metodo | Endpoint | Params |
|------|--------|----------|--------|
| `useAssignableUsers` | GET | `/users` | - |
| `useRejectionReasons` | GET | `/reason-loss` | flat array → `{ key, label }[]` |
| `useSteps` | GET | `/steps` | `{ page, limit, search, status }` |
| Notifications | GET | `/notifications/me` | `{ page: 1, limit: 50 }` |
| Notifications | PATCH | `/notifications/:id/read` | - |
| Notifications | DELETE | `/notifications` | `{ ids: string[] }` |
| `useCreateObservation` | POST | `/observations` | `{ description, processId }` |
| `useDeleteObservation` | DELETE | `/observations/:id` | - |

---

## React Query Cache Keys

| Query Key | Hook | staleTime |
|-----------|------|-----------|
| `["processes", JSON.stringify(params)]` | `useProcesses` | default |
| `["process", numero]` | `useProcess` | 10 min |
| `["available-stages"]` | `useAvailableStages` | default |
| `["rejection-reasons"]` | `useRejectionReasons` | default |
| `["process-metrics"]` | `useProcessMetrics` | default |
| `["newMovements", processNumber]` | `useNewMovements` | default |
| `["notifications", "me"]` | `useNotifications` | 2 min |
| `["assignable-users"]` | `useAssignableUsers` | default |
| `["companies", params]` | `useCompanies` | default |
| `["company", cnpj]` | `useCompany` | default |
| `["prompts", params]` | `usePrompts` | default |
| `["reason-loss", params]` | `useReasonLoss` | default |
| `["steps", params]` | `useSteps` | default |

## Observacoes de implementacao

- O hook legacy `src/app/api/hooks/process/usePrompts.ts` foi removido. O source of truth agora e apenas `src/app/api/hooks/prompts/usePrompts.ts`.
- `usePrompts` retorna compatibilidade com consumidores antigos (`prompts`, `loading`, `error`) e o resultado completo do React Query.
- `useAddPrompt`, `useEditPrompt` e `useDeletePrompt` ainda usam `fetch()` raw com `credentials: "include"`. Isso e intencional por ora e difere do axios `api`.
