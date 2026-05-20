# Stage Mapping

## StageByCode (Pipedrive stageId → stage interno)

```typescript
const StageByCode = {
  781: "PRE_ANALISE",   // Reclamantes Outbound
  779: "PRE_ANALISE",   // Reclamantes Inbound
  777: "PRE_ANALISE",   // Ticket Alto
  802: "PRE_ANALISE",   // Advogados Parceiros
  769: "ANALISE",       // Reclamantes Outbound
  762: "ANALISE",       // Reclamantes Inbound
  755: "ANALISE",       // Ticket Alto
  787: "ANALISE",       // Advogados Parceiros
  770: "CALCULO",       // Reclamantes Outbound
  763: "CALCULO",       // Reclamantes Inbound
  756: "CALCULO",       // Ticket Alto
  797: "CALCULO",       // Advogados Parceiros
  849: "CALCULO",       // Advogados Parceiros (segundo ID)
}
```

---

## Esteiras

4 esteiras (pipelines tracks):

1. **Reclamantes Outbound**
2. **Reclamantes Inbound**
3. **Ticket Alto**
4. **Advogados Parceiros**

---

## NextStageIdByEsteira (progressao de stage por esteira)

```typescript
const NextStageIdByEsteira = {
  "Reclamantes Outbound": { PRE_ANALISE: 781, ANALISE: 769, CALCULO: 770 },
  "Reclamantes Inbound":  { PRE_ANALISE: 779, ANALISE: 762, CALCULO: 763 },
  "Ticket Alto":          { PRE_ANALISE: 777, ANALISE: 755, CALCULO: 756 },
  "Advogados Parceiros":  { PRE_ANALISE: 802, ANALISE: 787, CALCULO: 797 },
}
```

---

## Transicoes de stage

### Regras de sincronizacao

- `canSynchronize()`: bloqueia re-sync se ultimo `synchronizedAt` foi ha menos de 30 minutos
- `canSync()`: permite re-sync mesmo dentro dos 30 min se `processStatus.name === "Error"`

### ChangeStageDialog fallback

Se API de stages falha, usa mock:
```typescript
[
  { key: 'PRE_ANALISE', order: 1 },
  { key: 'ANALISE', order: 2 },
  { key: 'CALCULO', order: 3 }
]
```

---

## Status de processamento (processSyncStatus.ts)

### isProcessing()

```
"Processando"
"PROCESSING_WITH_MOVIMENTS"
"PROCESSING_WITH_DOCUMENTS"
"PROCESS_WAITING_EXTRACTION_DOCUMENTS"
```

### isIntermediateStatus()

```
"Extração de movimentações Finalizada"
```

### isSyncCompleted()

```
"Success"
"Processado"
"Extração finalizada"
"EXTRACTION_DOCUMENTS_FINISHED"
```

### hasError()

```
"Error"
```
