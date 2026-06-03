"use client";

import { useAddPipedriveNote } from "@/app/api/hooks/process/useAddPipedriveNote";
import { Process } from "@/app/interfaces/processes";
import { logger } from "@/app/lib/logger";
import type { PipedriveFormData } from "@/components/process/PipedriveForm.types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  EMPTY_FORM_STATE,
  buildProcessFormState,
  hasTrackedFormChanges,
} from "./processPageState.utils";

type UseProcessFormStateParams = {
  isEditing: boolean;
  process: Process | null | undefined;
};

export function useProcessFormState({
  isEditing,
  process,
}: UseProcessFormStateParams) {
  const addNoteMutation = useAddPipedriveNote();
  const [formState, setFormState] = useState<PipedriveFormData>(EMPTY_FORM_STATE);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const resetChangeFlags = useCallback(() => {
    setHasChanges(false);
    setHasUnsavedChanges(false);
  }, []);

  useEffect(() => {
    if (!process || isEditing) {
      return;
    }

    setFormState(buildProcessFormState(process));
  }, [process, isEditing]);

  useEffect(() => {
    if (!process || isEditing) {
      return;
    }

    const hasDirtyState = hasTrackedFormChanges(formState, process);
    setHasUnsavedChanges(hasDirtyState);
    setHasChanges(hasDirtyState);
  }, [formState, isEditing, process]);

  useEffect(() => {
    let lastNoteContent = "";
    let lastNoteTime = 0;

    function handleCalcNote(data: { note: string; type: string }) {
      if (data?.type !== "CALC_NOTE" || typeof data?.note !== "string") {
        return;
      }

      const now = Date.now();
      if (data.note === lastNoteContent && now - lastNoteTime < 1000) {
        return;
      }

      lastNoteContent = data.note;
      lastNoteTime = now;

      setFormState((currentState) => ({
        ...currentState,
        analysis: currentState.analysis
          ? `${currentState.analysis}\n\n${data.note}`
          : data.note,
      }));
      setHasUnsavedChanges(true);
      setHasChanges(true);

      if (!process?.dealId) {
        toast.success("Notas da planilha adicionadas ao formulário.");
        return;
      }

      addNoteMutation.mutate(
        { content: data.note, dealId: process.dealId },
        {
          onSuccess: () => {
            toast.success("Nota enviada ao Pipedrive.");
          },
          onError: (error) => {
            logger.error("Falha ao enviar nota ao Pipedrive:", error as object);
            toast.error("Falha ao enviar nota ao Pipedrive.");
          },
        },
      );
    }

    function handleCustomEvent(event: CustomEvent) {
      handleCalcNote(event.detail);
    }

    function handleMessage(event: MessageEvent) {
      // Aceitar apenas mensagens da mesma origem para prevenir abuso via postMessage cross-origin
      if (event.origin !== window.location.origin) return;
      handleCalcNote(event.data);
    }

    window.addEventListener("calc-note", handleCustomEvent as EventListener);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener(
        "calc-note",
        handleCustomEvent as EventListener,
      );
      window.removeEventListener("message", handleMessage);
    };
  }, [addNoteMutation, process?.dealId]);

  return {
    formState,
    setFormState,
    hasChanges,
    hasUnsavedChanges,
    resetChangeFlags,
  };
}
