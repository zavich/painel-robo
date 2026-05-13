"use client";

import Papa from "papaparse";
import React, { useState } from "react";
import * as XLSX from "xlsx";
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
  const [processNumber, setProcessNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedCount, setCapturedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setCapturedCount(null);
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension !== "csv" && fileExtension !== "xlsx") {
        setErrorMessage("Por favor, envie um arquivo no formato CSV ou XLSX.");
        setSelectedFile(null);
        setCapturedCount(null);
        return;
      }

      // Helper: conta todas ocorrências do padrão em um array de células
      const processNumberPattern =
        "\\d{7}-\\d{2}\\.\\d{4}\\.\\d\\.\\d{2}\\.\\d{4}";
      const processNumberRegex = new RegExp(processNumberPattern);
      const processNumberRegexGlobal = new RegExp(processNumberPattern, "g");
      const countMatchesInArray = (arr: any[]) =>
        arr.reduce((sum, cell) => {
          const s = String(cell || "");
          const matches = s.match(processNumberRegexGlobal);
          return sum + (matches ? matches.length : 0);
        }, 0);

      if (fileExtension === "csv") {
        Papa.parse(file, {
          complete: (result) => {
            // Flatten rows and count matches (considera múltiplas ocorrências por célula)
            const flattened: any[] = ([] as any[]).concat(...result.data);
            const count = countMatchesInArray(flattened);

            const isValid = result.data.every((row: any) => {
              return row.some((cell: string) =>
                processNumberRegex.test(String(cell)),
              );
            });

            if (!isValid) {
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
            const hasValidProcessNumber = count > 0;

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
