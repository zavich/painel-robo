"use client";

import {
  getStatusColor,
} from "@/app/utils/processSyncStatus";
import { getEsteiraLabel, getStageLabel } from "@/app/utils/processUtils";
import { ProcessInfoCard } from "@/components/process/ProcessInfoCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  FileText,
  Scale,
  User,
} from "lucide-react";
import { ReactNode } from "react";
import { ProcessMetadataField } from "./ProcessMetadataField";
import {
  ProcessDataProps,
  ProcessInfoModalProps,
} from "./processActionDialogs.types";

type Props = {
  processData: ProcessDataProps;
  processInfoModal: ProcessInfoModalProps;
};

export function ProcessInfoDialog({ processData, processInfoModal }: Props) {
  const {
    claimant,
    initialPetitionData,
    isAdmin,
    isRefetching,
    isSyncing,
    process,
    refetchProcess,
  } = processData;

  const metadataFields: Array<{
    content: ReactNode;
    key: string;
    label: ReactNode;
  }> = [
    {
      key: "number",
      label: (
        <>
          <FileText className="h-3.5 w-3.5" />
          Número do Processo
        </>
      ),
      content: (
        <span className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">
          {process?.number || "-"}
        </span>
      ),
    },
  ];

  if (process?.processStatus) {
    const statusColor = getStatusColor(process.processStatus);
    metadataFields.push({
      key: "status",
      label: (
        <>
          <div className={`w-2 h-2 rounded-full ${statusColor.dot}`}></div>
          Status
        </>
      ),
      content: (
        <span className={`text-xs font-medium ${statusColor.text}`}>
          {process.processStatus.name}
        </span>
      ),
    });
  }

  if (process?.stage) {
    metadataFields.push({
      key: "stage",
      label: (
        <>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Etapa
        </>
      ),
      content: (
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {getStageLabel(process.stage)}
        </span>
      ),
    });
  }

  if (process?.stageId) {
    metadataFields.push({
      key: "pipeline",
      label: (
        <>
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Esteira
        </>
      ),
      content: (
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
          {getEsteiraLabel(process.stageId)}
        </span>
      ),
    });
  }

  if (process?.legalNature) {
    metadataFields.push({
      key: "legalNature",
      label: (
        <>
          <Scale className="h-3.5 w-3.5" />
          Natureza Jurídica
        </>
      ),
      content: (
        <span className="text-xs text-gray-900 dark:text-gray-100">
          {process.legalNature}
        </span>
      ),
    });
  }

  if (process?.class) {
    metadataFields.push({
      key: "class",
      label: (
        <>
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          Tipo
        </>
      ),
      content: (
        <span
          className={`text-xs font-medium ${
            process.class === "MAIN"
              ? "text-blue-600 dark:text-blue-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {process.class === "MAIN" ? "Principal" : "Execução Provisória"}
        </span>
      ),
    });
  }

  if (process?.processOwner?.user?.email) {
    metadataFields.push({
      key: "owner",
      label: (
        <>
          <User className="h-4 w-4" />
          Responsável
        </>
      ),
      content: (
        <span className="text-xs text-gray-900 dark:text-gray-100">
          {process.processOwner.user.email}
        </span>
      ),
    });
  }

  return (
    <Dialog open={processInfoModal.open} onOpenChange={processInfoModal.setOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            Informações do Processo
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalhes Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metadataFields.map((field) => (
                <ProcessMetadataField key={field.key} label={field.label}>
                  {field.content}
                </ProcessMetadataField>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Dados Complementares
            </h3>
            <ProcessInfoCard
              process={process ?? undefined}
              claimant={claimant}
              initialPetition={initialPetitionData}
              onProcessUpdate={refetchProcess}
              isAdmin={isAdmin}
              isRefetching={isRefetching}
              isSyncing={isSyncing}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => processInfoModal.setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
