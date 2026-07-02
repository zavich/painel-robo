import { useLawsuit } from "@/app/api/hooks/lawsuit/useLawsuit";
import { useProcessFetch } from "@/app/api/hooks/process/useInsertProcess";
import { useFilter } from "@/app/hooks/filter/useFilter";
import { useToast } from "@/app/hooks/use-toast";
import { FiltersBar } from "@/components/FiltersBar";
import InsertProcessModal from "@/components/process/InsertProcessModal";
import { Button } from "@/components/ui/button";
import { Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function KanbanDashboard() {
  const { filters, setFilter, resetFilters } = useFilter();
  const router = useRouter();
  const { fetchData } = useProcessFetch();
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const { toast } = useToast();

  const search = useMemo(
    () =>
      typeof filters.search === "string"
        ? filters.search
        : String(filters.search || ""),
    [filters.search],
  );

  // A busca agora consulta o Athena (/lawsuits), que é bem mais lento e
  // custa por query — diferente do Mongo. Debounce evita disparar uma
  // consulta a cada tecla digitada.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const hasSearch = Boolean(debouncedSearch);

  const { data: lawsuit, isLoading } = useLawsuit(debouncedSearch);

  const notFound = hasSearch && !isLoading && !lawsuit;

  // Nova abordagem: a busca vai direto para o detalhe do processo quando encontrado
  useEffect(() => {
    if (hasSearch && !isLoading && lawsuit) {
      router.push(`/processes/${lawsuit.cnjNumber}`);
    }
  }, [hasSearch, isLoading, lawsuit, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Limpa a busca ao sair desta tela (ex: ao ir para o detalhe do processo
  // encontrado) para que, ao voltar, o dashboard não redirecione de novo
  // automaticamente para o mesmo processo.
  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

  const handleOpenInsertModal = () => {
    setIsInsertModalOpen(true);
  };

  const handleCloseInsertModal = () => {
    setIsInsertModalOpen(false);
  };

  const handleInsertProcess = async (
    processNumber: string,
    file: File | null,
  ) => {
    try {
      if (processNumber) {
        await fetchData({
          type: "number",
          value: [processNumber],
        });
      } else {
        await fetchData({
          type: "upload",
          file: file as File,
        });
      }
      toast({
        title: "Processo inserido com sucesso!",
        description: `O processo ${processNumber} foi inserido e está sendo processado. Ele aparecerá na lista em breve.`,
      });
      handleCloseInsertModal();
    } catch (error) {
      toast({
        title: "Erro ao inserir processo",
        description: "Ocorreu um erro ao inserir o processo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-8 bg-gradient-to-b from-background via-background to-muted/30">
        <div className="mb-4 flex items-center justify-end">
          <Button
            onClick={handleOpenInsertModal}
            className="ml-4 bg-gradient-to-r from-secondary to-accent text-white shadow-md focus:ring-2 focus:ring-secondary/30 hover:from-secondary hover:to-accent"
          >
            Inserir Processo
          </Button>
        </div>
        <div className="mb-8">
          <FiltersBar
            filters={{ search }}
            onFiltersChange={(newFilters) => {
              Object.entries(newFilters).forEach(([key, value]) =>
                setFilter(
                  key,
                  value as string | number | boolean | null | undefined,
                ),
              );
            }}
            onApplyFilters={() => {
              // React Query will automatically refetch when a busca muda
            }}
            onClearFilters={() => {
              resetFilters();
            }}
            isLoading={isLoading}
          />
        </div>

        <div className="backdrop-blur-sm rounded-2xl border shadow-lg overflow-hidden bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          {!hasSearch ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Digite o número do processo
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use o número completo, no formato CNJ (ex:
                0000000-00.0000.0.00.0000). Você será levado direto ao
                detalhe do processo encontrado.
              </p>
            </div>
          ) : notFound ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <SearchX className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processo não encontrado
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum processo foi encontrado com o número &quot;
                {debouncedSearch}&quot;.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="h-6 w-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLoading ? "Buscando processo..." : "Redirecionando..."}
              </p>
            </div>
          )}
        </div>
      </main>

      {showScrollTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-2xl shadow-xl p-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          title="Ir para o topo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className="group-hover:scale-110 transition-transform"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {/* Modal para inserir processo */}
      <InsertProcessModal
        isOpen={isInsertModalOpen}
        onClose={handleCloseInsertModal}
        onSubmit={handleInsertProcess}
      />
    </div>
  );
}
