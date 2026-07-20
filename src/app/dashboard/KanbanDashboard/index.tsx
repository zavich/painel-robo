import { useLawsuit } from "@/app/api/hooks/lawsuit/useLawsuit";
import { useInsertLawsuit } from "@/app/api/hooks/lawsuit/useInsertLawsuit";
import { useFilter } from "@/app/hooks/filter/useFilter";
import { useToast } from "@/app/hooks/use-toast";
import { FiltersBar } from "@/components/FiltersBar";
import { validateCnjNumber } from "@/app/utils/cnjValidation";
import { AlertTriangle, Search } from "lucide-react";
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

  // Assim que a busca no Athena/Redis confirma "não encontrado", garante
  // sozinho (sem clique do usuário) o marcador BUSCANDO em comunicacao-spot
  // — só pra sinalizar a quem lê o S3 direto (ex.: communication-ingestor-
  // juri) que uma busca está para começar; sem custo de captcha, e sem
  // disparar extração nenhuma. Comunicacao-spot não é mais fonte de
  // consulta pra essa tela (só Redis + Athena), então essa chamada nunca
  // "acha" nada aqui — o resultado é sempre o mesmo próximo passo: abrir o
  // detalhe do processo (ver efeito abaixo), que é quem oferece o botão
  // "Buscar processo" (dispara `/search`, nunca automático a partir daqui).
  useEffect(() => {
    if (!notFound || insertAttemptedFor === debouncedSearch) {
      return;
    }

    setInsertAttemptedFor(debouncedSearch);

    insertLawsuitMutation.mutate(debouncedSearch, {
      onError: () => {
        toast({
          title: "Erro ao verificar comunicacao-spot",
          description:
            "Ocorreu um erro ao verificar/inserir o processo em comunicacao-spot.",
          variant: "destructive",
        });
      },
    });
  }, [notFound, debouncedSearch, insertAttemptedFor, insertLawsuitMutation, toast]);

  // Enquanto isso for falso, ainda estamos checando o Athena/Redis e/ou
  // garantindo o marcador em comunicacao-spot pra essa busca — mostra
  // loading. Só depois disso é que dá pra seguir pro detalhe do processo.
  const insertCheckSettled =
    notFound &&
    insertAttemptedFor === debouncedSearch &&
    !insertLawsuitMutation.isPending;

  // Nova abordagem: a busca vai direto para o detalhe do processo quando encontrado
  useEffect(() => {
    if (hasSearch && !isLoading && lawsuit) {
      router.push(`/processes/${lawsuit.cnjNumber}`);
    }
  }, [hasSearch, isLoading, lawsuit, router]);

  // Nem o Athena nem o Redis têm esse processo ainda — em vez de travar
  // aqui num beco sem saída, segue o mesmo padrão da tela de detalhes: abre
  // o detalhe do processo, que é quem sabe oferecer o botão "Buscar
  // processo" e mostrar o status de sincronização depois.
  useEffect(() => {
    if (!insertCheckSettled) {
      return;
    }

    toast({
      title: "Processo não encontrado na base",
      description: `Abrindo o detalhe de ${debouncedSearch} para iniciar a busca.`,
    });
    router.push(`/processes/${debouncedSearch}`);
  }, [insertCheckSettled, debouncedSearch, router, toast]);

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
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="h-6 w-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLoading
                  ? "Buscando processo..."
                  : insertCheckSettled
                    ? "Processo não encontrado na base — abrindo o detalhe para buscar..."
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
