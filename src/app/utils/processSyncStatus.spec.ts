import { ProcessStatusEnum } from "@/app/interfaces/processes";
import {
  hasError,
  isIntermediateStatus,
  isProcessing,
  isSyncCompleted,
} from "./processSyncStatus";

describe("processSyncStatus", () => {
  describe("isProcessing", () => {
    it("retorna true para statuses de processamento", () => {
      [
        ProcessStatusEnum.PROCESSING,
        ProcessStatusEnum.PROCESSING_WITH_MOVIMENTS,
        ProcessStatusEnum.PROCESSING_WITH_DOCUMENTS,
        ProcessStatusEnum.PROCESS_WAITING_EXTRACTION_DOCUMENTS,
      ].forEach((name) => {
        expect(isProcessing({ name } as any)).toBe(true);
      });
    });

    it("retorna false para SUCCESS, ERROR e status undefined", () => {
      expect(isProcessing(undefined)).toBe(false);
      expect(isProcessing({ name: ProcessStatusEnum.SUCCESS } as any)).toBe(false);
      expect(isProcessing({ name: ProcessStatusEnum.ERROR } as any)).toBe(false);
    });
  });

  describe("hasError", () => {
    it("retorna true apenas para ERROR", () => {
      expect(hasError({ name: ProcessStatusEnum.ERROR } as any)).toBe(true);
      expect(hasError({ name: ProcessStatusEnum.SUCCESS } as any)).toBe(false);
      expect(hasError(undefined)).toBe(false);
    });
  });

  describe("isIntermediateStatus", () => {
    it("retorna true para EXTRACTION_MOVIMENTS_FINISHED", () => {
      expect(
        isIntermediateStatus({
          name: ProcessStatusEnum.EXTRACTION_MOVIMENTS_FINISHED,
        } as any),
      ).toBe(true);
    });

    it("retorna false para outros statuses", () => {
      expect(isIntermediateStatus(undefined)).toBe(false);
      expect(isIntermediateStatus({ name: ProcessStatusEnum.SUCCESS } as any)).toBe(
        false,
      );
    });
  });

  describe("isSyncCompleted", () => {
    it("retorna true para statuses finais", () => {
      expect(isSyncCompleted({ name: ProcessStatusEnum.SUCCESS } as any)).toBe(true);
    });

    it("retorna false para statuses em andamento", () => {
      expect(isSyncCompleted(undefined)).toBe(false);
      expect(isSyncCompleted({ name: ProcessStatusEnum.PROCESSING } as any)).toBe(
        false,
      );
    });
  });
});
