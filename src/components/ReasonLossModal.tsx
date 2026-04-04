import { useEffect, useState } from "react";
import { ReasonLoss } from "@/app/api/hooks/reason-loss/useReasonLoss";
import { useAddReasonLoss } from "@/app/api/hooks/reason-loss/useAddReasonLoss";
import { useEditReasonLoss } from "@/app/api/hooks/reason-loss/useEditReasonLoss";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface ReasonLossModalProps {
  reasonLoss: ReasonLoss | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ReasonLossModal({
  reasonLoss,
  isOpen,
  onClose,
  onSaved,
}: ReasonLossModalProps) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addReasonLoss, isLoading: isAdding } = useAddReasonLoss();
  const { editReasonLoss, isLoading: isEditing } = useEditReasonLoss();
  const { theme } = useTheme();

  useEffect(() => {
    setKey(reasonLoss?.key || "");
    setLabel(reasonLoss?.label || "");
    setErrorKey(null);
    setErrorLabel(null);
  }, [reasonLoss, isOpen]);

  const validate = () => {
    let hasError = false;
    const keyTrimmed = key.trim();
    const labelTrimmed = label.trim();

    // Key: obrigatória, somente A-Z, 0-9 e underscore, sem espaços
    if (!keyTrimmed) {
      setErrorKey("A chave é obrigatória.");
      hasError = true;
    } else if (!/^[A-Z0-9_]+$/.test(keyTrimmed)) {
      setErrorKey("Use apenas letras maiúsculas, números e underscore (sem espaços).");
      hasError = true;
    } else {
      setErrorKey(null);
    }

    // Label: obrigatória e mínimo de 3 caracteres
    if (!labelTrimmed) {
      setErrorLabel("O label é obrigatório.");
      hasError = true;
    } else if (labelTrimmed.length < 3) {
      setErrorLabel("Informe ao menos 3 caracteres.");
      hasError = true;
    } else {
      setErrorLabel(null);
    }

    return !hasError;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      if (reasonLoss?._id) {
        await editReasonLoss({ id: reasonLoss._id, data: { key: key.trim(), label: label.trim() } });
      } else {
        await addReasonLoss({ key: key.trim(), label: label.trim() });
      }
      onSaved();
      onClose();
      setKey("");
      setLabel("");
    } catch (e: any) {
      alert(e.message || "Erro ao salvar motivo de recusa");
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || isAdding || isEditing;

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
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className={`text-2xl font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                {reasonLoss ? "Editar Motivo de Recusa" : "Novo Motivo de Recusa"}
              </DialogTitle>
              <p className={`mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {reasonLoss ? "Modifique as informações do motivo de recusa" : "Crie um novo motivo de recusa"}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className={`block text-sm font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              Chave <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm ${
                theme === "dark" 
                  ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-gray-100" 
                  : "border-gray-200 focus:ring-blue-500 bg-white"
              } ${errorKey ? "border-red-500 focus:ring-red-500" : ""}`}
              value={key}
              onChange={(e) => {
                const sanitized = e.target.value.toUpperCase().replace(/\s+/g, "_");
                setKey(sanitized);
              }}
              placeholder="Ex: PRE_ANALISE_VALOR_ABAIXO_MINIMO"
              disabled={isLoading}
              maxLength={100}
            />
            <p className={`text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              Chave única para identificar o motivo (sem espaços, use underscore)
            </p>
            {errorKey && (
              <p className="text-xs text-red-500">{errorKey}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className={`block text-sm font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm ${
                theme === "dark" 
                  ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-gray-100" 
                  : "border-gray-200 focus:ring-blue-500 bg-white"
              } ${errorLabel ? "border-red-500 focus:ring-red-500" : ""}`}
              value={label}
              onChange={(e) => setLabel(e.target.value.toUpperCase())}
              placeholder="Ex: PRÉ-ANÁLISE - VALOR ABAIXO DO MÍNIMO"
              disabled={isLoading}
              maxLength={200}
            />
            <p className={`text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              Texto que será exibido para o usuário (use apenas CAIXA ALTA)
            </p>
            {errorLabel && (
              <p className="text-xs text-red-500">{errorLabel}</p>
            )}
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
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            onClick={handleSave}
            disabled={isLoading || !key.trim() || !label.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </div>
            ) : (
              reasonLoss ? "Salvar Alterações" : "Criar Motivo"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

