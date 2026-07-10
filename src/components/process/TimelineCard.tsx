import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, X, FileText, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { NewMovement } from "@/app/api/hooks/process/useNewMovements";
import { Badge } from "../ui/badge";
import { Movimentacoes } from "@/app/interfaces/processes";
import { generateTextPdf } from "@/app/utils/textToPdf";
import { InstanceEnum } from "./TimelineCard.types";

// Helper para normalizar datas
function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  // If format is "DD/MM/YYYY HH:MM:SS" or similar
  const parts = dateStr.split(" ");
  const dateOnly = parts[0];
  // Check if Brazilian format DD/MM/YYYY
  if (dateOnly.includes("/")) {
    const [day, month, year] = dateOnly.split("/");
    return `${year}-${month}-${day}`;
  }
  // If already in ISO format YYYY-MM-DD
  return dateOnly.substring(0, 10);
}

// Helper para comparar datas
function compareDates(dateStr1: string, dateStr2: string): number {
  const normalized1 = normalizeDate(dateStr1);
  const normalized2 = normalizeDate(dateStr2);
  return normalized2.localeCompare(normalized1); // Descending order (newest first)
}

// Helper para normalizar texto para busca (remove acentos e espaços extras)
function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas diacríticas (acentos)
    .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único
    .trim();
}

// Card de uma movimentação — sem marcador próprio. Toda movimentação com
// documento (`mov.texto`) usa a mesma UI "documento" (fundo/borda dourados +
// badge "DOCUMENTO"), em vez de um card genérico — antes só os documentos
// vindos do Mongo (`DocumentExtract`, removido) tinham esse destaque.
function MovementCard({
  mov,
  isNew,
  onClick,
}: {
  mov: Movimentacoes;
  isNew: boolean;
  onClick?: (mov: Movimentacoes) => void;
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const temDocumento = !!mov.texto;

  // Abre o documento direto numa nova aba do navegador — antes gerava o PDF
  // e mostrava num preview na barra lateral, mas isso escondia o resto da
  // timeline; abrir em aba nova deixa a timeline visível o tempo todo.
  const abrirDocumentoEmNovaAba = async () => {
    if (!mov.texto || isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const blob = await generateTextPdf(mov.texto);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Clicar no ícone abre o documento em nova aba; clicar em qualquer outra
  // parte do card continua abrindo o preview no painel ao lado, igual antes.
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void abrirDocumentoEmNovaAba();
  };

  return (
    <div
      // Só é clicável quando a movimentação tem documento — sem
      // documento não tem o que abrir no painel ao lado.
      onClick={temDocumento ? () => onClick?.(mov) : undefined}
      className={`relative rounded-lg transition-all duration-200 ${
        temDocumento
          ? "cursor-pointer hover:shadow-lg hover:scale-[1.01] overflow-hidden pl-4 sm:pl-5 pr-8 sm:pr-9 py-2 sm:py-3 bg-secondary/10 dark:bg-secondary-900/30 border border-secondary/40 dark:border-secondary-700 shadow-sm hover:bg-secondary/20 dark:hover:bg-secondary-900/40"
          : isNew
            ? "p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary-900/20 dark:to-primary-800/10 border border-primary/20 dark:border-primary-800/50"
            : "p-2 sm:p-3 bg-card dark:bg-card border border-border dark:border-border/50"
      }`}
    >
      {/* Barra de destaque à esquerda, só pra movimentações com documento */}
      {temDocumento && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
      )}

      {/* Botão de abrir documento — canto superior direito, só ícone */}
      {temDocumento && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick}
          disabled={isGeneratingPdf}
          className="absolute top-1.5 right-1.5 h-6 w-6 p-0 flex items-center justify-center"
          title="Abrir documento em nova aba"
        >
          {isGeneratingPdf ? (
            <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
        </Button>
      )}

      {(temDocumento || isNew) && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
          {temDocumento && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-secondary text-white shadow-sm">
              <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Documento
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-primary text-primary-foreground">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full mr-1 sm:mr-1.5 animate-pulse"></div>
              Nova
            </span>
          )}
        </div>
      )}

      <p
        className={`text-[11px] sm:text-xs leading-relaxed break-words ${
          temDocumento
            ? "font-medium text-foreground dark:text-card-foreground"
            : isNew
              ? "text-primary dark:text-primary-foreground"
              : "text-foreground dark:text-card-foreground"
        }`}
      >
        {mov.conteudo}
      </p>
    </div>
  );
}

type CombinedItem = { id: number; date: string; data: Movimentacoes };

// Agrupa por data (mesmo dia = mesmo marcador) — um único marcador/linha por
// data, com todos os itens daquele dia empilhados ao lado dele.
function TimelineDateGroup({
  date,
  items,
  newMovementIds,
  onMovementClick,
}: {
  date: string;
  items: CombinedItem[];
  newMovementIds: Set<number>;
  onMovementClick?: (mov: Movimentacoes) => void;
}) {
  const hasNew = items.some((item) => newMovementIds.has(item.id));

  return (
    <div className="relative flex items-start pb-2 sm:pb-3">
      {/* Marcador — um só por data, compartilhado por todos os itens dela */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`flex h-6 sm:h-7 min-w-6 sm:min-w-7 px-1.5 sm:px-2 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            hasNew
              ? "bg-gradient-to-br from-primary to-primary-light ring-2 ring-primary/10 dark:ring-primary-foreground/30"
              : "bg-gradient-to-br from-gray-400 to-gray-500 ring-2 ring-gray-100 dark:ring-gray-800/50"
          }`}
        >
          {hasNew ? (
            <div className="relative">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping opacity-30"></div>
            </div>
          ) : (
            <span className="text-white font-semibold text-[8px] sm:text-[9px] leading-none whitespace-nowrap">
              {date}
            </span>
          )}
        </div>
      </div>

      {/* Linha ligando o marcador (data) aos cards desse mesmo dia — indica
          visualmente que a data pertence a esses itens, sem repetir o
          texto da data em cada card. */}
      <div className="flex-shrink-0 w-2 sm:w-3 h-6 sm:h-7 flex items-center">
        <div className="h-0.5 w-full rounded-full bg-gray-400 dark:bg-gray-400" />
      </div>

      {/* Itens do dia, empilhados */}
      <div className="flex-1 min-w-0 space-y-2">
        {items.map((item) => (
          <MovementCard
            key={`movement-${item.id}`}
            mov={item.data}
            isNew={newMovementIds.has(item.id)}
            onClick={onMovementClick}
          />
        ))}
      </div>
    </div>
  );
}

interface TimelineCardProps {
  title: string;
  moviments: Movimentacoes[];
  instancia?: InstanceEnum;
  newMovements?: NewMovement[];
  processNumber?: string;
  onMovementClick?: (mov: Movimentacoes) => void;
  onMarkAsViewed?: () => void;
  isMarkingAsViewed?: boolean;
}

export function TimelineCard({
  title,
  moviments,
  instancia,
  newMovements = [],
  processNumber,
  onMovementClick,
  onMarkAsViewed,
  isMarkingAsViewed = false,
}: TimelineCardProps) {
  const [searchFirstInstance, setSearchFirstInstance] = useState("");

  const movimentsFirstInstance = useMemo(() => {
    if (!searchFirstInstance) {
      return moviments?.filter((mov) => mov.instancia === instancia);
    }

    const normalizedSearch = normalizeSearchText(searchFirstInstance);
    return moviments
      ?.filter((mov) => mov.instancia === instancia)
      .filter((mov) => {
        const normalizedContent = normalizeSearchText(mov.conteudo || "");
        const normalizedDate = normalizeSearchText(mov.data || "");
        return (
          normalizedContent.includes(normalizedSearch) ||
          normalizedDate.includes(normalizedSearch)
        );
      });
  }, [moviments, searchFirstInstance, instancia]);

  // Identificar movimentações novas baseadas no ID e filtrar por instância
  const newMovementIds = useMemo(() => {
    const filteredNewMovements = newMovements.filter(
      (mov) => mov.instancia === instancia,
    );
    return new Set(filteredNewMovements.map((mov) => mov.id));
  }, [newMovements, instancia]);

  // Mapeia movimentações pro formato unificado e ordena por data (mais
  // recente primeiro) — documentos não são mais uma fonte separada (vinham
  // do Mongo, `process.documents`), o texto/documento já está embutido em
  // cada movimentação via `mov.texto` (fonte 100% Athena).
  const combinedItems = useMemo(() => {
    const movementsMapped = movimentsFirstInstance.map((mov) => ({
      id: mov.id,
      date: mov.data,
      data: mov,
    }));

    return movementsMapped.sort((a, b) => compareDates(a.date, b.date));
  }, [movimentsFirstInstance]);

  // Agrupa itens com a mesma data (já vêm ordenados por data em
  // `combinedItems`, então basta comparar com o grupo anterior).
  const groupedItems = useMemo(() => {
    const groups: { date: string; items: CombinedItem[] }[] = [];

    for (const item of combinedItems) {
      const normalized = normalizeDate(item.date);
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && normalizeDate(lastGroup.date) === normalized) {
        lastGroup.items.push(item);
      } else {
        groups.push({ date: item.date, items: [item] });
      }
    }

    return groups;
  }, [combinedItems]);

  // Verificar se há movimentações novas
  const hasNewMovementsNow = newMovementIds.size > 0;

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 flex flex-col h-full shadow-gray-100 dark:shadow-gray-900/20">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 border-b border-gray-200 dark:border-gray-700 py-2 sm:py-3 px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </CardTitle>
            {hasNewMovementsNow && (
              <Badge
                variant="default"
                className="bg-primary hover:bg-primary-light text-primary-foreground text-[9px] sm:text-[10px] px-1.5 py-0"
              >
                {newMovementIds.size}
              </Badge>
            )}
          </div>
          {hasNewMovementsNow && onMarkAsViewed && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAsViewed}
              disabled={isMarkingAsViewed}
              className="h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium flex items-center gap-1 flex-shrink-0"
            >
              {isMarkingAsViewed ? (
                <>
                  <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Marcando...</span>
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Marcar como lidas</span>
                  <span className="sm:hidden">Lidas</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 flex flex-col flex-1 min-h-0">
        <div className="mb-2 sm:mb-3 flex-shrink-0 space-y-2">
          <div className="relative">
            <Input
              placeholder="🔍 Filtrar..."
              value={searchFirstInstance}
              onChange={(e) => setSearchFirstInstance(e.target.value)}
              className="h-8 sm:h-9 pl-3 pr-10 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-xs sm:text-sm"
            />
            {searchFirstInstance && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchFirstInstance("")}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>

          {/* Contador de resultados */}
          {combinedItems.length > 0 && (
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {combinedItems.length}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {combinedItems.length === 1 ? "item" : "itens"}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {combinedItems?.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                Nenhum item encontrado
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {searchFirstInstance
                  ? "Nenhum item corresponde ao filtro aplicado."
                  : "Nenhum item registrado para esta instância."}
              </p>
              {searchFirstInstance && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchFirstInstance("")}
                  className="mt-3 h-7 px-2.5 text-xs"
                >
                  Limpar filtro
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="relative pl-1">
                {groupedItems.map((group) => (
                  <TimelineDateGroup
                    key={`group-${normalizeDate(group.date)}`}
                    date={group.date}
                    items={group.items}
                    newMovementIds={newMovementIds}
                    onMovementClick={onMovementClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
