import { InstanceEnum } from "@/components/process/TimelineCard.types";
import {
  buildProcessFormState,
  buildTrackedProcessSnapshot,
  getNewMovements,
  hasTrackedFormChanges,
} from "./processPageState.utils";

describe("processPageState.utils", () => {
  it("gera snapshot estavel com os campos rastreados", () => {
    const snapshot = buildTrackedProcessSnapshot({
      number: "0000000-00.0000.0.00.0000",
      title: "Processo teste",
      synchronizedAt: "2026-05-21T12:00:00.000Z",
      processStatus: {
        name: "SYNCING",
        log: "Rodando",
        errorReason: undefined,
        updatedAt: "2026-05-21T12:01:00.000Z",
      },
      observation: { description: "Observacao" },
      formPipedrive: {
        processNumber: "123",
        executionNumber: "456",
        observacao: "Obs",
        observacaoPreAnalise: "Pre",
        value: "1000",
      },
      documents: [{ _id: "1" }],
      moviments: [{ id: "1" }],
    } as any);

    expect(snapshot).toContain('"number":"0000000-00.0000.0.00.0000"');
    expect(snapshot).toContain('"documentsCount":1');
    expect(snapshot).toContain('"movimentsCount":1');
  });

  it("monta estado inicial do formulario priorizando dados sincronizados", () => {
    const formState = buildProcessFormState({
      number: "0000000-00.0000.0.00.0000",
      title: "Titulo salvo",
      stage: "ANALISE",
      calledByProvisionalLawsuitNumber: "1111111-11.1111.1.11.1111",
      parametersStepDeadlineInMonths: 6,
      companies: [
        {
          name: "Empresa A",
          cnpj: "12345678000199",
          score: 88,
          porte: "ME",
          registrationStatus: "ATIVA",
          specialRule: "BAIXO RISCO",
        },
      ],
      observation: { description: "Observacao local" },
      formPipedrive: {
        processNumber: "numero-pipedrive",
        executionNumber: "",
        duplicated: "nao",
        dl: "",
        firstDegree: "",
        secondDefendantResponsibility: "",
        defendants: "",
        analysis: "Analise",
        prazo: "",
        abatimento: "",
        observacao: "",
        observacaoPreAnalise: "",
        calculoAutos: "",
        calculoAutosValue: "",
        calculoHomologado: "",
        execucaoProvisoria: "",
        sucumbencia: "",
        freeJustice: "",
        conclusion: "",
        value: "",
      },
    } as any);

    expect(formState.processNumber).toBe("numero-pipedrive");
    expect(formState.executionNumber).toBe("1111111-11.1111.1.11.1111");
    expect(formState.prazo).toBe("6");
    expect(formState.observacao).toBe("Observacao local");
    expect(formState.defendants).toContain("Empresa A");
    expect(formState.defendants).toContain("12.345.678/0001-99");
  });

  it("detecta alteracoes rastreadas no formulario", () => {
    const process = {
      number: "0000000-00.0000.0.00.0000",
      title: "Titulo original",
      formPipedrive: {
        processNumber: "numero-pipedrive",
        executionNumber: "exec-pipedrive",
        observacao: "Obs",
      },
      observation: { description: "Obs" },
      processParts: [],
    } as any;

    expect(
      hasTrackedFormChanges(
        {
          title: "Titulo alterado",
          processNumber: "numero-pipedrive",
          executionNumber: "exec-pipedrive",
          observacao: "Obs",
        } as any,
        process,
      ),
    ).toBe(true);
  });

  it("retorna apenas os novos movimentos por instancia", () => {
    const result = getNewMovements({
      moviments: [
        { id: "1", instancia: InstanceEnum.FIRST_INSTANCE, data: "1", conteudo: "A" },
        { id: "2", instancia: InstanceEnum.FIRST_INSTANCE, data: "2", conteudo: "B" },
        { id: "3", instancia: InstanceEnum.SECOND_INSTANCE, data: "3", conteudo: "C" },
      ],
      oldMoviments: {
        primeiroGrau: 1,
        segundoGrau: 0,
        tst: 0,
      },
      autosData: {
        movements: [{ id: "4", data: "4", conteudo: "D" }],
      },
    } as any);

    expect(result.PRIMEIRO_GRAU).toHaveLength(1);
    expect(result.PRIMEIRO_GRAU[0]?.id).toBe("1");
    expect(result.SEGUNDO_GRAU).toHaveLength(1);
    expect(result.TST).toHaveLength(1);
  });
});
