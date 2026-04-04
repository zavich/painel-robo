export function formatarParaReal(value?: number) {
  if (typeof value !== "number") return "";

  return value
    .toFixed(2) // duas casas decimais
    .replace(".", ",") // separador decimal
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // separador de milhar
}
export const removerPrefixoReal = (valor: string) => {
  if (!valor) {
    return "";
  }
  // Remove o prefixo "R$" e os separadores de milhares
  const valorSemPrefixo = valor
    .replace(/^R\$ ?/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  // Retorna o valor formatado para uso com parseFloat
  return valorSemPrefixo;
};
export function capitalizeFirstLetter(str: string) {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.charAt(0)?.toUpperCase() + str.slice(1)?.toLowerCase();
}
