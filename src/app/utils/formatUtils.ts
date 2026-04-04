/**
 * Formata um valor numérico para moeda brasileira
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(date: string | Date): string {
  if (!date) return "-";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString("pt-BR");
}

/**
 * Formata uma data com hora para o padrão brasileiro
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return "-";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString("pt-BR");
}