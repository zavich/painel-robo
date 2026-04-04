import { XCircle, Clipboard, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { formatDateTime } from "@/app/utils/formatUtils";

export function DeclinedProcessBanner({
  reasonLabel,
  reasonDescription,
  stage,
  declinedAt,
  isRefetching = false,
}: {
  reasonLabel: string;
  reasonDescription?: string;
  stage?: string;
  declinedAt?: string;
  isRefetching?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Efeito para detectar mudanças nos dados
  useEffect(() => {
    if (reasonLabel || reasonDescription || stage || declinedAt) {
      setLastUpdate(new Date());
    }
  }, [reasonLabel, reasonDescription, stage, declinedAt]);

  // Banner de processo declinado deve permanecer visível sempre
  // Removido auto-hide para manter o banner sempre visível

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${reasonLabel}${reasonDescription ? " - " + reasonDescription : ""}`);
      setCopied(true);
      toast.success("Motivo copiado!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Erro ao copiar motivo");
    }
  };

  // Banner sempre visível quando há dados de processo declinado

  return (
    <div className={`bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-900/30 dark:via-red-800/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-5 flex items-start gap-4 mb-8 shadow-sm transition-all duration-300 ${
      isRefetching ? 'ring-2 ring-red-300 dark:ring-red-700' : ''
    }`}>
      <div className="flex flex-col items-center justify-center pt-1">
        <div className="relative">
          <XCircle className={`h-8 w-8 text-red-500 dark:text-red-400 ${
            isRefetching ? 'animate-pulse' : 'animate-pulse'
          }`} />
          {isRefetching && (
            <RefreshCw className="absolute -top-1 -right-1 h-4 w-4 text-red-600 dark:text-red-300 animate-spin" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-red-700 dark:text-red-300 text-xl">Processo Declinado</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={handleCopy}
            title="Copiar motivo"
          >
            <Clipboard className={`h-5 w-5 ${copied ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`} />
          </Button>
          {copied && (
            <span className="text-green-600 dark:text-green-400 text-xs ml-1">Copiado!</span>
          )}
        </div>
        <div className="text-red-800 dark:text-red-200 font-semibold text-base mb-1">
          Motivo: <span className="font-normal">{reasonLabel}</span>
        </div>
        {stage && (
          <div className="text-xs text-red-700 dark:text-red-300 mb-1">
            Etapa: {stage}
          </div>
        )}
        {declinedAt && (
          <div className="text-xs text-muted-foreground dark:text-gray-400 mb-1">
            Data da recusa: {formatDateTime(declinedAt)}
          </div>
        )}
        {reasonDescription && (
          <div className="text-sm text-red-700 dark:text-red-200 mt-2 bg-red-100 dark:bg-red-900/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <span className="font-medium">Descrição:</span>
            <br />
            {reasonDescription}
          </div>
        )}
      </div>
    </div>
  );
}