import { validateCnjNumber } from "./cnjValidation";

describe("validateCnjNumber", () => {
  it("retorna incompleto para número com menos de 20 dígitos", () => {
    const result = validateCnjNumber("0000001-00.2024.5.03.000");
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe("incomplete");
    }
  });

  it("retorna incompleto para string vazia", () => {
    const result = validateCnjNumber("");
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe("incomplete");
    }
  });

  it("retorna dígito verificador inválido para número completo mas com dígito errado", () => {
    // 20 dígitos mas dígito verificador incorreto
    const result = validateCnjNumber("00000010120245030001");
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe("invalid_check_digit");
    }
  });

  it("valida corretamente um número CNJ válido", () => {
    // Número CNJ válido: 0000001-36.2024.5.03.0001
    // sequential=0000001, check=36, year=2024, segment=5, court=03, origin=0001
    const result = validateCnjNumber("00000013620245030001");
    expect(result.isValid).toBe(true);
  });
});
