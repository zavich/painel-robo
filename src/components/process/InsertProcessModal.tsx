"use client";

import Papa from "papaparse";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

interface InsertProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (processNumber: string, file: File | null) => void;
}

const InsertProcessModal: React.FC<InsertProcessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const PROCESS_NUMBER_PATTERN = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
  const PROCESS_NUMBER_MATCH_PATTERN = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g;
  const PROCESS_NUMBER_CANDIDATE_PATTERN = /\d[\d.-]{8,30}/g;

  const [processNumber, setProcessNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedCount, setCapturedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [malformedNumbers, setMalformedNumbers] = useState<string[]>([]);

  const sanitizeCandidate = (value: string) =>
    value.replace(/^[^\d]+|[^\d]+$/g, "").trim();

  const collectMalformedNumbers = (
    arr: (string | number | null | undefined)[],
  ): string[] => {
    const invalid = new Set<string>();

    arr.forEach((cell) => {
      const text = String(cell ?? "");
      const candidates = text.match(PROCESS_NUMBER_CANDIDATE_PATTERN) ?? [];

      candidates.forEach((rawCandidate) => {
        const candidate = sanitizeCandidate(rawCandidate);

        if (!candidate) {
          return;
        }

        if (!PROCESS_NUMBER_PATTERN.test(candidate)) {
          invalid.add(candidate);
        }
      });
    });

    return Array.from(invalid);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setCapturedCount(null);
    setMalformedNumbers([]);
    if (event.target.files && event.target.files.length > 0) {
      setProcessNumber("");
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension !== "csv" && fileExtension !== "xlsx") {
        setErrorMessage("Por favor, envie um arquivo no formato CSV ou XLSX.");
        setSelectedFile(null);
        setCapturedCount(null);
        return;
      }

      // Helper: conta todas ocorrências do padrão em um array de células
      const countMatchesInArray = (
        arr: (string | number | null | undefined)[],
      ) =>
        arr.reduce((sum: number, cell: string | number | null | undefined) => {
          const s = String(cell ?? "");
          const matches = s.match(PROCESS_NUMBER_MATCH_PATTERN);
          return sum + (matches ? matches.length : 0);
        }, 0);

      if (fileExtension === "csv") {
        Papa.parse(file, {
          complete: (result) => {
            // Flatten rows and count matches (considera múltiplas ocorrências por célula)
            const flattened: (string | number | null | undefined)[] = (
              [] as (string | number | null | undefined)[]
            ).concat(
              ...(result.data as (string | number | null | undefined)[][]),
            );
            const count = countMatchesInArray(flattened);

            const malformed = collectMalformedNumbers(flattened);

            if (malformed.length > 0) {
              setMalformedNumbers(malformed);
              setErrorMessage(
                "Encontramos números de processo mal formatados no arquivo.",
              );
              setSelectedFile(null);
              setCapturedCount(null);
              return;
            }

            if (count === 0) {
              setErrorMessage(
                "O arquivo CSV contém dados inválidos. Certifique-se de que os números de processo estão no formato correto.",
              );
              setSelectedFile(null);
              setCapturedCount(null);
            } else {
              setSelectedFile(file);
              setCapturedCount(count);
            }
          },
          error: () => {
            setErrorMessage(
              "Erro ao processar o arquivo CSV. Tente novamente.",
            );
            setSelectedFile(null);
            setCapturedCount(null);
          },
        });
      } else if (fileExtension === "xlsx") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // PERF-007: lazy-load XLSX to avoid blocking the initial bundle
            const XLSX = await import("xlsx");
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Converter a planilha para CSV para facilitar parsing
            const csv = XLSX.utils.sheet_to_csv(worksheet);

            const lines = csv
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean);

            const rows = lines.map((line) =>
              line.split(/;|,/).map((cell) => String(cell).trim()),
            );

            const allNonEmpty = rows
              .filter((r) => r.length > 0)
              .every((row) => row.every((cell) => String(cell).trim() !== ""));

            // contar ocorrências usando a função que considera múltiplas ocorrências por célula
            const flattened = ([] as string[]).concat(...rows);
            const count = countMatchesInArray(flattened);
            const malformed = collectMalformedNumbers(flattened);
            const hasValidProcessNumber = count > 0;

            if (malformed.length > 0) {
              setMalformedNumbers(malformed);
              setErrorMessage(
                "Encontramos números de processo mal formatados no arquivo.",
              );
              setSelectedFile(null);
              setCapturedCount(null);
              return;
            }

            if (!allNonEmpty || !hasValidProcessNumber) {
              setErrorMessage(
                "O arquivo XLSX contém dados inválidos. Certifique-se de que os números de processo estão no formato correto.",
              );
              setSelectedFile(null);
              setCapturedCount(null);
              return;
            }

            setSelectedFile(file);
            setCapturedCount(count);
          } catch (err) {
            setErrorMessage(
              "Erro ao processar o arquivo XLSX. Tente novamente.",
            );
            setSelectedFile(null);
            setCapturedCount(null);
          }
        };
        reader.onerror = () => {
          setErrorMessage("Erro ao processar o arquivo XLSX. Tente novamente.");
          setSelectedFile(null);
          setCapturedCount(null);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const handleSubmit = () => {
    setErrorMessage(null);
    setMalformedNumbers([]);

    if (processNumber && !PROCESS_NUMBER_PATTERN.test(processNumber.trim())) {
      setMalformedNumbers([processNumber.trim()]);
      setErrorMessage("O número digitado está mal formatado.");
      return;
    }

    if (selectedFile) {
      onSubmit(processNumber, selectedFile);
    } else {
      onSubmit(processNumber, null);
    }
    setProcessNumber("");
    setSelectedFile(null);
    setCapturedCount(null);
    onClose();
  };

  const handleClose = () => {
    setProcessNumber("");
    setSelectedFile(null);
    setErrorMessage(null);
    setMalformedNumbers([]);
    setCapturedCount(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Inserir Processo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="processNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Número do Processo
            </label>
            <Input
              id="processNumber"
              type="text"
              value={processNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setProcessNumber(e.target.value)
              }
              placeholder="Digite o número do processo"
              className="mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="fileUpload"
              className="block text-sm font-medium text-gray-700"
            >
              Upload de Documento (CSV)
            </label>
            <input
              id="fileUpload"
              type="file"
              accept=",.csv, .xlsx"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Arquivo selecionado: {selectedFile.name}
                {capturedCount !== null && (
                  <span className="block text-sm text-gray-700 mt-1">
                    {capturedCount} processo{capturedCount !== 1 ? "s" : ""}{" "}
                    detectado{capturedCount !== 1 ? "s" : ""} no arquivo
                  </span>
                )}
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
            )}
            {malformedNumbers.length > 0 && (
              <div className="mt-2 rounded border border-red-200 bg-red-50 p-2">
                <p className="text-sm font-medium text-red-700">
                  Números mal formatados encontrados:
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
                  {malformedNumbers.slice(0, 10).map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
                {malformedNumbers.length > 10 && (
                  <p className="mt-1 text-xs text-red-700">
                    E mais {malformedNumbers.length - 10} número(s).
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!processNumber && !selectedFile}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsertProcessModal;
