"use client";

import { Process } from "@/app/interfaces/processes";
import { MainShell } from "@/components/layout/MainShell";
import {
  DocumentsCardSkeleton,
  ProcessHeaderSkeleton,
  TimelineCardSkeleton,
} from "@/components/Loading";
import { ProcessHeader } from "@/components/process/ProcessHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { ProcessActionDialogs } from "./components/ProcessActionDialogs";
import { ProcessSidebar } from "./components/ProcessSidebar";
import { ProcessTimelineSection } from "./components/ProcessTimelineSection";
import { useProcessPageState } from "./hooks/useProcessPageState";

export default function ProcessDetailsEditPage() {
  const {
    router,
    isAdmin,
    process,
    isLoading,
    refetchProcess,
    isRefetching,
    isProcessError,
    isLawsuitNotFound,
    isCheckingNewLawsuit,
    hasFirstDegreeMovements,
    hasSecondDegreeMovements,
    hasThirdInstanceMovements,
    lawsuitCnjNumber,
    lawsuitMoviments,
    lawsuitParts,
    lawsuitMotivoErro,
    lawsuitStatusColeta,
    claimant,
    initialPetitionData,
    selectedCompany,
    isCompanyModalOpen,
    setIsCompanyModalOpen,
    setSelectedCompany,
    showUpdateConfirmation,
    setShowUpdateConfirmation,
    isSyncing,
    showSyncCompleteDialog,
    setShowSyncCompleteDialog,
    syncModalOpen,
    setSyncModalOpen,
    activeInstance,
    setActiveInstance,
    showRemoveProvisionalLinkConfirm,
    setShowRemoveProvisionalLinkConfirm,
    showLinkProvisionalExecutionModal,
    setShowLinkProvisionalExecutionModal,
    movementDocumentPreview,
    executionNumberInput,
    setExecutionNumberInput,
    isEditingTitle,
    editedClaimant,
    editedDefendant,
    claimantInputRef,
    defendantInputRef,
    updateProcessFormMutation,
    syncLawsuitMutation,
    searchLawsuitMutation,
    removeProvisionalLawsuitMutation,
    isInsertExecutionLoading,
    processReopenPending,
    handleCloseMovementDocument,
    handleCompanyClick,
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
    handleSearchNewLawsuit,
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

  if (isCheckingNewLawsuit) {
    return (
      <MainShell>
        <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Verificando comunicacao-spot...
            </p>
          </div>
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
                {isLawsuitNotFound
                  ? "Processo não encontrado"
                  : "Erro ao carregar o processo"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {isLawsuitNotFound ? (
                  <>
                    Não encontramos nenhum processo com esse número no PJe.
                    <br />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Verifique se o número foi digitado corretamente.
                    </span>
                  </>
                ) : (
                  <>
                    Ocorreu um erro ao carregar os dados do processo.
                    <br />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Isso pode ser uma falha transitória — tente novamente em
                      instantes.
                    </span>
                  </>
                )}
              </p>
              <div className="flex flex-col gap-3">
                {isLawsuitNotFound && (
                  <Button
                    onClick={handleSearchNewLawsuit}
                    disabled={searchLawsuitMutation.isPending}
                    className="bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {searchLawsuitMutation.isPending ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {searchLawsuitMutation.isPending
                      ? "Iniciando busca..."
                      : "Buscar processo"}
                  </Button>
                )}
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
          lawsuitCnjNumber={lawsuitCnjNumber}
          lawsuitParts={lawsuitParts}
          lawsuitStatusColeta={lawsuitStatusColeta}
          lawsuitMotivoErro={lawsuitMotivoErro}
          onReopen={handleReopen}
          isPending={processReopenPending}
          isRefetching={isRefetching}
          isSyncing={isSyncing}
          onCompanyClick={handleCompanyClick}
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
            if (!lawsuitCnjNumber) {
              toast.error("Número do processo não encontrado.");
              return;
            }

            setSyncModalOpen(true);
          }}
          onRemoveProvisionalLink={handleRemoveProvisionalLink}
          onLinkProvisionalExecution={handleLinkProvisionalExecution}
        />
        <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 overflow-y-auto flex flex-col min-h-0">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 transition-all duration-300 min-w-0 lg:grid-cols-6 flex-1 items-start">
            <ProcessTimelineSection
              activeInstance={activeInstance}
              hasFirstDegreeMovements={hasFirstDegreeMovements}
              hasSecondDegreeMovements={hasSecondDegreeMovements}
              hasThirdInstanceMovements={hasThirdInstanceMovements}
              moviments={lawsuitMoviments}
              onMovementClick={handleMovementClick}
              process={process}
              setActiveInstance={setActiveInstance}
            />

            <ProcessSidebar
              overrideDocument={movementDocumentPreview}
              onCloseOverrideDocument={handleCloseMovementDocument}
            />
          </div>
        </main>

        <ProcessActionDialogs
          companyModal={{
            open: isCompanyModalOpen,
            selectedCompanyCnpj: selectedCompany?.cnpj || "",
            setOpen: setIsCompanyModalOpen,
            setSelectedCompany,
          }}
          linkProvisionalExecutionModal={{
            executionNumberInput,
            isLoading: isInsertExecutionLoading,
            onConfirm: handleConfirmLinkProvisionalExecution,
            open: showLinkProvisionalExecutionModal,
            setExecutionNumberInput,
            setOpen: setShowLinkProvisionalExecutionModal,
          }}
          processData={{
            claimant,
            initialPetitionData,
            isAdmin,
            isRefetching,
            isSyncing,
            process,
            refetchProcess,
          }}
          removeProvisionalLinkDialog={{
            isPending: removeProvisionalLawsuitMutation.isPending,
            onConfirm: handleConfirmRemoveProvisionalLink,
            open: showRemoveProvisionalLinkConfirm,
            setOpen: setShowRemoveProvisionalLinkConfirm,
          }}
          syncCompleteDialog={{
            open: showSyncCompleteDialog,
            setOpen: setShowSyncCompleteDialog,
          }}
          syncOptionsModal={{
            isPending: syncLawsuitMutation.isPending,
            onConfirm: handleSyncConfirm,
            open: syncModalOpen,
            setOpen: setSyncModalOpen,
          }}
          updateConfirmationDialog={{
            onAccept: handleAcceptUpdate,
            onReject: handleRejectUpdate,
            open: showUpdateConfirmation,
            setOpen: setShowUpdateConfirmation,
          }}
        />
      </div>
    </MainShell>
  );
}
