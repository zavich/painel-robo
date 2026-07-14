import {
  formatCpf,
  formatProcessNumber,
  formatarCEP,
  formatarTelefone,
  mascararCNPJ,
  maskCurrencyInput,
  maskRG,
} from "./masks";

describe("masks", () => {
  describe("mascararCNPJ", () => {
    it("aplica mascara em CNPJ completo", () => {
      expect(mascararCNPJ("12345678000199")).toBe("12.345.678/0001-99");
    });

    it("retorna string vazia para entrada falsy", () => {
      expect(mascararCNPJ("")).toBe("");
    });
  });

  describe("formatCpf", () => {
    it("aplica mascara em CPF completo", () => {
      expect(formatCpf("12345678901")).toBe("123.456.789-01");
    });
  });

  describe("formatarTelefone", () => {
    it("aplica mascara em telefone celular", () => {
      expect(formatarTelefone("11999998888")).toBe("(11) 99999-8888");
    });

    it("aplica mascara em telefone fixo", () => {
      expect(formatarTelefone("1133334444")).toBe("(11) 3333-4444");
    });
  });

  describe("formatarCEP", () => {
    it("aplica mascara em CEP completo", () => {
      expect(formatarCEP("01310000")).toBe("01310-000");
    });
  });

  describe("maskRG", () => {
    it("aplica mascara em RG completo", () => {
      expect(maskRG("123456789")).toBe("12.345.678-9");
    });

    it("retorna string vazia para entrada falsy", () => {
      expect(maskRG("")).toBe("");
    });
  });

  describe("formatProcessNumber", () => {
    it("aplica mascara em numero CNJ", () => {
      expect(formatProcessNumber("00000010020245030001")).toBe(
        "0000001-00.2024.5.03.0001",
      );
    });

    it("retorna string vazia para entrada falsy", () => {
      expect(formatProcessNumber("")).toBe("");
    });
  });

  describe("maskCurrencyInput", () => {
    const NBSP = "\u00a0";

    it("formata valor de 1 dígito como centavos", () => {
      expect(maskCurrencyInput("1")).toBe(`R$${NBSP}0,01`);
    });

    it("formata valor de 3 dígitos como reais e centavos", () => {
      expect(maskCurrencyInput("123")).toBe(`R$${NBSP}1,23`);
    });

    it("retorna string vazia para entrada vazia", () => {
      expect(maskCurrencyInput("")).toBe("");
    });

    it("ignora caracteres não numéricos", () => {
      expect(maskCurrencyInput("R$ 1,23")).toBe(`R$${NBSP}1,23`);
    });
  });
});
