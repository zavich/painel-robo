"use client";
import { format, startOfDay, subDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

type FilterType = "hoje" | "ontem" | "esta-semana" | "personalizado";

interface DateFilterProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("hoje");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(value);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const quickFilters = [
    {
      key: "hoje" as FilterType,
      label: "Hoje",
      getRange: () => ({
        from: startOfDay(new Date()),
        to: startOfDay(new Date()),
      }),
    },
    {
      key: "ontem" as FilterType,
      label: "Ontem",
      getRange: () => ({
        from: subDays(startOfDay(new Date()), 1),
        to: subDays(startOfDay(new Date()), 1),
      }),
    },
    {
      key: "esta-semana" as FilterType,
      label: "Esta semana",
      getRange: () => ({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: new Date(),
      }),
    },
  ];

  const handleQuickFilter = (filterType: FilterType) => {
    setActiveFilter(filterType);
    const filter = quickFilters.find((f) => f.key === filterType);
    if (filter) {
      const range = filter.getRange();
      setDateRange(range);
      onChange?.(range);
    }
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    setDateRange(range);
    setActiveFilter("personalizado");
    onChange?.(range);
    if (range?.from && range?.to) {
      setIsCustomOpen(false);
    }
  };

  const getDisplayText = () => {
    if (activeFilter === "personalizado" && dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(
          dateRange.to,
          "dd/MM",
          { locale: ptBR }
        )}`;
      }
      return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    }

    const activeQuickFilter = quickFilters.find((f) => f.key === activeFilter);
    return activeQuickFilter?.label || "Selecionar período";
  };

  useEffect(() => {
    if (value) {
      setDateRange(value);
    }
  }, [value]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {quickFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickFilter(filter.key)}
            className={cn(
              "h-8 px-3 text-sm font-medium transition-all duration-200",
              activeFilter === filter.key
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-900 hover:bg-gray-300 hover:text-white"
            )}
          >
            {filter.label}
          </Button>
        ))}

        {/* Custom Date Range */}
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-sm font-medium transition-all duration-200",
                activeFilter === "personalizado"
                  ? "bg-filter-active text-filter-active-foreground shadow-sm"
                  : "text-filter-inactive-foreground hover:bg-filter-inactive hover:text-foreground"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              {activeFilter === "personalizado"
                ? getDisplayText()
                : "Personalizado"}
              <ChevronDownIcon className="h-3 w-3 ml-1.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleCustomRange}
              numberOfMonths={2}
              locale={ptBR}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
