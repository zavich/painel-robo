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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension !== "csv" && fileExtension !== "xlsx") {
        setErrorMessage("Por favor, envie um arquivo no formato CSV ou XLSX.");
        setSelectedFile(null);
        return;
      }

      if (fileExtension === "csv") {
        Papa.parse(file, {
          complete: (result) => {
            const isValid = result.data.every((row: any) => {
              const processNumberRegex =
                /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
              return row.some((cell: string) => processNumberRegex.test(cell));
            });

            if (!isValid) {
              setErrorMessage(
                "O arquivo CSV contém dados inválidos. Certifique-se de que os números de processo estão no formato correto.",
              );
              setSelectedFile(null);
            } else {
              setSelectedFile(file);
            }
          },
          error: () => {
            setErrorMessage(
              "Erro ao processar o arquivo CSV. Tente novamente.",
            );
            setSelectedFile(null);
          },
        });
      } else if (fileExtension === "xlsx") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const isValid = rows
            .filter((row: any) =>
              row.some((cell: string) => cell && cell.trim() !== ""),
            )
            .every((row: any, rowIndex: number) => {
              const processNumberRegex =
                /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
              // Filtra células vazias antes de validar
              const filteredRow = row.filter(
                (cell: string) => cell && cell.trim() !== "",
              );

              const isRowValid = filteredRow.some((cell: string) =>
                processNumberRegex.test(cell),
              );
              return isRowValid;
            });

          if (!isValid) {
            setErrorMessage(
              "O arquivo XLSX contém dados inválidos. Certifique-se de que os números de processo estão no formato correto.",
            );
            setSelectedFile(null);
          } else {
            setSelectedFile(file);
          }
        };
        reader.onerror = () => {
          setErrorMessage("Erro ao processar o arquivo XLSX. Tente novamente.");
          setSelectedFile(null);
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
    onClose();
  };

  const handleClose = () => {
    setProcessNumber("");
    setSelectedFile(null);
    setErrorMessage(null);
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
              accept=".csv, .xlsx"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Arquivo selecionado: {selectedFile.name}
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
