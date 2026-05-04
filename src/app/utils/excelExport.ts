import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Process } from "../interfaces/processes";
import { getProcessTitle } from "./processPartsUtils";
import { capitalizeWords } from "./format";

export const exportToExcel = async (
  data: Process[],
  filename: string = "dados",
  selectedColumns: string[] = [],
) => {
  try {
    // Criar um novo workbook
    const workbook = XLSX.utils.book_new();

    // Helper functions
    const getStageLabel = (stage?: string) => {
      switch (stage) {
        case "PRE_ANALISE":
          return "Pré-Análise";
        case "ANALISE":
          return "Análise";
        case "CALCULO":
          return "Cálculo";
        default:
          return "-";
      }
    };

    const formatCurrency = (value?: number) => {
      if (!value) return "R$ 0,00";
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    const formatDate = (date?: string) => {
      if (!date) return "-";
      try {
        return new Date(date).toLocaleDateString("pt-BR");
      } catch {
        return "-";
      }
    };

    // If no columns selected, export all
    const columnsToExport =
      selectedColumns.length > 0
        ? selectedColumns
        : [
            "title",
            "number",
            "stage",
            "valueCase",
            "createdAt",
            "hasInstances",
            "hasDocuments",
            "owner",
          ];

    // Build column headers mapping
    const columnHeaders: Record<string, string> = {
      title: "Título",
      number: "Número do Processo",
      stage: "Etapa",
      valueCase: "Valor da Causa",
      createdAt: "Data",
      hasInstances: "Instâncias",
      hasDocuments: "Documentos",
      owner: "Responsável",
    };

    // Preparar os dados para exportação - espelhando exatamente a tabela
    const exportData = data.map((item) => {
      const row: Record<string, any> = {};

      columnsToExport.forEach((columnId) => {
        const header = columnHeaders[columnId];

        switch (columnId) {
          case "title":
            const title = capitalizeWords(
              getProcessTitle(
                item.processParts || [],
                item.number,
                item.title || (item as any).formPipedrive?.title,
              ),
            );
            const owner = item.processOwner?.user?.email;
            row[header] = owner ? `${title}\n(${owner})` : title;
            break;

          case "number":
            row[header] = item.number || "-";
            break;

          case "stage":
            row[header] = getStageLabel(item.stage);
            break;

          case "valueCase":
            row[header] = formatCurrency(item.valueCase);
            break;

          case "createdAt":
            row[header] = formatDate(item.createdAt);
            break;

          case "hasInstances":
            row[header] = item.hasInstancias ? "✓" : "-";
            break;

          case "hasDocuments":
            row[header] = item.hasDocuments ? "✓" : "-";
            break;

          case "owner":
            row[header] = item.processOwner?.user?.email || "-";
            break;
        }
      });

      return row;
    });

    // Criar worksheet dos dados principais
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Definir larguras das colunas dinamicamente
    const columnWidths: Record<string, number> = {
      title: 50,
      number: 28,
      stage: 15,
      valueCase: 18,
      createdAt: 15,
      hasInstances: 12,
      hasDocuments: 12,
      owner: 30,
    };

    const colWidths = columnsToExport.map((colId) => ({
      wch: columnWidths[colId] || 20,
    }));

    worksheet["!cols"] = colWidths;
    // Inserir linhas de resumo no início
    XLSX.utils.sheet_add_aoa(worksheet, [], {
      origin: "A1",
    });

    // Ajustar a referência da planilha para incluir as novas linhas
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    range.e.r += 9; // Adicionar 9 linhas para o cabeçalho
    worksheet["!ref"] = XLSX.utils.encode_range(range);

    // Adicionar as planilhas ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório das Analises");

    // Converter para buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    // Criar blob e fazer download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    saveAs(blob, `${filename}-${timestamp}.xlsx`);
  } catch (error) {
    throw error;
  }
};
