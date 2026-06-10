import { capitalizeWords, formatCurrency, formatDate } from "./format";

describe("format utils", () => {
  describe("capitalizeWords", () => {
    it("retorna string vazia para entrada undefined ou vazia", () => {
      expect(capitalizeWords(undefined)).toBe("");
      expect(capitalizeWords("")).toBe("");
    });

    it("capitaliza a primeira letra de cada palavra", () => {
      expect(capitalizeWords("joao silva")).toBe("Joao Silva");
      expect(capitalizeWords("EMPRESA LTDA")).toBe("Empresa Ltda");
    });
  });

  describe("formatCurrency", () => {
    it("formata como BRL", () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain("1.234,56");
      expect(formatted).toContain("R$");
    });
  });

  describe("formatDate", () => {
    it("formata data ISO no formato pt-BR", () => {
      expect(formatDate("2026-05-21T12:00:00.000Z")).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
