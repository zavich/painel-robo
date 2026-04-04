import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Check } from "lucide-react";

interface InsightGenericProps {
  data: any;
  documentTitle?: string;
  processNumber?: string;
  onSendToPipedrive?: (data: any) => Promise<void>;
}

export default function InsightGeneric({ data, documentTitle, processNumber, onSendToPipedrive }: InsightGenericProps) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  if (!data) return null;

  const formatCurrency = (value: any) => {
    if (typeof value === 'number' && value > 0) {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    return value;
  };

  const formatDate = (dateString: any) => {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
      } catch {
        return dateString;
      }
    }
    return dateString;
  };

  const formatValue = (key: string, value: any): any => {
    if (value === null || value === undefined) return "-";
    
    // Formatação específica baseada no nome da chave
    if (key.toLowerCase().includes('valor') || key.toLowerCase().includes('salario')) {
      return formatCurrency(value);
    }
    
    if (key.toLowerCase().includes('data') || key.toLowerCase().includes('date')) {
      return formatDate(value);
    }

    if (key.toLowerCase().includes('modalidade') && typeof value === 'string') {
      return value.replace(/_/g, ' ');
    }

    return value;
  };

  const renderValue = (key: string, value: any, level: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">Nenhum item</span>;
      }
      
      return (
        <ul className="list-disc ml-4 space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="text-sm break-words">
              {typeof item === 'object' ? renderObject(item, level + 1) : formatValue(key, item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === 'object') {
      return renderObject(value, level + 1);
    }

    return <span className="break-words inline-block max-w-full">{formatValue(key, value)}</span>;
  };

  const renderObject = (obj: any, level: number = 0): React.ReactNode => {
    if (!obj || typeof obj !== 'object') return null;

    const entries = Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined);
    
    if (entries.length === 0) {
      return <span className="text-muted-foreground">Sem dados disponíveis</span>;
    }

    return (
      <div className={`space-y-3 ${level > 0 ? 'pl-4 border-l-2 border-gradient-to-b from-purple-300 to-blue-400 dark:from-purple-600 dark:to-blue-500' : ''}`}>
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1.5 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors break-words">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-600"></div>
              <strong className="text-xs font-semibold text-muted-foreground uppercase tracking-wide break-words">
                {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
              </strong>
            </div>
            <div className="ml-3.5 text-sm font-medium break-words overflow-wrap-anywhere">
              {renderValue(key, value, level)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getTitle = (): string => {
    if (documentTitle) {
      if (documentTitle.toLowerCase().includes('peticao')) return 'Petição Inicial';
      if (documentTitle.toLowerCase().includes('sentenca')) return 'Sentença';
      if (documentTitle.toLowerCase().includes('acordao')) return 'Acórdão';
      if (documentTitle.toLowerCase().includes('recurso')) return 'Recurso';
      if (documentTitle.toLowerCase().includes('alvara')) return 'Alvará';
      if (documentTitle.toLowerCase().includes('planilha')) return 'Planilha de Cálculo';
    }
    return 'Insights do Documento';
  };

  const isCalculationSheet = documentTitle?.toLowerCase().includes('planilha') || false;

  const handleSendToPipedrive = async () => {
    if (!onSendToPipedrive) return;
    
    setIsSending(true);
    try {
      await onSendToPipedrive(data);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error('Erro ao enviar para Pipedrive:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="p-5 border border-border rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-600 rounded-full"></div>
            <h4 className="font-bold text-lg text-primary break-words">{getTitle()}</h4>
          </div>
          
          {/* Botão para enviar Planilha de Cálculo ao Pipedrive */}
          {isCalculationSheet && onSendToPipedrive && (
            <Button
              variant={sent ? "outline" : "default"}
              size="sm"
              onClick={handleSendToPipedrive}
              disabled={isSending || sent}
              className={`flex items-center gap-2 ${
                sent 
                  ? "border-green-500 text-green-600 dark:text-green-400" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : sent ? (
                <>
                  <Check className="h-4 w-4" />
                  Enviado!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar ao Pipedrive
                </>
              )}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          {renderObject(data)}
        </div>
      </div>
    </div>
  );
}