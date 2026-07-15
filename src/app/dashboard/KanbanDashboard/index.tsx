import { useLawsuit } from "@/app/api/hooks/lawsuit/useLawsuit";
import { useInsertLawsuit } from "@/app/api/hooks/lawsuit/useInsertLawsuit";
import { useFilter } from "@/app/hooks/filter/useFilter";
import { useToast } from "@/app/hooks/use-toast";
import { FiltersBar } from "@/components/FiltersBar";
import { validateCnjNumber } from "@/app/utils/cnjValidation";
import { AlertTriangle, Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function KanbanDashboard() {
  const { filters, setFilter, resetFilters } = useFilter();
  const router = useRouter();
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
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

  // Valida o formato/dígito verificador CNJ antes de disparar a consulta —
  // evita gastar uma query no Athena (lenta e cara) com número incompleto ou
  // digitado errado, e permite distinguir esse caso de "não existe na base".
  const cnjValidation = useMemo(
    () => validateCnjNumber(debouncedSearch),
    [debouncedSearch],
  );
  const isCnjValid = hasSearch && cnjValidation.isValid;

  const { data: lawsuit, isLoading } = useLawsuit(debouncedSearch, {
    enabled: isCnjValid,
  });

  const notFound = isCnjValid && !isLoading && !lawsuit;

  const insertLawsuitMutation = useInsertLawsuit();

  // Lembra pra qual busca já disparamos o insert automático, pra não repetir
  // a cada re-render (e pra permitir disparar de novo se o usuário buscar um
  // número diferente).
  const [insertAttemptedFor, setInsertAttemptedFor] = useState<string | null>(
    null,
  );

  // Assim que a busca no Athena confirma "não encontrado", verifica sozinho
  // (sem clique do usuário) se já existe dado real em comunicacao-spot (de
  // outro coletor, nunca migrado pro Athena). Se existir, o backend já joga
  // esse JSON pro cache no Redis e aqui a gente só redireciona — igual à
  // busca normal quando o processo já existe. Se não existir, só grava o
  // marcador BUSCANDO (sem custo de captcha) e mostra "não encontrado".
  useEffect(() => {
    if (!notFound || insertAttemptedFor === debouncedSearch) {
      return;
    }

    setInsertAttemptedFor(debouncedSearch);

    insertLawsuitMutation.mutate(debouncedSearch, {
      onSuccess: (result) => {
        if (result.cached) {
          toast({
            title: "Processo encontrado em comunicacao-spot",
            description: `O processo ${debouncedSearch} já tinha dado salvo — abrindo o detalhe.`,
          });
          router.push(`/processes/${debouncedSearch}`);
        }
      },
      onError: () => {
        toast({
          title: "Erro ao verificar comunicacao-spot",
          description:
            "Ocorreu um erro ao verificar/inserir o processo em comunicacao-spot.",
          variant: "destructive",
        });
      },
    });
  }, [notFound, debouncedSearch, insertAttemptedFor, insertLawsuitMutation, router, toast]);

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

  // Enquanto isso for falso, ainda estamos checando o Athena e/ou o
  // comunicacao-spot pra essa busca — mostra loading. Só depois disso é que
  // dá pra afirmar "não encontrado" de fato (nem no Athena, nem em
  // comunicacao-spot) sem nenhuma ação do usuário.
  const insertCheckSettled =
    notFound &&
    insertAttemptedFor === debouncedSearch &&
    !insertLawsuitMutation.isPending;
  const willRedirectFromCache =
    insertCheckSettled && insertLawsuitMutation.data?.cached;
  const genuinelyNotFound = insertCheckSettled && !willRedirectFromCache;

  return (
    <div>
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-8 bg-gradient-to-b from-background via-background to-muted/30">
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
          ) : !cnjValidation.isValid ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Número do processo incompleto ou digitado incorretamente
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                {cnjValidation.reason === "incomplete"
                  ? "O número precisa ter os 20 dígitos do padrão CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO). Confira se não faltou ou sobrou algum dígito."
                  : "O dígito verificador não confere com o restante do número — provavelmente algum dígito foi digitado errado. Confira o número e tente novamente."}
              </p>
            </div>
          ) : genuinelyNotFound ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <SearchX className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processo não encontrado
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                O número &quot;{debouncedSearch}&quot; está em um formato
                válido, mas nenhum processo foi encontrado com ele em nossa
                base.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="h-6 w-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLoading
                  ? "Buscando processo..."
                  : notFound
                    ? "Verificando comunicacao-spot..."
                    : "Redirecionando..."}
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
    </div>
  );
}
