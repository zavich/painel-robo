export type CnjValidationResult =
  | { isValid: true }
  | { isValid: false; reason: "incomplete" | "invalid_check_digit" };

// Calcula o dígito verificador oficial (CNJ, Resolução 65/2008) via módulo 97,
// usando BigInt para evitar overflow com o número de 18 dígitos.
function calculateCheckDigit(
  sequential: string,
  year: string,
  segment: string,
  court: string,
  origin: string,
): string {
  const base = BigInt(`${sequential}${year}${segment}${court}${origin}00`);
  const remainder = base % BigInt(97);
  return (BigInt(98) - remainder).toString().padStart(2, "0");
}

// Valida um número de processo no padrão CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO),
// distinguindo um número incompleto/mal formatado de um número corretamente
// formatado (dígito verificador confere) que simplesmente não existe na base.
export function validateCnjNumber(value: string): CnjValidationResult {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 20) {
    return { isValid: false, reason: "incomplete" };
  }

  const sequential = digits.slice(0, 7);
  const checkDigit = digits.slice(7, 9);
  const year = digits.slice(9, 13);
  const segment = digits.slice(13, 14);
  const court = digits.slice(14, 16);
  const origin = digits.slice(16, 20);

  const expectedCheckDigit = calculateCheckDigit(sequential, year, segment, court, origin);

  if (expectedCheckDigit !== checkDigit) {
    return { isValid: false, reason: "invalid_check_digit" };
  }

  return { isValid: true };
}
