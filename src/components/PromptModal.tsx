import { useEffect, useState } from "react";
import { Prompt } from "../app/interfaces/processes";
import { useAddPrompt } from "@/app/api/hooks/prompts/useAddPrompt";
import { useEditPrompt } from "@/app/api/hooks/prompts/useEditPrompt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function PromptModal({
  prompt,
  isOpen,
  onClose,
  onSaved,
}: PromptModalProps) {
  const [type, setType] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { addPrompt } = useAddPrompt();
  const { editPrompt } = useEditPrompt();
  const { theme } = useTheme();

  useEffect(() => {
    setType(prompt?.type || "");
    setText(prompt?.content || prompt?.text || "");
  }, [prompt, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (prompt?._id) {
        await editPrompt({ _id: prompt._id, type, content: text });
      } else {
        await addPrompt({ type, content: text });
      }
      onSaved();
      onClose();
    } catch (e) {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <div>
              <DialogTitle className={`text-2xl font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                {prompt ? "Editar Prompt" : "Novo Prompt"}
              </DialogTitle>
              <p className={`mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {prompt ? "Modifique as informações do prompt" : "Crie um novo prompt personalizado"}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className={`block text-sm font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              Tipo do Prompt
            </label>
            <input
              type="text"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm ${
                theme === "dark" 
                  ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-gray-100" 
                  : "border-gray-200 focus:ring-blue-500 bg-white"
              }`}
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex: Análise de documentos, Classificação de processos..."
              disabled={loading}
            />
          </div>
          
          <div className="space-y-3">
            <label className={`block text-sm font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              Conteúdo do Prompt
            </label>
            <textarea
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm resize-none ${
                theme === "dark" 
                  ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-gray-100" 
                  : "border-gray-200 focus:ring-blue-500 bg-white"
              }`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Digite o conteúdo completo do prompt que será usado para análise..."
              disabled={loading}
            />
          </div>
        </div>
        
        <div className={`flex justify-end gap-3 pt-6 border-t ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <button
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
              theme === "dark" 
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            onClick={handleSave}
            disabled={loading || !type || !text}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </div>
            ) : (
              "Salvar Prompt"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
