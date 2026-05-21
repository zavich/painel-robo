"use client";

import {
  PeticaoInicialData,
  Process,
} from "@/app/interfaces/processes";
import { mascararCNPJ } from "@/app/utils/masks";
import {
  getProcessTitle,
} from "@/app/utils/processPartsUtils";
import { PipedriveFormData } from "@/components/process/PipedriveFormCard";
import { InstanceEnum } from "@/components/process/TimelineCard";

export const EMPTY_FORM_STATE: PipedriveFormData = {
  title: "",
  processNumber: "",
  executionNumber: "",
  duplicated: "",
  dl: "",
  firstDegree: "",
  secondDefendantResponsibility: "",
  defendants: "",
  analysis: "",
  prazo: "",
  abatimento: "",
  observacao: "",
  calculoAutos: "",
  calculoAutosValue: "",
  calculoHomologado: "",
  execucaoProvisoria: "",
  sucumbencia: "",
  freeJustice: "",
  conclusion: "",
  observacaoPreAnalise: "",
  value: "",
};

export function getTrackedProcessTitle(process: Process | null | undefined) {
  return getProcessTitle(
    process?.processParts || [],
    process?.number,
    process?.title || process?.formPipedrive?.title,
    false,
  );
}

export function getInitialPetitionData(
  process: Process | null | undefined,
): PeticaoInicialData | undefined {
  const initialPetition = process?.documents?.find(
    (doc) => doc.title === "Petição Inicial",
  );

  return initialPetition?.data as PeticaoInicialData | undefined;
}

export function buildTrackedProcessSnapshot(process: Process | null | undefined) {
  if (!process) {
    return "";
  }

  return JSON.stringify({
    number: process.number,
    title: process.title,
    synchronizedAt: process.synchronizedAt,
    status: {
      name: process.processStatus?.name,
      log: process.processStatus?.log,
      errorReason: process.processStatus?.errorReason,
      updatedAt: process.processStatus?.updatedAt,
    },
    observation: process.observation?.description,
    formPipedrive: process.formPipedrive
      ? {
          processNumber: process.formPipedrive.processNumber,
          executionNumber: process.formPipedrive.executionNumber,
          observacao: process.formPipedrive.observacao,
          observacaoPreAnalise: process.formPipedrive.observacaoPreAnalise,
          value: process.formPipedrive.value,
        }
      : null,
    documentsCount: process.documents?.length ?? 0,
    movimentsCount: process.moviments?.length ?? 0,
  });
}

function buildCompanySummary(process: Process) {
  return (
    process.companies
      ?.map((company) => {
        const solvencyParts: string[] = [];

        if (typeof company.score === "number") {
          solvencyParts.push(`Score: ${company.score}`);
        }
        if (company.porte) {
          solvencyParts.push(`Porte: ${company.porte}`);
        }
        if (company.registrationStatus) {
          solvencyParts.push(`Registro: ${company.registrationStatus}`);
        }
        if (company.specialRule) {
          solvencyParts.push(`Solvência: ${company.specialRule}`);
        }

        const solvency = solvencyParts.length
          ? ` - ${solvencyParts.join(" | ")}`
          : "";

        return `${company.name} (${mascararCNPJ(company.cnpj)})${solvency}`;
      })
      .join(", ") || ""
  );
}

function buildDefendantsFromParts(process: Process) {
  const defendantParts =
    process.processParts?.filter(
      (part) =>
        part.polo === "PASSIVO" &&
        (part.tipo?.toLowerCase() === "reclamado" ||
          part.tipo?.toLowerCase() === "réu"),
    ) || [];

  const defendantNames = new Set(defendantParts.map((part) => part.nome));

  return Array.from(defendantNames)
    .map((name) => {
      const company = process.companies?.find(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
      );

      if (!company) {
        return name;
      }

      const solvencyParts: string[] = [];

      if (typeof company.score === "number") {
        solvencyParts.push(`Score: ${company.score}`);
      }
      if (company.porte) {
        solvencyParts.push(`Porte: ${company.porte}`);
      }
      if (company.registrationStatus) {
        solvencyParts.push(`Registro: ${company.registrationStatus}`);
      }
      if (company.specialRule) {
        solvencyParts.push(`Solvência: ${company.specialRule}`);
      }

      const solvency = solvencyParts.length
        ? ` - ${solvencyParts.join(" | ")}`
        : "";

      return `${company.name} (${mascararCNPJ(company.cnpj)})${solvency}`;
    })
    .join(", ");
}

export function buildProcessFormState(process: Process): PipedriveFormData {
  const processTitle = getTrackedProcessTitle(process);

  if (process.formPipedrive) {
    return {
      title: processTitle,
      processNumber: process.formPipedrive.processNumber || process.number || "",
      executionNumber:
        process.formPipedrive.executionNumber ||
        process.calledByProvisionalLawsuitNumber ||
        "",
      duplicated: process.formPipedrive.duplicated || "",
      dl: process.formPipedrive.dl || "",
      firstDegree: process.formPipedrive.firstDegree || "",
      secondDefendantResponsibility:
        process.formPipedrive.secondDefendantResponsibility || "",
      defendants: buildCompanySummary(process) || process.formPipedrive.defendants || "",
      analysis: process.formPipedrive.analysis || "",
      prazo: process.parametersStepDeadlineInMonths
        ? process.parametersStepDeadlineInMonths.toString()
        : process.formPipedrive.prazo || "",
      abatimento: process.formPipedrive.abatimento || "",
      observacao:
        process.observation?.description || process.formPipedrive.observacao || "",
      observacaoPreAnalise: process.formPipedrive.observacaoPreAnalise || "",
      calculoAutos: process.formPipedrive.calculoAutos || "",
      calculoAutosValue: process.formPipedrive.calculoAutosValue || "",
      calculoHomologado: process.formPipedrive.calculoHomologado || "",
      execucaoProvisoria: process.formPipedrive.execucaoProvisoria || "",
      sucumbencia: process.formPipedrive.sucumbencia || "",
      freeJustice: process.formPipedrive.freeJustice || "",
      conclusion: process.formPipedrive.conclusion || "",
      value: process.formPipedrive.value || "",
      stageLabel: process.stage,
    };
  }

  return {
    ...EMPTY_FORM_STATE,
    title: processTitle,
    processNumber: process.number || "",
    executionNumber: process.calledByProvisionalLawsuitNumber || "",
    defendants: buildDefendantsFromParts(process),
    prazo: process.parametersStepDeadlineInMonths
      ? process.parametersStepDeadlineInMonths.toString()
      : "",
    observacao: process.observation?.description || "",
    stageLabel: process.stage,
  };
}

export function hasTrackedFormChanges(
  formState: PipedriveFormData,
  process: Process | null | undefined,
) {
  if (!process) {
    return false;
  }

  const expectedTitle = getTrackedProcessTitle(process);

  return (
    formState.title !== expectedTitle ||
    formState.processNumber !==
      (process.formPipedrive?.processNumber || process.number || "") ||
    formState.executionNumber !==
      (process.formPipedrive?.executionNumber ||
        process.calledByProvisionalLawsuitNumber ||
        "") ||
    formState.observacao !==
      (process.observation?.description || process.formPipedrive?.observacao || "")
  );
}

export function getNewMovements(process: Process | null | undefined) {
  if (!process?.moviments) {
    return {
      PRIMEIRO_GRAU: [],
      SEGUNDO_GRAU: [],
      TST: [],
    };
  }

  if (
    !process.oldMoviments ||
    (process.oldMoviments.primeiroGrau === null &&
      process.oldMoviments.segundoGrau === null &&
      process.oldMoviments.tst === null)
  ) {
    return {
      PRIMEIRO_GRAU: [],
      SEGUNDO_GRAU: [],
      TST: [],
    };
  }

  const firstDegreeMovs = process.moviments.filter(
    (movement) => movement.instancia === InstanceEnum.FIRST_INSTANCE,
  );
  const secondDegreeMovs = process.moviments.filter(
    (movement) => movement.instancia === InstanceEnum.SECOND_INSTANCE,
  );
  const tstMovs = process.autosData?.movements || [];

  const countNewFirst =
    process.oldMoviments.primeiroGrau !== null
      ? Math.max(0, firstDegreeMovs.length - process.oldMoviments.primeiroGrau)
      : 0;
  const countNewSecond =
    process.oldMoviments.segundoGrau !== null
      ? Math.max(0, secondDegreeMovs.length - process.oldMoviments.segundoGrau)
      : 0;
  const countNewTst =
    process.oldMoviments.tst !== null
      ? Math.max(0, tstMovs.length - process.oldMoviments.tst)
      : 0;

  return {
    PRIMEIRO_GRAU: firstDegreeMovs.slice(0, countNewFirst),
    SEGUNDO_GRAU: secondDegreeMovs.slice(0, countNewSecond),
    TST: tstMovs.slice(0, countNewTst),
  };
}
