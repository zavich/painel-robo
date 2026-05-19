"use client";

import {
  PeticaoInicialData,
  Process,
  ProcessStatusEnum,
} from "@/app/interfaces/processes";
import {
  getStatusColor,
  getSyncStatusDescription,
  getSyncType,
  hasError,
  isIntermediateStatus,
} from "@/app/utils/processSyncStatus";
import { getEsteiraLabel, getStageLabel } from "@/app/utils/processUtils";
import { ChangeStageDialog } from "@/components/process/ChangeStageDialog";
import { CompanyModalDialog } from "@/components/process/CompanyModalDialog";
import { ProcessInfoCard } from "@/components/process/ProcessInfoCard";
import { SyncOptionsModal } from "@/components/process/SyncOptionsModal";
import { ProcessOwnerSelector } from "@/components/ProcessOwnerSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Calendar,
  Check,
  ClipboardList,
  FileText,
  Link2,
  RefreshCw,
  Scale,
  User,
  XCircle,
} from "lucide-react";

interface ProcessActionDialogsProps {
  // Process data
  process: Process | undefined | null;
  claimant: ReturnType<typeof import("@/app/utils/processPartsUtils").getClaimant>;
  initialPetitionData: PeticaoInicialData | undefined;
  isAdmin: boolean;
  isRefetching: boolean;
  isSyncing: boolean;
  refetchProcess: () => void;

  // Company modal
  isCompanyModalOpen: boolean;
  setIsCompanyModalOpen: (open: boolean) => void;
  selectedCompanyCnpj: string;
  setSelectedCompany: (company: null) => void;

  // Change stage
  showChangeStageDialog: boolean;
  setShowChangeStageDialog: (open: boolean) => void;

  // Update confirmation
  showUpdateConfirmation: boolean;
  setShowUpdateConfirmation: (open: boolean) => void;
  handleAcceptUpdate: () => void;
  handleRejectUpdate: () => void;

  // Sync complete
  showSyncCompleteDialog: boolean;
  setShowSyncCompleteDialog: (open: boolean) => void;

  // Sync options modal
  syncModalOpen: boolean;
  setSyncModalOpen: (open: boolean) => void;
  handleSyncConfirm: (options: { movements: boolean; documents: boolean }) => void;
  runLawsuitsMutationIsPending: boolean;

  // Process info modal
  showProcessInfoModal: boolean;
  setShowProcessInfoModal: (open: boolean) => void;

  // Assign member modal
  showAssignMemberModal: boolean;
  setShowAssignMemberModal: (open: boolean) => void;

  // Remove provisional link
  showRemoveProvisionalLinkConfirm: boolean;
  setShowRemoveProvisionalLinkConfirm: (open: boolean) => void;
  handleConfirmRemoveProvisionalLink: () => void;
  removeProvisionalLawsuitMutationIsPending: boolean;

  // Link provisional execution
  showLinkProvisionalExecutionModal: boolean;
  setShowLinkProvisionalExecutionModal: (open: boolean) => void;
  executionNumberInput: string;
  setExecutionNumberInput: (value: string) => void;
  handleConfirmLinkProvisionalExecution: () => void;
  isInsertExecutionLoading: boolean;
}

export function ProcessActionDialogs({
  process,
  claimant,
  initialPetitionData,
  isAdmin,
  isRefetching,
  isSyncing,
  refetchProcess,

  isCompanyModalOpen,
  setIsCompanyModalOpen,
  selectedCompanyCnpj,
  setSelectedCompany,

  showChangeStageDialog,
  setShowChangeStageDialog,

  showUpdateConfirmation,
  setShowUpdateConfirmation,
  handleAcceptUpdate,
  handleRejectUpdate,

  showSyncCompleteDialog,
  setShowSyncCompleteDialog,

  syncModalOpen,
  setSyncModalOpen,
  handleSyncConfirm,
  runLawsuitsMutationIsPending,

  showProcessInfoModal,
  setShowProcessInfoModal,

  showAssignMemberModal,
  setShowAssignMemberModal,

  showRemoveProvisionalLinkConfirm,
  setShowRemoveProvisionalLinkConfirm,
  handleConfirmRemoveProvisionalLink,
  removeProvisionalLawsuitMutationIsPending,

  showLinkProvisionalExecutionModal,
  setShowLinkProvisionalExecutionModal,
  executionNumberInput,
  setExecutionNumberInput,
  handleConfirmLinkProvisionalExecution,
  isInsertExecutionLoading,
}: ProcessActionDialogsProps) {
  return (
    <>
      <CompanyModalDialog
        cnpj={selectedCompanyCnpj}
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        }}
      />

      {/* Change Stage Dialog - Admin only */}
      {isAdmin && (
        <ChangeStageDialog
          process={process || null}
          open={showChangeStageDialog}
          onOpenChange={setShowChangeStageDialog}
          onSuccess={refetchProcess}
        />
      )}

      {/* Modal de confirmação de atualização de dados */}
      <Dialog
        open={showUpdateConfirmation}
        onOpenChange={setShowUpdateConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Dados Atualizados Disponíveis
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-base">
            <p className="mb-3">
              Novos dados do processo foram detectados e estão disponíveis
              para atualização.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Atenção:</strong> Você possui alterações não salvas no
                formulário. Se aceitar a atualização, suas alterações serão
                perdidas.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleRejectUpdate}>
              Manter Minhas Alterações
            </Button>
            <Button
              variant="default"
              onClick={handleAcceptUpdate}
              className="bg-primary hover:bg-primary-light"
            >
              Atualizar Dados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de sincronização concluída */}
      <Dialog
        open={showSyncCompleteDialog}
        onOpenChange={setShowSyncCompleteDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {hasError(process?.processStatus) ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Erro na Sincronização
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  Sincronização Concluída
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-base">
            {hasError(process?.processStatus) ? (
              <>
                <p className="mb-3">
                  Ocorreu um erro durante a sincronização do processo.
                  Verifique os detalhes abaixo e tente novamente mais tarde.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Processo:</strong> {process?.number}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Status:</strong>{" "}
                    {process?.processStatus?.name || ProcessStatusEnum.ERROR}
                  </div>
                  {process?.processStatus?.errorReason && (
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <strong>Motivo:</strong>{" "}
                      {process.processStatus.errorReason}
                    </div>
                  )}
                  {process?.processStatus?.log && (
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <strong>Log:</strong> {process.processStatus.log}
                    </div>
                  )}
                  {process?.processStatus?.updatedAt && (
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <strong>Data:</strong>{" "}
                      {new Date(
                        process.processStatus.updatedAt,
                      ).toLocaleString("pt-BR")}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  {getSyncStatusDescription(process?.processStatus)}
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>Processo:</strong> {process?.number}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>Status:</strong>{" "}
                    {process?.processStatus?.name ||
                      ProcessStatusEnum.PROCESSED}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>Tipo:</strong>{" "}
                    {getSyncType(process?.processStatus)}
                  </div>
                  {process?.processStatus?.log && (
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <strong>Detalhes:</strong> {process.processStatus.log}
                    </div>
                  )}
                  {process?.synchronizedAt && (
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <strong>Sincronizado em:</strong>{" "}
                      {new Date(process.synchronizedAt).toLocaleString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        },
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3 p-3 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary dark:text-primary-foreground font-medium">
                    {process?.processStatus?.name ===
                    ProcessStatusEnum.EXTRACTION_FINISHED
                      ? "⚠️ Para visualizar os novos documentos, clique em 'Recarregar Dados' abaixo."
                      : "✓ Clique em 'Recarregar Dados' para visualizar as atualizações."}
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSyncCompleteDialog(false)}
            >
              Fechar
            </Button>
            {!hasError(process?.processStatus) &&
              !isIntermediateStatus(process?.processStatus) && (
                <Button
                  variant="default"
                  onClick={() => {
                    setShowSyncCompleteDialog(false);
                    // Recarregar a página completamente para garantir que todos os dados sejam atualizados
                    window.location.reload();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Recarregar Dados
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Opções de Sincronização */}
      <SyncOptionsModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onConfirm={handleSyncConfirm}
        isPending={runLawsuitsMutationIsPending}
      />

      {/* Modal de Informações do Processo */}
      <Dialog
        open={showProcessInfoModal}
        onOpenChange={setShowProcessInfoModal}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Informações do Processo
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Detalhes Gerais do Processo */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalhes Gerais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Número do Processo
                  </Label>
                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">
                      {process?.number || "-"}
                    </span>
                  </div>
                </div>

                {process?.processStatus &&
                  (() => {
                    const statusColor = getStatusColor(process.processStatus);
                    return (
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${statusColor.dot}`}
                          ></div>
                          Status
                        </Label>
                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span
                            className={`text-xs font-medium ${statusColor.text}`}
                          >
                            {process.processStatus.name}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                {process?.stage && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Etapa
                    </Label>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {getStageLabel(process.stage)}
                      </span>
                    </div>
                  </div>
                )}

                {process?.stageId && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Esteira
                    </Label>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {getEsteiraLabel(process.stageId)}
                      </span>
                    </div>
                  </div>
                )}

                {process?.legalNature && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5" />
                      Natureza Jurídica
                    </Label>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-900 dark:text-gray-100">
                        {process.legalNature}
                      </span>
                    </div>
                  </div>
                )}

                {process?.class && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Tipo
                    </Label>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span
                        className={`text-xs font-medium ${
                          process.class === "MAIN"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {process.class === "MAIN"
                          ? "Principal"
                          : "Execução Provisória"}
                      </span>
                    </div>
                  </div>
                )}

                {process?.processOwner?.user?.email && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      Responsável
                    </Label>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-900 dark:text-gray-100">
                        {process.processOwner.user.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Informações Detalhadas (ProcessInfoCard) */}
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
            <Button
              variant="outline"
              onClick={() => setShowProcessInfoModal(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciar Responsável */}
      <Dialog
        open={showAssignMemberModal}
        onOpenChange={setShowAssignMemberModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Atribuir Responsável
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ProcessOwnerSelector
              processId={process?.id ?? ''}
              currentOwnerEmail={process?.processOwner?.user?.email}
              onSuccess={() => {
                refetchProcess();
                setShowAssignMemberModal(false);
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignMemberModal(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação - Remover Vínculo com Execução Provisória */}
      <Dialog
        open={showRemoveProvisionalLinkConfirm}
        onOpenChange={setShowRemoveProvisionalLinkConfirm}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Confirmar Remoção de Vínculo
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              Tem certeza que deseja remover o vínculo com a execução
              provisória?
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Atenção:</strong> Esta ação irá desvincular o processo
                da seguinte execução provisória:
              </p>
              <p className="text-xs font-mono text-amber-900 dark:text-amber-200 mt-2 break-all">
                {process?.calledByProvisionalLawsuitNumber}
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowRemoveProvisionalLinkConfirm(false)}
              disabled={removeProvisionalLawsuitMutationIsPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemoveProvisionalLink}
              disabled={removeProvisionalLawsuitMutationIsPending}
            >
              {removeProvisionalLawsuitMutationIsPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmar Remoção
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Vincular Execução Provisória */}
      <Dialog
        open={showLinkProvisionalExecutionModal}
        onOpenChange={setShowLinkProvisionalExecutionModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-yellow-600" />
              Vincular Execução Provisória
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-base text-gray-700 dark:text-gray-300">
              Insira o número da execução provisória que deseja vincular a
              este processo.
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="execution-number"
                className="text-sm font-semibold text-foreground"
              >
                Número da Execução Provisória
              </Label>
              <Input
                id="execution-number"
                type="text"
                placeholder="Ex: 0000000-00.0000.0.00.0000"
                value={executionNumberInput}
                onChange={(e) => setExecutionNumberInput(e.target.value)}
                className="w-full bg-card text-card-foreground border-border"
                disabled={isInsertExecutionLoading}
              />
            </div>
            <div className="bg-secondary/10 dark:bg-secondary-foreground/10 border border-secondary dark:border-secondary-foreground rounded-lg p-3">
              <p className="text-sm text-secondary dark:text-secondary-foreground">
                <strong>Atenção:</strong> Certifique-se de que o número da
                execução provisória está correto antes de vincular.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkProvisionalExecutionModal(false);
                setExecutionNumberInput("");
              }}
              disabled={isInsertExecutionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmLinkProvisionalExecution}
              disabled={
                isInsertExecutionLoading || !executionNumberInput.trim()
              }
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isInsertExecutionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Vinculando...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Vincular
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
