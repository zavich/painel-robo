"use client";

import { Process } from "@/app/interfaces/processes";
import {
  getClaimant,
  getDefendant,
} from "@/app/utils/processPartsUtils";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getInitialPetitionData,
  getTrackedProcessTitle,
} from "./processPageState.utils";

type UseProcessTitleEditorParams = {
  process: Process | null | undefined;
  onSaveTitle: (title: string) => Promise<void>;
};

export function useProcessTitleEditor({
  process,
  onSaveTitle,
}: UseProcessTitleEditorParams) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedClaimant, setEditedClaimant] = useState("");
  const [editedDefendant, setEditedDefendant] = useState("");
  const claimantInputRef = useRef<HTMLInputElement>(null);
  const defendantInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditTitle = useCallback(() => {
    const initialPetitionData = getInitialPetitionData(process);
    const claimant = getClaimant(process?.processParts || []);
    const defendant = getDefendant(process?.processParts || []);

    const claimantName =
      initialPetitionData?.qualificacao_reclamante?.nome_completo ||
      claimant?.nome ||
      "";
    const defendantName = defendant?.nome || "";
    const currentTitle = getTrackedProcessTitle(process);

    if (currentTitle?.trim() && currentTitle !== process?.number) {
      const separators = [" VS ", " X ", " x "];
      let parts: string[] = [];

      for (const separator of separators) {
        if (currentTitle.includes(separator)) {
          parts = currentTitle.split(separator);
          break;
        }
      }

      if (parts.length >= 2) {
        setEditedClaimant(parts[0].trim());
        setEditedDefendant(parts.slice(1).join(" VS ").trim());
      } else {
        setEditedClaimant(currentTitle.trim());
        setEditedDefendant("");
      }
    } else {
      setEditedClaimant(claimantName);
      setEditedDefendant(defendantName);
    }

    setIsEditingTitle(true);
  }, [process]);

  const handleCancelEditTitle = useCallback(() => {
    setIsEditingTitle(false);
    setEditedClaimant("");
    setEditedDefendant("");
  }, []);

  const handleClaimantChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const cursorPosition = event.target.selectionStart;
      setEditedClaimant(event.target.value);

      requestAnimationFrame(() => {
        if (claimantInputRef.current && cursorPosition !== null) {
          claimantInputRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition,
          );
        }
      });
    },
    [],
  );

  const handleDefendantChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const cursorPosition = event.target.selectionStart;
      setEditedDefendant(event.target.value);

      requestAnimationFrame(() => {
        if (defendantInputRef.current && cursorPosition !== null) {
          defendantInputRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition,
          );
        }
      });
    },
    [],
  );

  const handleSaveTitle = useCallback(async () => {
    if (!editedClaimant.trim() && !editedDefendant.trim()) {
      toast.error("Preencha pelo menos um dos campos");
      return;
    }

    const unifiedTitle =
      editedClaimant.trim() && editedDefendant.trim()
        ? `${editedClaimant.trim()} VS ${editedDefendant.trim()}`
        : editedClaimant.trim() || editedDefendant.trim();

    await onSaveTitle(unifiedTitle);
    setIsEditingTitle(false);
  }, [editedClaimant, editedDefendant, onSaveTitle]);

  return {
    claimantInputRef,
    defendantInputRef,
    editedClaimant,
    editedDefendant,
    handleCancelEditTitle,
    handleClaimantChange,
    handleDefendantChange,
    handleSaveTitle,
    handleStartEditTitle,
    isEditingTitle,
  };
}
