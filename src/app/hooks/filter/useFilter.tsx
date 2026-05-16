"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterState = {
  [key: string]: string | number | boolean | string[] | null | undefined;
};

type FilterContextType = {
  filters: FilterState;
  setFilter: (
    key: string,
    value: string | number | boolean | string[] | null | undefined,
  ) => void;
  resetFilters: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const DEFAULT_FILTERS: FilterState = {
  limit: 10,
  status: "all",
  type: "all",
  search: "",
  startDate: undefined,
  endDate: undefined,
  stageDateFrom: undefined,
  stageDateTo: undefined,
  lossReason: "all",
  contentFilter: "all",
  emptyDocuments: false,
  emptyInstances: false,
  hasNewMovementsNow: false,
  hasSecondInstance: false,
  hasAutos: false,
  hasAcordao: false,
};

function serializeFiltersToSearchParams(filters: FilterState) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // don't persist defaults to keep URL clean
    const defaultValue = (DEFAULT_FILTERS as any)[key];
    if (defaultValue !== undefined && value === defaultValue) return;

    if (typeof value === "boolean") {
      params.set(key, value ? "true" : "false");
    } else if (value instanceof Date) {
      params.set(key, value.toISOString());
    } else {
      params.set(key, String(value));
    }
  });
  return params;
}

function parseValueFromParam(key: string, value: string | null) {
  if (value === null) return undefined;
  // Known boolean keys
  const booleanKeys = new Set([
    "emptyDocuments",
    "emptyInstances",
    "hasNewMovementsNow",
    "hasSecondInstance",
    "hasAutos",
    "hasAcordao",
  ]);

  const dateKeys = new Set([
    "startDate",
    "endDate",
    "stageDateFrom",
    "stageDateTo",
  ]);

  if (booleanKeys.has(key)) {
    return value === "true";
  }

  if (dateKeys.has(key)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  return value;
}

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Synchronous initialization a partir da query string para evitar
  // hidratação diferente entre servidor e cliente.
  const computeInitialFilters = (): FilterState => {
    try {
      const params = searchParams;
      if (!params) return { ...DEFAULT_FILTERS };

      const newFilters: FilterState = { ...DEFAULT_FILTERS };
      for (const key of params.keys()) {
        const val = params.get(key);
        const parsed = parseValueFromParam(key, val);
        if (parsed !== undefined) {
          newFilters[key] = parsed;
        }
      }

      return { ...DEFAULT_FILTERS, ...newFilters };
    } catch (err) {
      return { ...DEFAULT_FILTERS };
    }
  };

  const [filters, setFilters] = useState<FilterState>(() => ({
    limit: 10,
    status: "all",
    type: "all",
    lossReason: "all",
    contentFilter: "all",
    ...computeInitialFilters(),
  }));

  // Função que sincroniza o estado atual de filtros para a URL sem criar histórico
  const syncFiltersToUrl = (nextFilters: FilterState) => {
    try {
      if (typeof window === "undefined") return;
      const params = serializeFiltersToSearchParams(nextFilters);
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : `${pathname}`;
      // Use router.replace quando disponível, senão fallback para history.replaceState
      if (router && typeof (router as any).replace === "function") {
        (router as any)?.replace(url);
      } else {
        window.history.replaceState(null, "", url);
      }
    } catch (err) {
      // ignore
      console.error("Erro ao sincronizar filtros para URL", err);
    }
  };

  // Sincroniza a URL sempre que os filtros mudarem, mas pula a primeira renderização
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    syncFiltersToUrl(filters);
  }, [filters, pathname, router]);

  const setFilter = (
    key: string,
    value: string | number | boolean | string[] | null | undefined,
  ) => {
    // Apenas atualiza o estado aqui; a sincronização com a URL
    // será feita no useEffect acima para evitar atualizações de rota
    // durante a renderização (evita o erro do React).
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    // Atualiza apenas o estado; o efeito cuidará de limpar a query string.
    setFilters({ ...DEFAULT_FILTERS });
  };

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
