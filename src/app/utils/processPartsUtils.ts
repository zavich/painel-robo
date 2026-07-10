import { ProcessPart } from "@/app/interfaces/processes";

// Keywords para identificar diferentes tipos de partes do processo
export const authorKeywords = [
  "autor",
  "reclamante", 
  "requerente",
  "polo ativo",
  "exequente",
  "agravante",      // Parte que interpõe agravo/recurso
  "apelante",       // Parte que interpõe apelação
  "embargante",     // Parte que interpõe embargos
  "recorrente",     // Parte que interpõe recurso genérico
];

export const reuKeywords = [
  "réu",
  "reclamado",
  "requerido", 
  "polo passivo",
  "executado",
  "agravado",       // Parte contra quem se interpõe agravo
  "apelado",        // Parte contra quem se interpõe apelação
  "embargado",      // Parte contra quem se interpõe embargos
  "recorrido",      // Parte contra quem se interpõe recurso genérico
];

/**
 * Encontra o reclamante principal do processo
 *
 * Prioriza a parte marcada como `principal === true`, mas o Athena/PJe nem
 * sempre preenche esse campo (vem `null` em vários processos reais, mesmo
 * quando só há um reclamante) — sem fallback, isso fazia o título do
 * processo ficar em branco mesmo com a parte presente em `processParts`.
 * Cai pro primeiro reclamante encontrado (por tipo/polo, sem advogados —
 * "advogado" não está em `authorKeywords`) quando nenhuma parte tem
 * `principal` marcado.
 */
export function getClaimant(processParts: ProcessPart[]): ProcessPart | null {
  if (!processParts) return null;
  const candidates = processParts.filter(
    (part) =>
      authorKeywords.includes(part?.tipo?.toLowerCase()) &&
      part.polo === "ATIVO",
  );
  if (candidates.length === 0) return null;
  return candidates.find((part) => part.principal === true) || candidates[0];
}

/**
 * Encontra o réu principal do processo — mesma lógica/fallback de `getClaimant`.
 */
export function getDefendant(processParts: ProcessPart[]): ProcessPart | null {
  if (!processParts) return null;
  const candidates = processParts.filter(
    (part) =>
      reuKeywords.includes(part?.tipo?.toLowerCase()) &&
      part.polo === "PASSIVO",
  );
  if (candidates.length === 0) return null;
  return candidates.find((part) => part.principal === true) || candidates[0];
}

/**
 * Encontra o advogado do reclamante
 */
export function getClaimantAttorney(processParts: ProcessPart[]): ProcessPart | null {
  if (!processParts) return null;
  
  const claimant = processParts.find(
    (part) =>
      authorKeywords.includes(part?.tipo?.toLowerCase()) && part.polo === "ATIVO"
  );
  
  if (!claimant) return null;
  
  return processParts.find(
    (part) =>
      part.tipo === "ADVOGADO" &&
      part.polo === "ATIVO" &&
      part.advogado_de === claimant.id
  ) || null;
}

/**
 * Gera o título do processo baseado nas partes
 * Prioriza título editado sobre título gerado automaticamente
 * Título editado: mantém formato original em CAIXA ALTA (ex: "Nome X Empresa")
 * Título gerado: usa "X" como separador em CAIXA ALTA
 */
export function getProcessTitle(
  processParts: ProcessPart[], 
  processNumber?: string,
  savedTitle?: string,
  fallbackToNumber: boolean = true
): string {
  // 1ª Prioridade: Título salvo/editado pelo usuário
  // Mantém formato original, apenas converte para CAIXA ALTA
  if (savedTitle && savedTitle.trim()) {
    return savedTitle.trim().toUpperCase();
  }
  
  // 2ª Prioridade: Gerar automaticamente pelas partes
  // Usa "X" como separador em CAIXA ALTA
  const claimant = getClaimant(processParts);
  const defendant = getDefendant(processParts);
  
  if (claimant && defendant) {
    return `${claimant.nome.toUpperCase()} X ${defendant.nome.toUpperCase()}`;
  }
  if (claimant) return claimant.nome.toUpperCase();
  if (defendant) return defendant.nome.toUpperCase();
  
  // 3ª Prioridade: Número do processo como fallback (opcional)
  // Se fallbackToNumber=false, retorna vazio quando não há título nem partes
  if (fallbackToNumber) {
    return processNumber || "SEM TÍTULO";
  }
  
  return "";
}