import { useDeletePrompt } from "@/app/api/hooks/prompts/useDeletePrompt";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

import { PromptModal } from "./PromptModal";
import { Prompt } from "../app/interfaces/processes";
import { useTheme } from "@/app/hooks/use-theme-client";
import { ConfirmDialog } from "./ConfirmDialog";

interface PromptTableProps {
  data: Prompt[];
  onEdit?: (prompt: Prompt) => void;
  onDeleted?: () => void;
  onAdd?: () => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  startIndex?: number;
  endIndex?: number;
  onPageChange?: (page: number) => void;
}

// Componente para skeleton row
const SkeletonRow = ({ theme }: { theme: string }) => (
  <TableRow className={theme === "dark" ? "border-gray-700" : "border-gray-200"}>
    <TableCell className="py-4 px-6">
      <div className={`h-4 w-24 rounded animate-pulse ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      }`}></div>
    </TableCell>
    <TableCell className="py-4 px-6">
      <div className={`h-4 w-64 rounded animate-pulse ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      }`}></div>
    </TableCell>
    <TableCell className="py-4 px-6">
      <div className="flex gap-3 justify-end">
        <div className={`h-8 w-16 rounded animate-pulse ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}></div>
        <div className={`h-8 w-20 rounded animate-pulse ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}></div>
      </div>
    </TableCell>
  </TableRow>
);

export function PromptTable({
  data,
  onEdit,
  onDeleted,
  onAdd,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  startIndex = 1,
  endIndex = 0,
  onPageChange,
}: PromptTableProps) {
  const { deletePrompt } = useDeletePrompt();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openContent, setOpenContent] = useState<string | null>(null);
  const [modalPrompt, setModalPrompt] = useState<Prompt | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeletingId(itemToDelete);
    try {
      await deletePrompt(itemToDelete);
      onDeleted && onDeleted();
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (e) {
      alert("Erro ao deletar prompt");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setModalPrompt(prompt);
    setShowPromptModal(true);
  };

  return (
    <>
      <div>
        <div className="overflow-x-auto">
        <Table className="min-w-[500px] md:min-w-full">
          <TableHeader>
            <TableRow className={theme === "dark" ? "border-gray-700" : "border-gray-200"}>
              <TableHead className={`font-bold text-sm select-none whitespace-nowrap py-4 px-6 border-b ${
                theme === "dark" 
                  ? "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border-gray-700" 
                  : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200"
              }`}>
                Tipo
              </TableHead>
              <TableHead
                className={`font-bold text-sm select-none whitespace-nowrap py-4 px-6 border-b ${
                  theme === "dark" 
                    ? "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border-gray-700" 
                    : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200"
                }`}
                style={{ width: 340 }}
              >
                Conteúdo
              </TableHead>
              <TableHead className={`font-bold text-sm select-none whitespace-nowrap py-4 px-6 border-b ${
                theme === "dark" 
                  ? "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border-gray-700" 
                  : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200"
              }`} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }, (_, index) => (
                <SkeletonRow key={index} theme={theme} />
              ))
            ) : data.length ? (
              data.map((prompt) => (
                <TableRow
                  key={prompt._id}
                  className={`border-b transition-all duration-200 cursor-pointer group hover:shadow-sm ${
                    theme === "dark" 
                      ? "hover:bg-gray-700/50 border-gray-700" 
                      : "hover:bg-blue-50/50 border-gray-100"
                  }`}
                >
                  <TableCell className="whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis py-4 px-6">
                    <span className={`font-semibold ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>{prompt.type}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis py-4 px-6" style={{ maxWidth: 220, width: 220 }}>
                    <span
                      className={`font-medium block truncate cursor-pointer transition-colors ${
                        theme === "dark" 
                          ? "text-gray-300 hover:text-blue-400" 
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title="Clique para ver o conteúdo completo"
                      onClick={() =>
                        setOpenContent(prompt.content || prompt.text || "")
                      }
                    >
                      {prompt.content || prompt.text}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="flex gap-3 justify-end whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-lg px-3 py-1 transition-colors ${
                          theme === "dark" 
                            ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/30" 
                            : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        }`}
                        onClick={() => handleEdit(prompt)}
                        disabled={deletingId === prompt._id}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-lg px-3 py-1 transition-colors ${
                          theme === "dark" 
                            ? "text-red-400 hover:text-red-300 hover:bg-red-900/30" 
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        }`}
                        onClick={() => handleDeleteClick(prompt._id)}
                        disabled={deletingId === prompt._id}
                      >
                        {deletingId === prompt._id ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className={`text-center py-16 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}>
                      <FileText className={`h-8 w-8 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}>Nenhum prompt encontrado</p>
                      <p className={`text-sm ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>Crie seu primeiro prompt para começar</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && totalPages > 1 && onPageChange && (
        <div className={`flex flex-col md:flex-row items-center justify-between mt-8 gap-4 md:gap-0 px-6 py-4 border-t ${
          theme === "dark" 
            ? "bg-gray-700/50 border-gray-700" 
            : "bg-gray-50 border-gray-200"
        }`}>
          <p className={`text-sm font-medium ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Mostrando {startIndex} a {endIndex} de {totalCount} prompts
          </p>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`rounded-xl transition-colors ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
              }`}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
              .map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className={`rounded-xl transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                      : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  {pageNumber}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-xl transition-colors ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
              }`}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
      </div>
      {openContent && (
        <Dialog
          open={!!openContent}
          onOpenChange={() => setOpenContent(null)}
        >
          <DialogContent className={`max-w-2xl rounded-2xl shadow-2xl ${
            theme === "dark" 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <DialogHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className={`text-2xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>Conteúdo do Prompt</DialogTitle>
              </div>
            </DialogHeader>
            <div className={`whitespace-pre-wrap break-words text-sm max-h-[60vh] overflow-auto p-4 rounded-xl border ${
              theme === "dark" 
                ? "bg-gray-700 border-gray-600 text-gray-100" 
                : "bg-gray-50 border-gray-200"
            }`}>
              {openContent}
            </div>
          </DialogContent>
        </Dialog>
      )}
      <PromptModal
        prompt={modalPrompt}
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onSaved={() => {
          setShowPromptModal(false);
          onDeleted && onDeleted();
        }}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Remover prompt"
        description="Tem certeza que deseja remover este prompt? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={deletingId !== null}
      />
    </>
  );
}
