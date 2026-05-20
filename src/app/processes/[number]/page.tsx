"use client";

import { Process } from "@/app/interfaces/processes";
import {
  canSync,
} from "@/app/utils/processSyncStatus";
import { MainShell } from "@/components/layout/MainShell";
import {
  DocumentsCardSkeleton,
  ProcessHeaderSkeleton,
  TimelineCardSkeleton,
} from "@/components/Loading";
import { ActivitiesCard } from "@/components/process/ActivitiesCard";
import { DocumentsCard } from "@/components/process/DocumentsCard";
import { ProcessHeader } from "@/components/process/ProcessHeader";
import { ProcessInstanceCard } from "@/components/process/ProcessInstanceCard";
import { InstanceEnum, TimelineCard } from "@/components/process/TimelineCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { ProcessActionDialogs } from "./components/ProcessActionDialogs";
import { useProcessPageState } from "./hooks/useProcessPageState";

export default function ProcessDetailsEditPage() {
  const {
    router,
    isAdmin,
    process,
    isLoading,
    error,
    refetchProcess,
    isRefetching,
    isProcessError,
    newMovements,
    hasSecondDegreeMovements,
    claimant,
    initialPetitionData,
    selectedCompany,
    isCompanyModalOpen,
    setIsCompanyModalOpen,
    setSelectedCompany,
    showChangeStageDialog,
    setShowChangeStageDialog,
    showUpdateConfirmation,
    setShowUpdateConfirmation,
    isSyncing,
    showSyncCompleteDialog,
    setShowSyncCompleteDialog,
    syncModalOpen,
    setSyncModalOpen,
    selectedDocumentId,
    activeRightTab,
    setActiveRightTab,
    activeInstance,
    setActiveInstance,
    showProcessInfoModal,
    setShowProcessInfoModal,
    showAssignMemberModal,
    setShowAssignMemberModal,
    showRemoveProvisionalLinkConfirm,
    setShowRemoveProvisionalLinkConfirm,
    showLinkProvisionalExecutionModal,
    setShowLinkProvisionalExecutionModal,
    linkedDocuments,
    executionNumberInput,
    setExecutionNumberInput,
    isEditingTitle,
    editedClaimant,
    editedDefendant,
    claimantInputRef,
    defendantInputRef,
    updateProcessFormMutation,
    runLawsuitsMutation,
    removeProvisionalLawsuitMutation,
    markMovementsAsViewedMutation,
    isInsertExecutionLoading,
    processReopenPending,
    handleMarkAsViewed,
    handleCompanyClick,
    handleDocumentClick,
    handleMovementClick,
    handleReopen,
    handleRemoveProvisionalLink,
    handleConfirmRemoveProvisionalLink,
    handleLinkProvisionalExecution,
    handleConfirmLinkProvisionalExecution,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleClaimantChange,
    handleDefendantChange,
    handleSaveTitle,
    handleSyncConfirm,
    handleAcceptUpdate,
    handleRejectUpdate,
  } = useProcessPageState();

  if (isLoading) {
    return (
      <MainShell>
        <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <ProcessHeaderSkeleton />
          <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 overflow-y-auto flex flex-col min-h-0">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 transition-all duration-300 min-w-0 lg:grid-cols-6 flex-1 overflow-hidden items-start">
              {/* Left column - Instance tabs and Timeline */}
              <div className="flex flex-col gap-3 transition-all duration-300 min-w-0 lg:col-span-2 h-full">
                {/* Instance Selection Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-shrink-0">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse border-2 border-blue-500 dark:border-blue-400"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                </div>

                {/* Timeline Card Skeleton */}
                <div className="h-[calc(100vh-320px)]">
                  <TimelineCardSkeleton />
                </div>
              </div>

              {/* Right column - Document Viewer */}
              <div className="lg:col-span-4 h-[calc(100vh-267px)]">
                <DocumentsCardSkeleton />
              </div>
            </div>
          </main>
        </div>
      </MainShell>
    );
  }

  if (isProcessError) {
    return (
      <MainShell>
        <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Card className="w-96 text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Processo não encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {error
                  ? "Ocorreu um erro ao carregar os dados do processo."
                  : "Os dados do processo estão incompletos ou corrompidos."}
                <br />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tente novamente mais tarde ou verifique o número informado.
                </span>
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl px-6 py-3 font-medium transition-colors"
                >
                  Voltar ao Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-6 py-3 font-medium transition-colors"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainShell>
    );
  }

  return (
    <MainShell>
      <div className="flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ProcessHeader
          process={process as Process}
          onReopen={handleReopen}
          isPending={processReopenPending}
          isRefetching={isRefetching}
          isSyncing={isSyncing}
          onCompanyClick={handleCompanyClick}
          onViewPreAnalysis={() => {
            window.open(`/processes/${process?.number}/pre-analysis`, "_blank");
          }}
          onViewAnalysis={() => {
            window.open(`/processes/${process?.number}/analysis`, "_blank");
          }}
          isEditingTitle={isEditingTitle}
          editedClaimant={editedClaimant}
          editedDefendant={editedDefendant}
          onStartEditTitle={handleStartEditTitle}
          onCancelEditTitle={handleCancelEditTitle}
          onSaveTitle={handleSaveTitle}
          onClaimantChange={handleClaimantChange}
          onDefendantChange={handleDefendantChange}
          isSavingTitle={updateProcessFormMutation.isPending}
          claimantInputRef={claimantInputRef}
          defendantInputRef={defendantInputRef}
          onSync={async () => {
            if (!process?.number) {
              toast.error("Número do processo não encontrado.");
              return;
            }

            if (!canSync(process?.processStatus, process?.synchronizedAt)) {
              if (process?.synchronizedAt) {
                const lastSync = new Date(process.synchronizedAt);
                const now = new Date();
                const diffInMinutes = Math.floor(
                  (now.getTime() - lastSync.getTime()) / (1000 * 60),
                );
                const remainingMinutes = 30 - diffInMinutes;

                toast.warning(
                  `Aguarde mais ${remainingMinutes} minuto${remainingMinutes > 1 ? "s" : ""} para sincronizar novamente.`,
                  {
                    position: "top-right",
                    autoClose: 4000,
                  },
                );
              } else {
                toast.error(
                  "Só é permitido sincronizar caso synchronizedAt já tenha passado 30 minutos.",
                );
              }
              return;
            }

            setSyncModalOpen(true);
          }}
          onViewProcessInfo={() => setShowProcessInfoModal(true)}
          onAssignMember={() => setShowAssignMemberModal(true)}
          onChangeStage={() => setShowChangeStageDialog(true)}
          onRemoveProvisionalLink={handleRemoveProvisionalLink}
          onLinkProvisionalExecution={handleLinkProvisionalExecution}
          isAdmin={isAdmin}
        />
        <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 overflow-y-auto flex flex-col min-h-0">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 transition-all duration-300 min-w-0 lg:grid-cols-6 flex-1 items-start">
            <div className="flex flex-col gap-3 transition-all duration-300 min-w-0 lg:col-span-2 order-1">
              {/* Instance Selection Cards */}
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
                    processNumber={process?.autosData?.number}
                    onClick={() => setActiveInstance("tst")}
                    isActive={activeInstance === "tst"}
                  />
                )}
              </div>

              {/* Content based on active instance */}
              <div className="h-[500px] sm:h-[600px] lg:h-[calc(100vh-255px)]">
                {activeInstance === "1grau" && (
                  <TimelineCard
                    title="Timeline da 1º Instância"
                    moviments={process?.moviments || []}
                    instancia={InstanceEnum.FIRST_INSTANCE}
                    processNumber={process?.number}
                    newMovements={newMovements.PRIMEIRO_GRAU.map((mov) => ({
                      ...mov,
                      instancia: InstanceEnum.FIRST_INSTANCE,
                    }))}
                    onMovementClick={handleMovementClick}
                    documents={process?.documents || []}
                    onDocumentClick={handleDocumentClick}
                    onMarkAsViewed={() => handleMarkAsViewed("PRIMEIRO_GRAU")}
                    isMarkingAsViewed={markMovementsAsViewedMutation.isPending}
                  />
                )}

                {activeInstance === "2grau" && (
                  <TimelineCard
                    title="Timeline da 2º Instância"
                    moviments={process?.moviments || []}
                    instancia={InstanceEnum.SECOND_INSTANCE}
                    processNumber={process?.number}
                    newMovements={newMovements.SEGUNDO_GRAU.map((mov) => ({
                      ...mov,
                      instancia: InstanceEnum.SECOND_INSTANCE,
                    }))}
                    onMovementClick={handleMovementClick}
                    documents={process?.documents || []}
                    onDocumentClick={handleDocumentClick}
                    onMarkAsViewed={() => handleMarkAsViewed("SEGUNDO_GRAU")}
                    isMarkingAsViewed={markMovementsAsViewedMutation.isPending}
                  />
                )}

                {activeInstance === "tst" && process?.autosData && (
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle className="text-primary">
                          Dados do TST
                        </CardTitle>
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
                          <Label className="font-semibold mb-1">
                            Data Trânsito
                          </Label>
                          <p>{process.autosData.dateOfTransit ?? "-"}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex-1 flex flex-col min-h-0">
                        <Label className="font-semibold mb-2">
                          Movimentações TST
                        </Label>
                        {process.autosData.movements?.length ? (
                          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {process.autosData.movements.map((mov) => (
                              <div
                                key={mov.id}
                                className="border border-border rounded-lg p-3"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {mov.data}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {mov.conteudo}
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

            {/* Sidebar - Documents Card e Activities Card com tabs */}
            <div className=" z-0 lg:col-span-4 h-[500px] sm:h-[600px] lg:h-[calc(100vh-200px)] order-2">
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
                  {/* DOCUMENTOS */}
                  <button
                    onClick={() => setActiveRightTab("documents")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
                      activeRightTab === "documents"
                        ? "text-secondary"
                        : "text-gray-600 dark:text-gray-400 hover:text-secondary"
                    }`}
                  >
                    <span className="relative z-10">Documentos</span>

                    {activeRightTab === "documents" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveRightTab("activities")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
                      activeRightTab === "activities"
                        ? "text-secondary"
                        : "text-gray-600 dark:text-gray-400 hover:text-secondary"
                    }`}
                  >
                    <span className="relative z-10">Atividades</span>

                    {activeRightTab === "activities" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
                    )}
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {activeRightTab === "documents" ? (
                    <DocumentsCard
                      documents={
                        linkedDocuments.length > 0
                          ? linkedDocuments
                          : process?.documents || []
                      }
                      selectedDocumentId={selectedDocumentId}
                      processNumber={process?.number || ""}
                      dealId={process?.dealId}
                      onManagePrompts={() => {
                        window.open(`/dashboard?view=prompts`, "_blank");
                      }}
                    />
                  ) : (
                    <div className="h-full overflow-hidden">
                      <ActivitiesCard
                        process={process ?? null}
                        onUpdate={refetchProcess}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <ProcessActionDialogs
          process={process}
          claimant={claimant}
          initialPetitionData={initialPetitionData}
          isAdmin={isAdmin}
          isRefetching={isRefetching}
          isSyncing={isSyncing}
          refetchProcess={refetchProcess}
          isCompanyModalOpen={isCompanyModalOpen}
          setIsCompanyModalOpen={setIsCompanyModalOpen}
          selectedCompanyCnpj={selectedCompany?.cnpj || ""}
          setSelectedCompany={setSelectedCompany}
          showChangeStageDialog={showChangeStageDialog}
          setShowChangeStageDialog={setShowChangeStageDialog}
          showUpdateConfirmation={showUpdateConfirmation}
          setShowUpdateConfirmation={setShowUpdateConfirmation}
          handleAcceptUpdate={handleAcceptUpdate}
          handleRejectUpdate={handleRejectUpdate}
          showSyncCompleteDialog={showSyncCompleteDialog}
          setShowSyncCompleteDialog={setShowSyncCompleteDialog}
          syncModalOpen={syncModalOpen}
          setSyncModalOpen={setSyncModalOpen}
          handleSyncConfirm={handleSyncConfirm}
          runLawsuitsMutationIsPending={runLawsuitsMutation.isPending}
          showProcessInfoModal={showProcessInfoModal}
          setShowProcessInfoModal={setShowProcessInfoModal}
          showAssignMemberModal={showAssignMemberModal}
          setShowAssignMemberModal={setShowAssignMemberModal}
          showRemoveProvisionalLinkConfirm={showRemoveProvisionalLinkConfirm}
          setShowRemoveProvisionalLinkConfirm={setShowRemoveProvisionalLinkConfirm}
          handleConfirmRemoveProvisionalLink={handleConfirmRemoveProvisionalLink}
          removeProvisionalLawsuitMutationIsPending={removeProvisionalLawsuitMutation.isPending}
          showLinkProvisionalExecutionModal={showLinkProvisionalExecutionModal}
          setShowLinkProvisionalExecutionModal={setShowLinkProvisionalExecutionModal}
          executionNumberInput={executionNumberInput}
          setExecutionNumberInput={setExecutionNumberInput}
          handleConfirmLinkProvisionalExecution={handleConfirmLinkProvisionalExecution}
          isInsertExecutionLoading={isInsertExecutionLoading}
        />
      </div>
    </MainShell>
  );
}
