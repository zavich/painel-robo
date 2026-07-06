"use client";

import { DocumentExtract, Movimentacoes, Process } from "@/app/interfaces/processes";
import { ProcessInstanceCard } from "@/components/process/ProcessInstanceCard";
import { TimelineCard } from "@/components/process/TimelineCard";
import { InstanceEnum } from "@/components/process/TimelineCard.types";

type ProcessTimelineSectionProps = {
  activeInstance: "1grau" | "2grau" | "tst";
  documents: DocumentExtract[];
  hasFirstDegreeMovements: boolean;
  hasSecondDegreeMovements: boolean;
  hasThirdInstanceMovements: boolean;
  moviments: Movimentacoes[];
  onDocumentClick: (document: DocumentExtract) => void;
  onMovementClick: (movement: Movimentacoes) => void;
  onViewMovementDocument?: (
    title: string,
    blob: Blob,
    movementId: number,
    texto: string,
  ) => void;
  process: Process | null | undefined;
  setActiveInstance: (instance: "1grau" | "2grau" | "tst") => void;
};

export function ProcessTimelineSection({
  activeInstance,
  documents,
  hasFirstDegreeMovements,
  hasSecondDegreeMovements,
  hasThirdInstanceMovements,
  moviments,
  onDocumentClick,
  onMovementClick,
  onViewMovementDocument,
  process,
  setActiveInstance,
}: ProcessTimelineSectionProps) {
  return (
    <div className="flex flex-col gap-3 transition-all duration-300 min-w-0 lg:col-span-2 order-1">
      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        {hasFirstDegreeMovements && (
          <ProcessInstanceCard
            instance="1grau"
            title="1° Grau"
            processNumber={process?.number}
            onClick={() => setActiveInstance("1grau")}
            isActive={activeInstance === "1grau"}
          />
        )}
        {hasSecondDegreeMovements && (
          <ProcessInstanceCard
            instance="2grau"
            title="2° Grau"
            processNumber={process?.number}
            onClick={() => setActiveInstance("2grau")}
            isActive={activeInstance === "2grau"}
          />
        )}
        {hasThirdInstanceMovements && (
          <ProcessInstanceCard
            instance="tst"
            title="TST"
            processNumber={process?.number}
            onClick={() => setActiveInstance("tst")}
            isActive={activeInstance === "tst"}
          />
        )}
      </div>

      <div className="h-[500px] sm:h-[600px] lg:h-[calc(100vh-255px)]">
        {activeInstance === "1grau" && (
          <TimelineCard
            title="Timeline da 1º Instância"
            moviments={moviments}
            instancia={InstanceEnum.FIRST_INSTANCE}
            processNumber={process?.number}
            onMovementClick={onMovementClick}
            onViewMovementDocument={onViewMovementDocument}
            documents={documents}
            onDocumentClick={onDocumentClick}
          />
        )}

        {activeInstance === "2grau" && (
          <TimelineCard
            title="Timeline da 2º Instância"
            moviments={moviments}
            instancia={InstanceEnum.SECOND_INSTANCE}
            processNumber={process?.number}
            onMovementClick={onMovementClick}
            onViewMovementDocument={onViewMovementDocument}
            documents={documents}
            onDocumentClick={onDocumentClick}
          />
        )}

        {activeInstance === "tst" && (
          <TimelineCard
            title="Timeline do TST"
            moviments={moviments}
            instancia={InstanceEnum.THIRD_INSTANCE}
            processNumber={process?.number}
            onMovementClick={onMovementClick}
            onViewMovementDocument={onViewMovementDocument}
            documents={documents}
            onDocumentClick={onDocumentClick}
          />
        )}
      </div>
    </div>
  );
}
