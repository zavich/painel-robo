import { getClaimant, getDefendant } from "./processPartsUtils";
import { ProcessPart } from "@/app/interfaces/processes";

const makePart = (overrides: Partial<ProcessPart>): ProcessPart =>
  ({
    id: "",
    tipo: "",
    polo: "ATIVO",
    nome: "",
    principal: false,
    ...overrides,
  }) as ProcessPart;

describe("processPartsUtils", () => {
  // Caso real: o Athena/PJe não preenche `principal` (vem null pra todo
  // mundo), mesmo havendo só um reclamante/reclamado — sem fallback, o
  // título do processo ficava em branco.
  const partesSemPrincipalMarcado: ProcessPart[] = [
    makePart({
      tipo: "ADVOGADO",
      polo: "PASSIVO",
      nome: "JOÃO PAULO DE PAULA KIRSCH",
      principal: null as unknown as boolean,
    }),
    makePart({
      tipo: "ADVOGADO",
      polo: "ATIVO",
      nome: "MAXIMILIANO NAGL GARCEZ",
      principal: null as unknown as boolean,
    }),
    makePart({
      tipo: "EXEQUENTE",
      polo: "ATIVO",
      nome: "SIND TRAB EMP TRAT E DIST AGUA ESGOTO E MEIO AMB C PROC",
      principal: null as unknown as boolean,
    }),
    makePart({
      tipo: "EXECUTADO",
      polo: "PASSIVO",
      nome: "COMPANHIA DE SANEAMENTO DO PARANA SANEPAR",
      principal: null as unknown as boolean,
    }),
  ];

  it("acha o reclamante mesmo sem nenhuma parte com principal marcado", () => {
    expect(getClaimant(partesSemPrincipalMarcado)?.nome).toBe(
      "SIND TRAB EMP TRAT E DIST AGUA ESGOTO E MEIO AMB C PROC",
    );
  });

  it("acha o reclamado mesmo sem nenhuma parte com principal marcado", () => {
    expect(getDefendant(partesSemPrincipalMarcado)?.nome).toBe(
      "COMPANHIA DE SANEAMENTO DO PARANA SANEPAR",
    );
  });

  it("prioriza a parte com principal=true quando existir mais de um candidato", () => {
    const partes: ProcessPart[] = [
      makePart({ tipo: "RECLAMANTE", polo: "ATIVO", nome: "Fulano", principal: false }),
      makePart({ tipo: "RECLAMANTE", polo: "ATIVO", nome: "Fulano Principal", principal: true }),
    ];

    expect(getClaimant(partes)?.nome).toBe("Fulano Principal");
  });

  it("não confunde advogado com a parte principal", () => {
    const partes: ProcessPart[] = [
      makePart({ tipo: "ADVOGADO", polo: "ATIVO", nome: "Advogado", principal: null as unknown as boolean }),
      makePart({ tipo: "AUTOR", polo: "ATIVO", nome: "Autor de Verdade", principal: null as unknown as boolean }),
    ];

    expect(getClaimant(partes)?.nome).toBe("Autor de Verdade");
  });

  it("retorna null quando não há nenhuma parte compatível", () => {
    expect(getClaimant([])).toBeNull();
    expect(getDefendant([])).toBeNull();
  });
});
