"use client";

import { DocumentExtract, Movimentacoes, Process } from "@/app/interfaces/processes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ProcessInstanceCard } from "@/components/process/ProcessInstanceCard";
import { TimelineCard } from "@/components/process/TimelineCard";
import { InstanceEnum } from "@/components/process/TimelineCard.types";
import { Calendar, TrendingUp } from "lucide-react";

type ProcessTimelineSectionProps = {
  activeInstance: "1grau" | "2grau" | "tst";
  documents: DocumentExtract[];
  hasSecondDegreeMovements: boolean;
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
  hasSecondDegreeMovements,
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
        <ProcessInstanceCard
          instance="1grau"
          title="1° Grau"
          processNumber={process?.number}
          onClick={() => setActiveInstance("1grau")}
          isActive={activeInstance === "1grau"}
        />
        {hasSecondDegreeMovements && (
          <ProcessInstanceCard
            instance="2grau"
            title="2° Grau"
            processNumber={process?.number}
            onClick={() => setActiveInstance("2grau")}
            isActive={activeInstance === "2grau"}
          />
        )}
        {process?.autosData && (
          <ProcessInstanceCard
            instance="tst"
            title="TST"
            processNumber={process.autosData.number}
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

        {activeInstance === "tst" && process?.autosData && (
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-primary">Dados do TST</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 flex-shrink-0">
                <div>
                  <Label className="font-semibold mb-1">Turma</Label>
                  <p>{process.autosData.class ?? "-"}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Relator</Label>
                  <p>{process.autosData.relator ?? "-"}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Ativo</Label>
                  <p>{process.autosData.ativo ?? "-"}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Passivo</Label>
                  <p>{process.autosData.passivo ?? "-"}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">
                    Data Distribuição
                  </Label>
                  <p>{process.autosData.dateOfDistribution ?? "-"}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Data Trânsito</Label>
                  <p>{process.autosData.dateOfTransit ?? "-"}</p>
                </div>
              </div>
              <div className="mt-4 flex-1 flex flex-col min-h-0">
                <Label className="font-semibold mb-2">Movimentações TST</Label>
                {process.autosData.movements?.length ? (
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {process.autosData.movements.map((movement) => (
                      <div
                        key={movement.id}
                        className="border border-border rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm text-muted-foreground">
                            {movement.data}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {movement.conteudo}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p>Nenhuma movimentação registrada no TST.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
