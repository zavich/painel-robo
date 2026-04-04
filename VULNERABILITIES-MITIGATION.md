# Mitigação de Vulnerabilidades Sem Fix Disponível

Este documento detalha as medidas de mitigação para as vulnerabilidades de alta severidade que não possuem correção disponível no momento.

## 1. pdfjs-dist (via @react-pdf-viewer/core)

### Contexto de Uso
- **Localização**: `src/components/shared/PDFViewer.tsx`, `src/components/process/ProcessDocumentModal.tsx`
- **Função**: Visualização de documentos PDF de processos jurídicos
- **Vulnerabilidade**: Execução arbitrária de JavaScript ao abrir PDFs maliciosos

### Medidas de Mitigação Implementadas/Recomendadas

#### ✅ Validação de Origem dos PDFs
- PDFs são servidos apenas de fontes confiáveis (backend autenticado)
- URLs de PDF são validadas antes do carregamento

#### ⚠️ Medidas Adicionais Recomendadas

1. **Validação de Tipo MIME**
   ```typescript
   // Adicionar validação antes de renderizar PDF
   const validatePdfUrl = async (url: string) => {
     const response = await fetch(url, { method: 'HEAD' });
     const contentType = response.headers.get('content-type');
     if (contentType !== 'application/pdf') {
       throw new Error('Invalid file type');
     }
   };
   ```

2. **Limitação de Tamanho**
   - Implementar limite máximo de tamanho de PDF (ex: 50MB)
   - Rejeitar PDFs muito grandes que podem causar DoS

3. **Sandboxing**
   - Considerar renderização de PDFs em iframe com sandbox
   - Usar Content Security Policy restritiva

4. **Monitoramento**
   - Logar tentativas de carregar PDFs inválidos
   - Alertar sobre PDFs que causam erros de renderização

### Código de Exemplo para Validação

```typescript
// Adicionar em PDFViewer.tsx
const [isValidating, setIsValidating] = useState(true);
const [isValidPdf, setIsValidPdf] = useState(false);

useEffect(() => {
  const validatePdf = async () => {
    try {
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // Validar tipo
      if (contentType !== 'application/pdf') {
        throw new Error('Invalid file type');
      }
      
      // Validar tamanho (50MB máximo)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (contentLength && parseInt(contentLength) > maxSize) {
        throw new Error('File too large');
      }
      
      setIsValidPdf(true);
    } catch (error) {
      console.error('PDF validation failed:', error);
      setIsValidPdf(false);
      // Mostrar mensagem de erro ao usuário
    } finally {
      setIsValidating(false);
    }
  };
  
  if (pdfUrl) {
    validatePdf();
  }
}, [pdfUrl]);
```

## 2. xlsx (SheetJS)

### Contexto de Uso
- **Localização**: `src/app/utils/excelExport.ts`
- **Função**: Exportação de dados de processos para planilhas Excel
- **Vulnerabilidades**: 
  - Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
  - Regular Expression Denial of Service - ReDoS (GHSA-5pgg-2g8v-p4x9)

### Medidas de Mitigação Implementadas/Recomendadas

#### ✅ Uso Atual (Exportação)
- O `xlsx` é usado apenas para **exportação** (criação de arquivos), não para importação
- Dados exportados são gerados internamente pela aplicação
- Não há processamento de arquivos Excel de fontes externas

#### ⚠️ Medidas Adicionais Recomendadas

1. **Validação de Dados de Entrada**
   ```typescript
   // Garantir que dados exportados são seguros
   const sanitizeExportData = (data: Process[]) => {
     return data.map(item => {
       // Remover propriedades que podem causar prototype pollution
       const sanitized = { ...item };
       delete (sanitized as any).__proto__;
       delete (sanitized as any).constructor;
       return sanitized;
     });
   };
   ```

2. **Limitação de Tamanho**
   - Limitar número de processos exportados por vez
   - Implementar paginação para exportações grandes

3. **Timeout de Processamento**
   ```typescript
   const exportWithTimeout = async (data: Process[], filename: string) => {
     return Promise.race([
       exportToExcel(data, filename),
       new Promise((_, reject) => 
         setTimeout(() => reject(new Error('Export timeout')), 30000)
       )
     ]);
   };
   ```

4. **Validação de Nomes de Arquivo**
   - Sanitizar nomes de arquivo para evitar path traversal
   - Limitar caracteres permitidos no nome do arquivo

### Código de Exemplo para Sanitização

```typescript
// Adicionar em excelExport.ts
const sanitizeFilename = (filename: string): string => {
  // Remover caracteres perigosos
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100); // Limitar tamanho
};

const sanitizeCellValue = (value: any): any => {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Converter para string e limitar tamanho
  const str = String(value);
  if (str.length > 10000) {
    return str.substring(0, 10000) + '...';
  }
  
  return str;
};

// Modificar exportToExcel para usar sanitização
export const exportToExcel = async (
  data: Process[],
  filename: string = "dados",
  selectedColumns: string[] = []
) => {
  try {
    // Sanitizar nome do arquivo
    const safeFilename = sanitizeFilename(filename);
    
    // Limitar quantidade de dados
    const maxRows = 10000;
    const limitedData = data.slice(0, maxRows);
    
    // ... resto do código existente com sanitização de valores
    const exportData = limitedData.map((item) => {
      const row: Record<string, any> = {};
      columnsToExport.forEach(columnId => {
        const value = /* obter valor */;
        row[header] = sanitizeCellValue(value);
      });
      return row;
    });
    
    // ... resto do código
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};
```

## 3. Monitoramento e Alertas

### Implementar Logging
```typescript
// Adicionar logging para operações sensíveis
const logPdfAccess = (pdfUrl: string, userId: string) => {
  console.log({
    event: 'pdf_access',
    url: pdfUrl,
    userId,
    timestamp: new Date().toISOString()
  });
};

const logExcelExport = (rowCount: number, userId: string) => {
  console.log({
    event: 'excel_export',
    rowCount,
    userId,
    timestamp: new Date().toISOString()
  });
  
  // Alertar se exportação muito grande
  if (rowCount > 5000) {
    // Enviar alerta para equipe de segurança
  }
};
```

## 4. Checklist de Implementação

- [ ] Adicionar validação de tipo MIME para PDFs
- [ ] Implementar limite de tamanho para PDFs
- [ ] Adicionar sanitização de dados em exportToExcel
- [ ] Implementar timeout para processamento de Excel
- [ ] Adicionar logging de acesso a PDFs e exportações
- [ ] Configurar alertas para operações suspeitas
- [ ] Revisar e testar todas as validações
- [ ] Documentar procedimentos de resposta a incidentes

## 5. Alternativas Futuras

### Para PDFs
- Considerar migrar para `react-pdf` (já presente no projeto) se possível
- Avaliar bibliotecas alternativas como `pdf-lib` para operações server-side
- Considerar processamento server-side com validação rigorosa

### Para Excel
- Avaliar alternativas como `exceljs` quando disponível
- Considerar processamento server-side para importações futuras
- Implementar validação rigorosa se houver necessidade de importação

## 6. Referências

- [pdfjs-dist Advisory](https://github.com/advisories/GHSA-wgrm-67xf-hhpq)
- [xlsx Prototype Pollution](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
- [xlsx ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)

---
**Última atualização**: 26/12/2025
**Versão do documento**: 1.0

