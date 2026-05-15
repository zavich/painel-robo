# Third-Party Integrations

## PDF Viewer

- **Library**: `react-pdf` v10.1.0 + `pdfjs-dist`
- **Worker URL**: `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs` (CDN)
- **cMapUrl**: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`
- **standardFontDataUrl**: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
- PDF buscado como Blob via `useFetchPDF` → `GET /process/documents/:pdfUrl` (autenticado)
- `URL.createObjectURL(blob)` passado para `<Document file=>`
- Dois modos de renderizacao:
  - Single-page: controle de paginacao
  - All-pages: scroll com indicador de pagina sticky
- Busca com highlight: manipulacao DOM via `data-original-text` em spans. Azul para match atual, amarelo para demais.
- Arquivo: `src/components/shared/PDFViewer.tsx`

## Excel Export

- **Library**: `xlsx` v0.18.5 + `file-saver` v2.0.5
- Output: `.xlsx`, sheet name "Relatório das Analises"
- Colunas: title, number, stage, valueCase, createdAt, hasInstances, hasDocuments, owner
- Filename: `dados-{timestamp}.xlsx`
- Arquivo: `src/app/utils/excelExport.ts`

## Charts (Metricas)

- **Library**: `recharts` v3.6.0
- 4 tipos: bars (BarChart), pie (PieChart), stacked (stacked BarChart), line (LineChart)
- `<ResponsiveContainer width="100%" height="100%">` dentro de container 500px
- Data source: `GET /process/metrics`
- Arquivo: `src/components/MetricsDashboard.tsx`

## DnD Kit

- **Packages**: `@dnd-kit/core` v6.3.1, `@dnd-kit/sortable` v10.0.0
- Usado em `KanbanBoard.tsx` e `KanbanColumn.tsx`
- **Nota**: dashboard principal e uma tabela, NAO drag-and-drop. Componente KanbanBoard existe mas nao e o view ativo.

## Markdown Editor

- **Library**: `@uiw/react-md-editor` v4.0.8 + `marked` v16.3.0 + `turndown` v7.2.2
- Usado em `ActivitiesCard` para edicao de notas (dynamic import, SSR disabled)
- TurndownService converte HTML → Markdown para persistencia

## Word Document Generation

- **Library**: `docx` v9.6.1
- Usado em `/processes/[number]/analysis` page
- Gera documento de analise juridica com header/footer Juri Capital
- Download como `analise-juri-capital.docx`

## Notificacoes UI

- **Library**: `react-toastify`
- Config: `hideProgressBar`, `closeButton=false`
- Montado no `Providers` como ultimo wrapper
