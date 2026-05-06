import { createContext, ReactNode, useContext, useState } from "react";

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

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>({
    limit: 10,
    status: "all",
    type: "all",
    lossReason: "all",
    contentFilter: "all",
  });

  const setFilter = (
    key: string,
    value: string | number | boolean | string[] | null | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
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
    });
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
