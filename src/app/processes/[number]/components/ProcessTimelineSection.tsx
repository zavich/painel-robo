"use client";

import { Movimentacoes } from "@/app/interfaces/processes";
import { ProcessInstanceCard } from "@/components/process/ProcessInstanceCard";
import { TimelineCard } from "@/components/process/TimelineCard";
import { InstanceEnum } from "@/components/process/TimelineCard.types";

type ProcessTimelineSectionProps = {
  activeInstance: "1grau" | "2grau" | "tst";
  hasFirstDegreeMovements: boolean;
  hasSecondDegreeMovements: boolean;
  hasThirdInstanceMovements: boolean;
  moviments: Movimentacoes[];
  onMovementClick: (movement: Movimentacoes) => void;
  setActiveInstance: (instance: "1grau" | "2grau" | "tst") => void;
};

export function ProcessTimelineSection({
  activeInstance,
  hasFirstDegreeMovements,
  hasSecondDegreeMovements,
  hasThirdInstanceMovements,
  moviments,
  onMovementClick,
  setActiveInstance,
}: ProcessTimelineSectionProps) {
  return (
    <div className="flex flex-col gap-3 transition-all duration-300 min-w-0 lg:col-span-2 order-1">
      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        {hasFirstDegreeMovements && (
          <ProcessInstanceCard
            instance="1grau"
            title="1° Grau"
            onClick={() => setActiveInstance("1grau")}
            isActive={activeInstance === "1grau"}
          />
        )}
        {hasSecondDegreeMovements && (
          <ProcessInstanceCard
            instance="2grau"
            title="2° Grau"
            onClick={() => setActiveInstance("2grau")}
            isActive={activeInstance === "2grau"}
          />
        )}
        {hasThirdInstanceMovements && (
          <ProcessInstanceCard
            instance="tst"
            title="TST"
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
            onMovementClick={onMovementClick}
          />
        )}

        {activeInstance === "2grau" && (
          <TimelineCard
            title="Timeline da 2º Instância"
            moviments={moviments}
            instancia={InstanceEnum.SECOND_INSTANCE}
            onMovementClick={onMovementClick}
          />
        )}

        {activeInstance === "tst" && (
          <TimelineCard
            title="Timeline do TST"
            moviments={moviments}
            instancia={InstanceEnum.THIRD_INSTANCE}
            onMovementClick={onMovementClick}
          />
        )}
      </div>
    </div>
  );
}
